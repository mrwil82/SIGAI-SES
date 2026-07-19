"""
Locustfile para pruebas de carga con 500 usuarios concurrentes.

Uso:
  locust -f locustfile.py --host=http://localhost:8000 --users=500 --spawn-rate=25 --run-time=5m --headless --html=report.html

  --users=500      -> 500 usuarios simulados concurrentes
  --spawn-rate=25  -> tasa de spawn: 25 usuarios/segundo (tarda ~20s en alcanzar 500)
  --run-time=5m    -> duración de la prueba (opcional, default: sin límite)
  --headless       -> modo sin interfaz web
  --html=report.html -> genera reporte HTML al finalizar

Para modo web (interfaz gráfica):
  locust -f locustfile.py --host=http://localhost:8000
  Luego abrir http://localhost:8089 y configurar: 500 usuarios, 25 spawn rate.
"""

import random
import os

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from locust import HttpUser, task, between  # type: ignore
else:
    try:
        from locust import HttpUser, task, between
    except Exception:
        def task(weight=1):
            def decorator(f):
                return f
            return decorator

        def between(a, b):
            return lambda: a

        class HttpUser:
            wait_time = None
            def __init__(self, *args, **kwargs):
                pass


class SIGAIUser(HttpUser):
    # Tiempo de espera entre peticiones: entre 0.5 y 3 segundos para alta concurrencia
    wait_time = between(0.5, 3)

    token = None
    headers = None
    activo_ids = []
    cliente_ids = []

    def on_start(self):
        """
        Inicia sesión automáticamente al arrancar el usuario virtual.
        """
        payload = {
            "username": os.getenv("LOCUST_USER", "wilson.ortiz@securitas.com"),
            "password": os.getenv("LOCUST_PASS", "admin123")
        }

        with self.client.post("/api/v1/auth/login", data=payload, catch_response=True) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.token = data.get("access_token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
            else:
                resp.failure(f"Login falló: {resp.status_code} - {resp.text}")

    # ====================== MÓDULO: DASHBOARD & ANALÍTICAS ======================
    @task(6)
    def ver_dashboard_stats(self):
        if self.token:
            self.client.get("/api/v1/analytics/summary", headers=self.headers,
                            name="[GET] /analytics/summary")

    @task(5)
    def ver_resumen_alertas(self):
        if self.token:
            self.client.get("/api/v1/alerts/summary", headers=self.headers,
                            name="[GET] /alerts/summary")

    # ====================== MÓDULO: INVENTARIO & ACTIVOS ======================
    @task(5)
    def ver_inventario_items(self):
        if self.token:
            skip = random.randint(0, 200)
            self.client.get(f"/api/v1/inventory/items?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /inventory/items")

    @task(4)
    def ver_inventario_activos(self):
        if self.token:
            skip = random.randint(0, 200)
            self.client.get(f"/api/v1/inventory/activos?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /inventory/activos")

    @task(3)
    def crear_item_inventario(self):
        """Simula creación de un item de inventario (operación de escritura)."""
        if self.token:
            payload = {
                "nombre_equipo": f"Item-LoadTest-{random.randint(1000,9999)}",
                "categoria": random.choice(["Electrónico", "Mobiliario", "Vehículo", "Maquinaria"]),
                "cantidad_inicial": random.randint(1, 10),
                "ubicacion": random.choice(["Bodega Norte", "Bodega Sur", "Oficina Central"])
            }
            with self.client.post("/api/v1/inventory/items", json=payload,
                                  headers=self.headers, catch_response=True,
                                  name="[POST] /inventory/items") as resp:
                if resp.status_code in (200, 201):
                    resp.success()
                else:
                    resp.failure(f"Crear item falló: {resp.status_code}")

    # ====================== MÓDULO: ALERTAS ======================
    @task(4)
    def ver_alertas_completas(self):
        if self.token:
            self.client.get("/api/v1/alerts/", headers=self.headers,
                            name="[GET] /alerts/")

    # ====================== MÓDULO: NEGOCIO ======================
    @task(3)
    def ver_clientes(self):
        if self.token:
            skip = random.randint(0, 200)
            self.client.get(f"/api/v1/business/clientes?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /business/clientes")

    @task(3)
    def ver_proyectos(self):
        if self.token:
            skip = random.randint(0, 100)
            self.client.get(f"/api/v1/business/proyectos?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /business/proyectos")

    @task(2)
    def ver_proveedores(self):
        if self.token:
            skip = random.randint(0, 100)
            self.client.get(f"/api/v1/business/proveedores?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /business/proveedores")

    @task(3)
    def ver_garantias(self):
        if self.token:
            skip = random.randint(0, 100)
            self.client.get(f"/api/v1/business/garantias?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /business/garantias")

    @task(3)
    def ver_movimientos(self):
        if self.token:
            skip = random.randint(0, 200)
            self.client.get(f"/api/v1/business/movimientos?skip={skip}&limit=50",
                            headers=self.headers, name="[GET] /business/movimientos")

    @task(2)
    def ver_regionales(self):
        if self.token:
            self.client.get("/api/v1/regionales/", headers=self.headers,
                            name="[GET] /regionales/")

    @task(2)
    def crear_cliente(self):
        """Simula registro de un nuevo cliente (operación de escritura)."""
        if self.token:
            payload = {
                "nombre": f"Cliente-LoadTest-{random.randint(1000,9999)}",
                "email": f"cliente{random.randint(1000,9999)}@test.com",
                "telefono": f"+56{random.randint(90000000,99999999)}",
                "region": random.choice(["Metropolitana", "Valparaíso", "Biobío", "Antofagasta"])
            }
            with self.client.post("/api/v1/business/clientes", json=payload,
                                  headers=self.headers, catch_response=True,
                                  name="[POST] /business/clientes") as resp:
                if resp.status_code in (200, 201):
                    resp.success()
                else:
                    resp.failure(f"Crear cliente falló: {resp.status_code}")

    @task(2)
    def crear_proyecto(self):
        """Simula creación de un proyecto nuevo."""
        if self.token:
            payload = {
                "nombre_proyecto": f"Proyecto-LoadTest-{random.randint(1000,9999)}",
                "descripcion": "Proyecto generado en prueba de carga",
                "estado": random.choice(["ACTIVO", "PENDIENTE", "FINALIZADO"])
            }
            with self.client.post("/api/v1/business/proyectos", json=payload,
                                  headers=self.headers, catch_response=True,
                                  name="[POST] /business/proyectos") as resp:
                if resp.status_code in (200, 201):
                    resp.success()
                else:
                    resp.failure(f"Crear proyecto falló: {resp.status_code}")

    # ====================== MÓDULO: REPORTES (PESADOS) ======================
    @task(1)
    def exportar_reporte_excel(self):
        """Descarga de reporte Excel — tarea pesada, baja frecuencia."""
        if self.token:
            with self.client.get("/api/v1/reports/export/inventory?format=excel",
                                 headers=self.headers, stream=True, catch_response=True,
                                 name="[GET] /reports/export/inventory") as resp:
                if resp.status_code == 200:
                    resp.success()
                else:
                    resp.failure(f"Reporte falló: {resp.status_code}")

    @task(1)
    def exportar_reporte_pdf(self):
        """Descarga de reporte PDF — tarea pesada, baja frecuencia."""
        if self.token:
            with self.client.get("/api/v1/reports/export/inventory?format=pdf",
                                 headers=self.headers, stream=True, catch_response=True,
                                 name="[GET] /reports/export/inventory (pdf)") as resp:
                if resp.status_code == 200:
                    resp.success()
                else:
                    resp.failure(f"Reporte PDF falló: {resp.status_code}")

    # ====================== BÚSQUEDAS ======================
    @task(2)
    def buscar_inventario(self):
        """Simula búsqueda de items en inventario."""
        if self.token:
            q = random.choice(["laptop", "escritorio", "silla", "monitor", "impresora"])
            self.client.get(f"/api/v1/inventory/items?search={q}&skip=0&limit=20",
                            headers=self.headers, name="[GET] /inventory/items (search)")
