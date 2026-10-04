#!/usr/bin/env python3
"""產生 sw.js 裡的離線快取清單（ASSETS）與版本號。

新增、刪除或修改網站檔案後執行：python3 tools/build-sw.py
版本號是所有檔案內容的雜湊，內容有變，使用者的離線快取就會自動更新。
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INCLUDE_DIRS = ["css", "js", "assets"]
INCLUDE_FILES = ["index.html", "manifest.webmanifest"]

files = [ROOT / f for f in INCLUDE_FILES]
for d in INCLUDE_DIRS:
    files += sorted(p for p in (ROOT / d).rglob("*") if p.is_file())

h = hashlib.sha1()
assets = ["./"]
for p in files:
    rel = p.relative_to(ROOT).as_posix()
    h.update(rel.encode())
    h.update(p.read_bytes())
    assets.append(rel)

version = h.hexdigest()[:10]
block = "// <ASSETS>\nconst VERSION = '%s';\nconst ASSETS = [\n%s\n];\n// </ASSETS>" % (
    version,
    "\n".join(f"  '{a}'," for a in assets),
)
sw = ROOT / "sw.js"
text = sw.read_text(encoding="utf-8")
text = re.sub(r"// <ASSETS>.*?// </ASSETS>", block, text, flags=re.S)
sw.write_text(text, encoding="utf-8")
print(f"sw.js 已更新：{len(assets)} 個檔案，版本 {version}")
