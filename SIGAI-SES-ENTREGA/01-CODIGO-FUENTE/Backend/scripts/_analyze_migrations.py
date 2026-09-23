"""Analisis temporal de la cadena de migraciones (no se sube al repo)."""
import re
from pathlib import Path

REV_RE = re.compile(r"revision(?:: str)? = ['\"]([^'\"]+)['\"]")
DOWN_RE = re.compile(r"down_revision.*?= ['\"]([^'\"]+)['\"]")

files = sorted(Path('migrations/versions').glob('*.py'))
migrations = {}
for f in files:
    content = f.read_text()
    rev = REV_RE.search(content)
    down = DOWN_RE.search(content)
    if rev:
        migrations[rev.group(1)] = {
            "file": f.name,
            "down": down.group(1) if down else None,
            "name": content.split("\n")[0].strip(' "'),
        }

for rev, info in migrations.items():
    print(f"{rev[:12]:14} <- {str(info['down'])[:12]:14} {info['file'][:40]}")

heads = [rev for rev, info in migrations.items()
         if not any(i["down"] == rev for i in migrations.values())]
print("\nHEADS:", heads)
