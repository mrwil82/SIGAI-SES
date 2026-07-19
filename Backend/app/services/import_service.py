import pandas as pd
import io
import re
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from fastapi import UploadFile, HTTPException

from app.models.inventory import Item, StockBulk, Activo
from app.models.business import Cliente, Proyecto
from app.models.guarantees import Garantia

logger = logging.getLogger(__name__)

class ImportService:
    @staticmethod
    def _clean(val, default=None):
        if val is None:
            return default
        try:
            import math
            if math.isnan(float(val)):
                return default
        except (TypeError, ValueError):
            pass
        s = str(val).strip()
        return s if s and s.lower() not in ("nan", "none", "") else default

    @staticmethod
    def _to_float(val, default=0.0):
        try:
            result = float(val)
            import math
            return default if math.isnan(result) or math.isinf(result) else result
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _to_date(val):
        if val is None:
            return None
        if isinstance(val, (datetime,)):
            return val.date()
        try:
            return pd.to_datetime(val).date()
        except Exception:
            return None

    @staticmethod
    def _categoria_from_sheet(sheet_name) -> str:
        s = str(sheet_name).upper()
        if "HERRAMIENTA" in s: return "HERRAMIENTA_LAB"
        if "MONITOREO" in s: return "MONITOREO"
        if "MANTENIMIENTO" in s: return "MANTENIMIENTO"
        if "INSTALACION" in s or "ESTANTE" in s or "ESCRITORIO" in s: return "INSTALACION"
        if "SOLUCIONES" in s: return "SOLUCIONES"
        if "CONSUMIBLE" in s or "ELKIN" in s or "CAJA" in s: return "CONSUMIBLE"
        return "INSTALACION"

    async def _upsert_item_and_stock(
        self,
        db: AsyncSession,
        nombre: str,
        referencia: Optional[str],
        codigo: Optional[str],
        marca: Optional[str],
        categoria: str,
        sub_categoria: Optional[str],
        cantidad: float,
        stock_min: int,
        compra_max: int,
        always_create_new: bool = False,
    ) -> Item:
        ref = self._clean(referencia)
        cod = self._clean(codigo)

        def _slug(s: str) -> Optional[str]:
            s = (s or "").upper()
            s = re.sub(r"[^A-Z0-9]+", "_", s)
            return s.strip("_")[:60] or None

        if not ref and nombre: ref = _slug(nombre)
        if not cod and not ref and nombre: cod = _slug(nombre)

        if not always_create_new:
            result = await db.execute(
                select(Item).where(
                    (Item.referencia == ref) |
                    (Item.codigo_item_interno == cod) |
                    (Item.nombre_equipo == nombre)
                )
            )
            existing = result.scalars().first()
            if existing:
                # Usar update para el stock
                await db.execute(
                    update(StockBulk)
                    .where(StockBulk.id_item == existing.id_item)
                    .values(cantidad_actual=cantidad)
                )
                return existing

        generated_code = cod or _slug(nombre) or f"ITEM_{int(datetime.utcnow().timestamp())}"
        candidate_code = generated_code
        suffix = 1
        while True:
            res = await db.execute(select(Item).where(Item.codigo_item_interno == candidate_code))
            if not res.scalars().first(): break
            candidate_code = f"{generated_code}_{suffix}"
            suffix += 1
        
        item = Item(
            nombre_equipo=nombre or "N/A",
            referencia=ref or candidate_code,
            codigo_item_interno=candidate_code,
            marca=marca,
            categoria=categoria,
            sub_categoria=sub_categoria,
            stock_minimo=stock_min,
            compra_maxima=compra_max,
        )
        db.add(item)
        await db.flush()
        db.add(StockBulk(id_item=item.id_item, cantidad_actual=cantidad))
        return item

    async def process_excel(self, file: UploadFile, db: AsyncSession) -> Dict[str, Any]:
        filename = (file.filename or "").lower()
        contents = await file.read()
        try:
            xl = pd.ExcelFile(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"No se pudo leer el Excel: {e}")

        # Detectar tipo para validación
        tipo = ""
        if "inventario_laboratorio" in filename: tipo = "inventario_laboratorio"
        elif "formato_inventario" in filename or "clientes_corporativos" in filename: tipo = "formato_inventario_clientes"
        elif "asignacion" in filename or "garantia" in filename: tipo = "asignacion_numero"
        
        errors = self.validate_structure(xl, tipo)
        if errors:
            raise HTTPException(status_code=400, detail={"mensaje": "Estructura de Excel inválida", "errores": errors})

        if tipo == "inventario_laboratorio":
            return await self._procesar_inventario_laboratorio(xl, db)
        elif tipo == "formato_inventario_clientes":
            return await self._procesar_inventario_clientes(xl, db)
        elif tipo == "asignacion_numero":
            return await self._procesar_garantias(xl, db)
        else:
            raise HTTPException(status_code=400, detail="Tipo de archivo no reconocido")

    async def _procesar_inventario_laboratorio(self, xl: pd.ExcelFile, db: AsyncSession, id_proyecto: Optional[int] = None):
        items_creados = 0
        activos_creados = 0

        for sheet_name in xl.sheet_names:
            df = xl.parse(sheet_name)
            df.columns = [str(c).strip() for c in df.columns]

            def find_col(keywords):
                cols_upper = [str(c).upper() for c in df.columns]
                for kw in keywords:
                    for i, c in enumerate(cols_upper):
                        if kw.upper() in c:
                            return df.columns[i]
                return None

            desc_col = find_col(["DESCRIPCION", "DESCRIPCIÓN"])
            modelo_col = find_col(["MODELO", "REFERENCIA"])
            marca_col = find_col(["MARCA"])
            cantidad_col = find_col(["CANTIDAD"])
            ubicacion_col = find_col(["UBICACI"])
            estado_col = find_col(["ESTADO"])
            codigo_col = find_col(["CODIGO"])
            activo_fijo_col = find_col(["ACTIVO FIJO"])

            if not desc_col: continue

            categoria = self._categoria_from_sheet(sheet_name)

            for _, row in df.iterrows():
                nombre = self._clean(row.get(desc_col))
                if not nombre: continue

                modelo = self._clean(row.get(modelo_col)) if modelo_col else None
                marca = self._clean(row.get(marca_col)) if marca_col else None
                cantidad = self._to_float(row.get(cantidad_col, 0) if cantidad_col else 0)
                ubicacion = self._clean(row.get(ubicacion_col)) if ubicacion_col else None
                codigo = self._clean(row.get(codigo_col)) if codigo_col else None
                activo_fijo = self._clean(row.get(activo_fijo_col)) if activo_fijo_col else None

                estado_raw = self._clean(row.get(estado_col)) if estado_col else None
                condicion_map = {
                    "NUEVO": "NUEVO",
                    "BUEN ESTADO": "USADO_BUENO",
                    "USADO BUEN ESTADO": "USADO_BUENO",
                    "BUENO": "USADO_BUENO",
                    "PARA REPARAR": "PARA_REPARAR",
                    "SULFATADO": "SULFATADO",
                    "DAÑADO": "DAÑADO",
                    "DESMONTE": "USADO_BUENO",
                }
                condicion = "NUEVO"
                if estado_raw:
                    condicion = condicion_map.get(estado_raw.upper().strip(), "NUEVO")

                item = await self._upsert_item_and_stock(
                    db=db, nombre=nombre, referencia=modelo, codigo=codigo,
                    marca=marca, categoria=categoria, sub_categoria=str(sheet_name).strip(),
                    cantidad=cantidad, stock_min=2, compra_max=10
                )
                items_creados += 1

                if ubicacion:
                    serial_final = f"{(modelo or nombre)[:15].replace(' ','_').upper()}-LAB-{activo_fijo or 'SIN_AF'}"
                    res = await db.execute(select(Activo).where(Activo.serial == serial_final))
                    if not res.scalars().first():
                        db.add(Activo(
                            id_item=item.id_item, serial=serial_final, estado_actual="LABORATORIO",
                            condicion_fisica=condicion, ubicacion_fisica=ubicacion,
                            activo_fijo_securitas=activo_fijo, area_asignada="LABORATORIO",
                            id_proyecto_actual=id_proyecto
                        ))
                        activos_creados += 1

            await db.flush()
        return {"items": items_creados, "activos": activos_creados}

    async def _procesar_inventario_clientes(self, xl: pd.ExcelFile, db: AsyncSession):
        HOJAS_DATOS = ["Inventario Procafecol", "Inventario ISIMO", "Inventario Alsea", "Inventario Arcos Dorados", "Inventario Consolidado"]
        items_creados = 0
        for sheet_name in xl.sheet_names:
            if sheet_name not in HOJAS_DATOS: continue
            df = xl.parse(sheet_name, header=1)
            df.columns = [str(c).strip() for c in df.columns]
            item_col = next((c for c in df.columns if "ITEM" in str(c).upper()), None)
            if not item_col: continue
            for _, row in df.iterrows():
                nombre = self._clean(row.get(item_col))
                if not nombre or nombre.upper() in ("ITEM", "NAN"): continue
                await self._upsert_item_and_stock(
                    db=db, nombre=nombre, referencia=self._clean(row.get("REFERENCIA")),
                    codigo=self._clean(row.get("CÓDIGO")), marca=self._clean(row.get("MARCA")),
                    categoria="MONITOREO", sub_categoria=sheet_name,
                    cantidad=self._to_float(row.get("STOCK ACTUAL", 0)),
                    stock_min=5, compra_max=20, always_create_new=True
                )
                items_creados += 1
        return {"items": items_creados}

    async def _procesar_garantias(self, xl: pd.ExcelFile, db: AsyncSession):
        garantias_creadas = 0
        if "GARANTIAS" in xl.sheet_names:
            df = xl.parse("GARANTIAS", header=1)
            df.columns = [str(c).strip() for c in df.columns]
            for _, row in df.iterrows():
                caso = self._clean(row.get("NUMERO DE CASO"))
                if not caso or caso.upper() in ("NUMERO DE CASO", "NAN"): continue
                garantias_creadas += 1
        return {"garantias": garantias_creadas}

    def validate_structure(self, xl: pd.ExcelFile, tipo: str) -> List[str]:
        errors = []
        if tipo == "inventario_laboratorio":
            if not any("INVENTARIO" in str(s).upper() or "STOCK" in str(s).upper() for s in xl.sheet_names):
                errors.append("No se encontró ninguna hoja de INVENTARIO o STOCK.")
        elif tipo == "formato_inventario_clientes":
            required_sheets = ["Inventario Procafecol", "Inventario Consolidado"]
            for s in required_sheets:
                if s not in xl.sheet_names:
                    errors.append(f"Falta la hoja obligatoria: {s}")
        return errors

import_service = ImportService()
