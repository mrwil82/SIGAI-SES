"""
Migra datos del dump MySQL a PostgreSQL - Manejo multilínea.
"""
import asyncio
import os
import sys
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
SQL_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Base_de_datos', 'sigai_ses_db.sql')
SKIP_TABLES = {'alembic_version'}


def extract_insert_blocks(sql_content: str) -> list:
    """Extrae bloques INSERT completos (multilínea)."""
    blocks = []
    current = ''
    in_insert = False

    for line in sql_content.split('\n'):
        stripped = line.strip()
        if stripped.upper().startswith('INSERT INTO'):
            in_insert = True
            current = stripped
        elif in_insert:
            current += ' ' + stripped
            if stripped.endswith(';'):
                blocks.append(current.rstrip(';'))
                current = ''
                in_insert = False

    if current:
        blocks.append(current.rstrip(';'))

    return blocks


def parse_insert(block: str) -> tuple:
    match = re.match(r'INSERT INTO `(\w+)`\s*\(([^)]+)\)\s*VALUES\s*(.+)', block, re.IGNORECASE | re.DOTALL)
    if not match:
        return None, None, None
    table = match.group(1)
    columns = [c.strip().strip('`') for c in match.group(2).split(',')]
    raw_values = match.group(3).strip()
    return table, columns, raw_values


def parse_rows(raw_values: str) -> list:
    rows = []
    current = ''
    in_string = False
    escape_next = False
    depth = 0

    for ch in raw_values:
        if escape_next:
            current += ch
            escape_next = False
            continue
        if ch == '\\' and in_string:
            current += ch
            escape_next = True
            continue
        if ch == "'" and not in_string:
            in_string = True
            current += ch
            continue
        if ch == "'" and in_string:
            in_string = False
            current += ch
            continue
        if not in_string:
            if ch == '(':
                depth += 1
                current += ch
                continue
            if ch == ')':
                depth -= 1
                current += ch
                if depth == 0:
                    rows.append(current.strip())
                    current = ''
                continue
            if ch == ',' and depth == 0:
                continue
        current += ch

    return rows


def parse_row_values(row_str: str) -> list:
    if not row_str.startswith('(') or not row_str.endswith(')'):
        return []
    inner = row_str[1:-1]
    values = []
    current = ''
    in_string = False
    escape_next = False

    for ch in inner:
        if escape_next:
            current += ch
            escape_next = False
            continue
        if ch == '\\' and in_string:
            current += ch
            escape_next = True
            continue
        if ch == "'" and not in_string:
            in_string = True
            current += ch
            continue
        if ch == "'" and in_string:
            in_string = False
            current += ch
            continue
        if not in_string and ch == ',':
            values.append(current.strip())
            current = ''
            continue
        current += ch

    values.append(current.strip())
    return values


def clean_value(v: str):
    v = v.strip()
    if v in ('NULL', 'null', ''):
        return None
    if v.startswith("'") and v.endswith("'"):
        s = v[1:-1].replace("\\'", "'").replace("\\n", "\n").replace("\\t", "\t")
        return s
    if v.lower() == 'true':
        return True
    if v.lower() == 'false':
        return False
    try:
        return int(v)
    except ValueError:
        try:
            return float(v)
        except ValueError:
            return v


async def migrate():
    print("=" * 60)
    print("Migracion MySQL -> PostgreSQL (Supabase)")
    print("=" * 60)

    with open(SQL_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    blocks = extract_insert_blocks(sql_content)
    print(f"Encontradas {len(blocks)} sentencias INSERT")

    engine = create_async_engine(DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        total_rows = 0
        for block in blocks:
            table, columns, raw_values = parse_insert(block)
            if not table or not columns or table in SKIP_TABLES:
                continue

            rows = parse_rows(raw_values)
            if not rows:
                continue

            inserted = 0
            for row_str in rows:
                raw_vals = parse_row_values(row_str)
                if len(raw_vals) != len(columns):
                    continue

                cleaned = [clean_value(v) for v in raw_vals]
                col_list = ', '.join([f'"{c}"' for c in columns])
                placeholders = ', '.join([f':p{i}' for i in range(len(columns))])
                sql = f'INSERT INTO "{table}" ({col_list}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
                params = {f'p{i}': val for i, val in enumerate(cleaned)}

                try:
                    await db.execute(text(sql), params)
                    inserted += 1
                except Exception:
                    pass

            total_rows += inserted
            if inserted > 0:
                print(f"  {table}: {inserted} registros")

        await db.commit()
        print(f"\nTotal: {total_rows} registros importados")
        print("Migracion completada!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
