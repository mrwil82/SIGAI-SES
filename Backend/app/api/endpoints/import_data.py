from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, update
import pandas as pd
import io
import logging
import re
from datetime import datetime
from typing import Optional, Dict, Any, List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.inventory import Item, Activo, StockBulk
from app.models.guarantees import Garantia

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================
# Funciones auxiliares para limpieza y transformación de datos
# ============================================================

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


def _to_float(val, default=0.0):
    try:
        result = float(val)
        import math
        return default if math.isnan(result) or math.isinf(result) else result
    except (TypeError, ValueError):
        return default


def _to_date(val):
    if val is None:
        return None
    if isinstance(val, (datetime,)):
        return val.date()
    try:
        return pd.to_datetime(val).date()
    except Exception:
        return None


def _categoria_from_sheet(sheet_name) -> str:
    s = str(sheet_name).upper()
    if "HERRAMIENTA" in s:
        return "HERRAMIENTA_LAB"
    if "MONITOREO" in s:
        return "MONITOREO"
    if "MANTENIMIENTO" in s:
        return "MANTENIMIENTO"
    if "INSTALACION" in s or "ESTANTE" in s or "ESCRITORIO" in s:
        return "INSTALACION"
    if "SOLUCIONES" in s:
        return "SOLUCIONES"
    if "CONSUMIBLE" in s or "ELKIN" in s or "CAJA" in s:
        return "CONSUMIBLE"
    return "INSTALACION"


def _slug(s: str) -> Optional[str]:
    """Convierte texto a slug en MAYÚSCULAS, máximo 50 chars (deja espacio para sufijos)."""
    if not s:
        return None
    s = s.upper()
    s = re.sub(r"[^A-Z0-9]+", "_", s)
    s = s.strip("_")[:50]
    return s or None


# ============================================================
# UPSERT: crea o actualiza un Item y su StockBulk
# ============================================================

