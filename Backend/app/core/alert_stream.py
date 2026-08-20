import asyncio
import json
import logging
from typing import Any, AsyncGenerator

logger = logging.getLogger(__name__)


class AlertEventBus:
    """Bus de eventos en memoria para notificar en tiempo real la creacion
    de alertas (SSE). Cada suscriptor recibe un mensaje JSON.

    Nota: al ser en memoria, funciona en un unico proceso (EXE local y
    despliegue de un solo worker). Es suficiente para la Opcion A.
    """

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue] = set()

    def publish(self, event: dict[str, Any]) -> None:
        if not self._subscribers:
            return
        try:
            message = json.dumps(event, ensure_ascii=False, default=str)
        except Exception as e:
            logger.error(f"No se pudo serializar evento de alerta: {e}", exc_info=True)
            return
        for queue in list(self._subscribers):
            if queue.full():
                continue
            try:
                queue.put_nowait(message)
            except Exception:
                pass

    async def subscribe(self) -> AsyncGenerator[str, None]:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers.add(queue)
        try:
            while True:
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield message
                except asyncio.TimeoutError:
                    # Keep-alive para mantener la conexion SSE viva y detectar
                    # desconexiones de clientes.
                    yield ": keep-alive"
        finally:
            self._subscribers.discard(queue)


alert_bus = AlertEventBus()
