from datetime import datetime, timezone


def utcnow() -> datetime:
    """Hora actual en UTC sin info de zona (naive).

    La BD (Neon/PostgreSQL) guarda y devuelve los timestamps en UTC sin zona.
    Este helper permite que los timestamps que el codigo genera en Python
    coincidan con los que genera la BD, sin importar la zona horaria del
    servidor (Render o EXE local).
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)