async def _upsert_item_and_stock(
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
    """
    Crea un Item nuevo o reutiliza uno existente.
    - Si always_create_new=False -> busca por referencia/codigo/nombre y si existe, solo actualiza stock.
    - Si always_create_new=True -> SIEMPRE crea uno nuevo, agregando sufijos si hay duplicados.
    """

    ref = _clean(referencia)
    cod = _clean(codigo)

    if not ref and nombre:
        ref = _slug(nombre)
    if not cod and not ref and nombre:
        cod = _slug(nombre)

    # SIEMPRE verificar duplicados de referencia (incluso cuando always_create_new=True)
    if always_create_new and ref:
        base_ref = ref[:40]
        candidate_ref = base_ref
        suffix = 1
        while True:
            try:
                res = await db.execute(
                    select(Item).where(Item.referencia == candidate_ref)
                )
                if not res.scalars().first():
                    break
            except Exception:
                break

            candidate_ref = f"{base_ref}_{suffix}"
            suffix += 1
            if suffix > 999:
                candidate_ref = f"{base_ref[:30]}_{int(datetime.utcnow().timestamp())}"
                break
        ref = candidate_ref

    # Si NO es always_create_new, buscar uno existente
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
            await db.execute(
                update(StockBulk)
                .where(StockBulk.id_item == existing.id_item)
                .values(cantidad_actual=cantidad)
            )
            return existing

    # Generar codigo_item_interno único
    generated_code = (
        cod
        or _slug(nombre)
        or f"ITEM_{int(datetime.utcnow().timestamp())}"
    )
    base_code = generated_code[:40]
    candidate_code = base_code
    suffix = 1
    while True:
        try:
            res = await db.execute(
                select(Item).where(Item.codigo_item_interno == candidate_code)
            )
            if not res.scalars().first():
                break
        except Exception:
            break

        candidate_code = f"{base_code}_{suffix}"
        suffix += 1
        if suffix > 999:
            candidate_code = f"{base_code[:30]}_{int(datetime.utcnow().timestamp())}"
            break

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


# ============================================================
# Procesadores por archivo
# ============================================================

async def _procesar_inventario_laboratorio(
    xl: pd.ExcelFile,
    db: AsyncSession,
    id_proyecto: Optional[int] = None,
    id_cliente: Optional[int] = None,
):
    """
    Procesa Inventario_laboratorio.xlsx
    """
    items_creados = 0
    activos_creados = 0

    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        df.columns = [str(c).strip() for c in df.columns]

        desc_col = next(
            (c for c in df.columns if "DESCRIPCION" in c.upper() or "DESCRIPCIÓN" in c.upper()),
            None,
        )
        modelo_col = next(
            (c for c in df.columns if c.upper() in ("MODELO", "REFERENCIA")),
            None,
        )
        marca_col = next(
            (c for c in df.columns if "MARCA" in c.upper()),
            None,
        )
        cantidad_col = next(
            (c for c in df.columns if "CANTIDAD" in c.upper()),
            None,
        )
        ubicacion_col = next(
            (c for c in df.columns if "UBICACI" in c.upper()),
            None,
        )
        estado_col = next(
            (c for c in df.columns if c.upper() == "ESTADO"),
            None,
        )
        codigo_col = next(
            (c for c in df.columns if c.upper() == "CODIGO"),
            None,
        )
        activo_fijo_col = next(
            (c for c in df.columns if "ACTIVO" in c.upper() and "FIJO" in c.upper()),
            None,
        )

        if not desc_col:
            logger.warning(f"Hoja '{sheet_name}' sin columna de descripción, omitida.")
            continue

        categoria = _categoria_from_sheet(sheet_name)

        for _, row in df.iterrows():
            nombre = _clean(row.get(desc_col))
            if not nombre:
                continue

            modelo = _clean(row.get(modelo_col)) if modelo_col else None
            marca = _clean(row.get(marca_col)) if marca_col else None
            cantidad = _to_float(row.get(cantidad_col, 0) if cantidad_col else 0)
            ubicacion = _clean(row.get(ubicacion_col)) if ubicacion_col else None
            codigo = _clean(row.get(codigo_col)) if codigo_col else None
            activo_fijo = _clean(row.get(activo_fijo_col)) if activo_fijo_col else None

            # Estado / condición física del activo
            estado_raw = _clean(row.get(estado_col)) if estado_col else None
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

            item = await _upsert_item_and_stock(
                db=db,
                nombre=nombre,
                referencia=modelo,
                codigo=codigo,
                marca=marca,
                categoria=categoria,
                sub_categoria=str(sheet_name).strip(),
                cantidad=cantidad,
                stock_min=2,
                compra_max=10,
            )
            items_creados += 1

            # Crear Activo con serial sintético
            if ubicacion:
                serial_base = f"{(modelo or nombre)[:15].replace(' ','_').upper()}-LAB"
                serial_final = f"{serial_base}-{activo_fijo or 'SIN_AF'}"

                res = await db.execute(
                    select(Activo).where(Activo.serial == serial_final)
                )
                if not res.scalars().first():
                    observaciones = f"Importado desde hoja: {sheet_name}"
                    if id_cliente is not None:
                        observaciones += f" | Cliente ID: {id_cliente}"

                    activo = Activo(
                        id_item=item.id_item,
                        serial=serial_final,
                        estado_actual="LABORATORIO",
                        condicion_fisica=condicion,
                        ubicacion_fisica=ubicacion,
                        activo_fijo_securitas=activo_fijo,
                        area_asignada="LABORATORIO",
                        id_proyecto_actual=id_proyecto,
                        observaciones=observaciones,
                    )
                    db.add(activo)
                    activos_creados += 1

        await db.flush()
        logger.info(f"Hoja '{sheet_name}': procesada.")

    return {"items": items_creados, "activos": activos_creados}


async def _procesar_inventario_clientes(xl: pd.ExcelFile, db: AsyncSession):
    """
    Procesa Formato_Inventario_Clientes_*.xlsx
    """
    HOJAS_DATOS = [
        "Inventario Procafecol",
        "Inventario ISIMO",
        "Inventario Alsea",
        "Inventario Arcos Dorados",
        "Inventario Consolidado",
    ]
    items_creados = 0

    for sheet_name in xl.sheet_names:
        if sheet_name not in HOJAS_DATOS:
            continue

        df = xl.parse(sheet_name, header=1)
        df.columns = [str(c).strip() for c in df.columns]

        def find_col(keywords):
            cols_upper = [c.upper() for c in df.columns]
            for kw in keywords:
                kw_up = kw.upper()
                for i, c in enumerate(cols_upper):
                    if c == kw_up:
                        return df.columns[i]
            for kw in keywords:
                kw_up = kw.upper()
                for i, c in enumerate(cols_upper):
                    if kw_up in c:
                        return df.columns[i]
            return None

        codigo_col = find_col(["CÓDIGO", "CODIGO"])
        item_col = find_col(["ITEM"])
        marca_col = find_col(["MARCA"])
        ref_col = find_col(["REFERENCIA"])
        stock_col = find_col(["STOCK ACTUAL", "STOCK"])
        recompra_col = find_col(["PUNTO DE RECOMPRA"])
        compra_col = find_col(["COMPRA MÁXIMA", "COMPRA MAXIMA"])
        cliente_col = find_col(["CORPORATIVO"])
        sistema_col = find_col(["SISTEMA"])

        if not item_col:
            logger.warning(f"Hoja '{sheet_name}' sin columna ITEM, omitida.")
            continue

        for _, row in df.iterrows():
            nombre = _clean(row.get(item_col))
            if not nombre or nombre.upper() in ("ITEM", "NAN"):
                continue

            codigo = _clean(row.get(codigo_col)) if codigo_col else None
            if codigo:
                try:
                    codigo = str(int(float(codigo)))
                except ValueError:
                    pass

            referencia = _clean(row.get(ref_col)) if ref_col else None
            if referencia:
                referencia = referencia.strip().lstrip("\t")

            marca = _clean(row.get(marca_col)) if marca_col else None
            stock_actual = _to_float(row.get(stock_col, 0) if stock_col else 0)
            punto_recompra = _to_float(row.get(recompra_col, 0) if recompra_col else 0)
            compra_max = int(_to_float(row.get(compra_col, 20) if compra_col else 20)) or 20

            sistema = _clean(row.get(sistema_col)) if sistema_col else None
            cat_map = {
                "CCTV": "MONITOREO",
                "ALARMA": "MONITOREO",
                "MANTENIMIENTO": "MANTENIMIENTO",
                "INSTALACION": "INSTALACION",
            }
            categoria = cat_map.get((sistema or "").upper(), "MONITOREO")

            await _upsert_item_and_stock(
                db=db,
                nombre=nombre,
                referencia=referencia,
                codigo=codigo,
                marca=marca,
                categoria=categoria,
                sub_categoria=sistema,
                cantidad=stock_actual,
                stock_min=int(punto_recompra) if punto_recompra else 5,
                compra_max=compra_max,
                always_create_new=True,
            )
            items_creados += 1

        await db.flush()
        logger.info(f"Hoja '{sheet_name}': procesada.")

    return {"items": items_creados}


async def _procesar_garantias(xl: pd.ExcelFile, db: AsyncSession):
    """
    Procesa ASIGNACION_NUMERO_DE_CASO_*.xlsx
    """
    garantias_creadas = 0
    items_stock_creados = 0

    # Hoja GARANTIAS
    if "GARANTIAS" in xl.sheet_names:
        df = xl.parse("GARANTIAS", header=1)
        df.columns = [str(c).strip() for c in df.columns]

        ESTADO_MAP = {
            "CASO FINALIZADO": "ENTREGADO_CLIENTE",
            "ENVIADO A PROVEEDOR": "ENVIADO_PROVEEDOR",
            "RECIBIDO DE PROVEEDOR": "RECIBIDO_PROVEEDOR",
            "EN PROCESO": "ENVIADO_PROVEEDOR",
            "RESUELTO": "RESUELTO_REEMPLAZADO",
        }

        def find_col(df, *keywords):
            for kw in keywords:
                for c in df.columns:
                    if kw.upper() in c.upper():
                        return c
            return None

        caso_col = find_col(df, "NUMERO DE CASO")
        serial_col = find_col(df, "SERIAL")
        ref_col = find_col(df, "REFERENCIA DE EQUIPO")
        desc_col = find_col(df, "DESCRIPCIÓN DE EQUIPO", "DESCRIPCION")
        falla_col = find_col(df, "FALLA")
        rma_col = find_col(df, "RMA")
        factura_col = find_col(df, "NUMERO DE FACTURA")
        envio_col = find_col(df, "FECHA DE ENVIO")
        recibido_col = find_col(df, "FECHA DE  RECIBIDO", "FECHA RECIBIDO")
        estado_col = find_col(df, "ESTADO DEL CASO")
        comentario_col = find_col(df, "COMENTARIOS DEL PROCESO")
        credencial_col = find_col(df, "CREDENCIALES", "IP/CLAVES")
        area_col = find_col(df, "AREA", "ÁREA")
        meses_col = find_col(df, "MESES")

        for _, row in df.iterrows():
            caso = _clean(row.get(caso_col)) if caso_col else None
            if not caso or caso.upper() in ("NUMERO DE CASO", "NAN"):
                continue

            serial = _clean(row.get(serial_col)) if serial_col else None
            if not serial:
                continue

            res = await db.execute(select(Activo).where(Activo.serial == serial))
            activo = res.scalars().first()

            if not activo:
                nombre = _clean(row.get(desc_col)) if desc_col else "EQUIPO GARANTIA"
                referencia = _clean(row.get(ref_col)) if ref_col else None
                item = await _upsert_item_and_stock(
                    db=db,
                    nombre=nombre or "EQUIPO GARANTIA",
                    referencia=referencia,
                    codigo=None,
                    marca=None,
                    categoria="MONITOREO",
                    sub_categoria="GARANTIA",
                    cantidad=0,
                    stock_min=1,
                    compra_max=5,
                )
                activo = Activo(
                    id_item=item.id_item,
                    serial=serial,
                    estado_actual="EN_GARANTIA",
                    condicion_fisica="PARA_REPARAR",
                    area_asignada="LABORATORIO",
                    observaciones=f"Creado desde garantía {caso}",
                )
                db.add(activo)
                await db.flush()
            else:
                setattr(activo, "estado_actual", "EN_GARANTIA")

            estado_raw = _clean(row.get(estado_col)) if estado_col else None
            estado_garantia = "REGISTRADO"
            if estado_raw:
                for k, v in ESTADO_MAP.items():
                    if k in estado_raw.upper():
                        estado_garantia = v
                        break

            res2 = await db.execute(
                select(Garantia).where(Garantia.numero_caso_interno == caso)
            )
            if res2.scalars().first():
                continue

            garantia = Garantia(
                id_activo=activo.id_activo,
                numero_caso_interno=caso,
                rma_proveedor=_clean(row.get(rma_col)) if rma_col else None,
                numero_factura_compra=_clean(row.get(factura_col)) if factura_col else None,
                fecha_envio=_to_date(row.get(envio_col)) if envio_col else None,
                fecha_recibido_reparado=_to_date(row.get(recibido_col)) if recibido_col else None,
                credenciales_equipo=_clean(row.get(credencial_col)) if credencial_col else None,
                area_origen=_clean(row.get(area_col)) if area_col else None,
                meses_garantia=int(_to_float(row.get(meses_col, 0))) if meses_col else None,
                falla_reportada=_clean(row.get(falla_col)) if falla_col else None,
                comentarios_proceso=_clean(row.get(comentario_col)) if comentario_col else None,
                estado_proceso=estado_garantia,
            )
            db.add(garantia)
            garantias_creadas += 1

        await db.flush()

    # Hojas STOCK
    HOJAS_STOCK = [
        "STOCK MONITOREO",
        "STOCK MANTENIMIENTO",
        "STOCK INSTALACION",
        "STOCK SOLUCIONES",
    ]
    AREA_MAP = {
        "STOCK MONITOREO": "MONITOREO",
        "STOCK MANTENIMIENTO": "MANTENIMIENTO",
        "STOCK INSTALACION": "INSTALACION",
        "STOCK SOLUCIONES": "SOLUCIONES",
    }

    for sheet_name in HOJAS_STOCK:
        if sheet_name not in xl.sheet_names:
            continue
        df = xl.parse(sheet_name)
        df.columns = [str(c).strip() for c in df.columns]

        for _, row in df.iterrows():
            nombre = _clean(row.get("DESCRIPCIÓN DE EQUIPO"))
            if not nombre:
                continue
            referencia = _clean(row.get("REFERENCIA DE EQUIPO"))
            categoria_map = {
                "STOCK MONITOREO": "MONITOREO",
                "STOCK MANTENIMIENTO": "MANTENIMIENTO",
                "STOCK INSTALACION": "INSTALACION",
                "STOCK SOLUCIONES": "SOLUCIONES",
            }
            await _upsert_item_and_stock(
                db=db,
                nombre=nombre,
                referencia=referencia,
                codigo=None,
                marca=None,
                categoria=categoria_map.get(sheet_name, "MONITOREO"),
                sub_categoria="STOCK LABORATORIO",
                cantidad=1,
                stock_min=1,
                compra_max=5,
            )
            items_stock_creados += 1

        await db.flush()
        logger.info(f"Hoja '{sheet_name}': procesada.")

    return {"garantias": garantias_creadas, "items_stock": items_stock_creados}


# ============================================================
# Endpoint principal: detecta el archivo y llama al procesador correcto
# ============================================================

ARCHIVO_TIPO = {
    "inventario_laboratorio": _procesar_inventario_laboratorio,
    "formato_inventario_clientes": _procesar_inventario_clientes,
    "asignacion_numero": _procesar_garantias,
}


def _detectar_tipo(filename: str) -> str | None:
    name = filename.lower().replace(" ", "_").replace("-", "_")
    name = (
        name.replace("á", "a")
        .replace("é", "e")
        .replace("ó", "o")
        .replace("ú", "u")
    )
    if "inventario_laboratorio" in name:
        return "inventario_laboratorio"
    if "formato_inventario" in name or "clientes_corporativos" in name:
        return "formato_inventario_clientes"
    if "asignacion" in name or "garantia" in name or "numero_de_caso" in name:
        return "asignacion_numero"
    return None


@router.post("/excel")
async def import_excel(
    file: UploadFile = File(...),
    id_proyecto: Optional[int] = None,
    id_cliente: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Importa cualquiera de los tres Excel del sistema.
    El tipo se detecta automáticamente por nombre de archivo.
    """
    tipo = _detectar_tipo(file.filename or "")
    if not tipo:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Archivo '{file.filename}' no reconocido. "
                "Sube uno de: Inventario_laboratorio.xlsx, "
                "Formato_Inventario_Clientes_*.xlsx, o "
                "ASIGNACION_NUMERO_DE_CASO_*.xlsx"
            ),
        )

    contents = await file.read()
    try:
        xl = pd.ExcelFile(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el Excel: {e}")

    procesador = ARCHIVO_TIPO[tipo]
    try:
        if tipo == "inventario_laboratorio":
            resultado = await procesador(
                xl, db, id_proyecto=id_proyecto, id_cliente=id_cliente
            )
        else:
            resultado = await procesador(xl, db)

        await db.commit()
        return {
            "mensaje": "Importación completada exitosamente.",
            "archivo": file.filename,
            "tipo_detectado": tipo,
            "resultado": resultado,
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Error importando '{file.filename}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error durante importación: {str(e)}")


# Endpoint legacy (mantiene compatibilidad con frontend existente)
@router.post("/full-system")
async def import_full_system(
    file: UploadFile = File(...),
    id_proyecto: Optional[int] = None,
    id_cliente: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Alias del endpoint /excel para compatibilidad con inventory.ts existente."""
    return await import_excel(
        file=file,
        id_proyecto=id_proyecto,
        id_cliente=id_cliente,
        db=db,
        current_user=current_user,
    )