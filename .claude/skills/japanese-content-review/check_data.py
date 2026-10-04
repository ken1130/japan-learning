#!/usr/bin/env python3
"""檢查 js/data/*.js 的格式問題（不檢查語意）。

涵蓋：phrases、food、signs、shopping、dialogues。

用法：python3 .claude/skills/japanese-content-review/check_data.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "js" / "data"

KANA_RE = re.compile(r"^[ぁ-ゖァ-ヺー・（）()\s〜]+$")
errors: list[str] = []


def objects(text: str, array: str) -> list[str]:
    """抓出 `export const ARRAY = [ ... ];` 內每個 { ... } 的原始字串（單層）。"""
    m = re.search(rf"export const {array} = \[(.*?)\n\];", text, re.S)
    if not m:
        errors.append(f"找不到陣列 {array}")
        return []
    return re.findall(r"\{[^{}]*\}", m.group(1))


def field(obj: str, name: str):
    m = re.search(rf"\b{name}: '((?:[^'\\]|\\.)*)'", obj)
    return m.group(1) if m else None


def check_dupes(label: str, values: list[str]) -> None:
    seen = set()
    for v in values:
        if v in seen:
            errors.append(f"{label} 重複：{v}")
        seen.add(v)


def check_kana(label: str, obj: str) -> None:
    kana = field(obj, "kana")
    if kana is None:
        errors.append(f"{label} 缺少 kana：{obj[:60]}")
    elif not KANA_RE.match(kana):
        errors.append(f"{label} 的 kana 含非假名字元：{kana}")


# ---- phrases ----
ph = (DATA / "phrases.js").read_text(encoding="utf-8")
cats = {field(o, "id") for o in objects(ph, "CATEGORIES")}
phrases = objects(ph, "PHRASES")
check_dupes("phrase id", [field(o, "id") for o in phrases])
for o in phrases:
    pid = field(o, "id")
    for f in ("id", "cat", "jp", "kana", "ro", "zh"):
        if field(o, f) is None:
            errors.append(f"phrase {pid} 缺少 {f}")
    if field(o, "cat") not in cats:
        errors.append(f"phrase {pid} 的 cat 不存在：{field(o, 'cat')}")
    if pid and field(o, "cat") and not pid.startswith(field(o, "cat") + "-"):
        errors.append(f"phrase {pid} 的 id 前綴應為 {field(o, 'cat')}-")
    check_kana(f"phrase {pid}", o)
    ro = field(o, "ro") or ""
    if not re.fullmatch(r"[a-z' -]+", ro):
        errors.append(f"phrase {pid} 的 ro 只能用小寫英文字母與空格：{ro}")

# ---- food ----
fd = (DATA / "food.js").read_text(encoding="utf-8")
food_cats = {field(o, "id") for o in objects(fd, "FOOD_CATS")}
food = objects(fd, "FOOD")
food_jp = [field(o, "jp") for o in food]
check_dupes("food jp", food_jp)
for o in food:
    check_kana(f"food {field(o, 'jp')}", o)
    if field(o, "cat") not in food_cats:
        errors.append(f"food {field(o, 'jp')} 的 cat 不存在：{field(o, 'cat')}")
for part_list in re.findall(r"parts: \[([^\]]*)\]", fd):
    for p in re.findall(r"'([^']+)'", part_list):
        if p not in food_jp:
            errors.append(f"MENUS.parts 參照不存在的 FOOD：{p}")

# ---- signs ----
sg = (DATA / "signs.js").read_text(encoding="utf-8")
sign_cats = {field(o, "id") for o in objects(sg, "SIGN_CATS")}
signs = objects(sg, "SIGNS")
sign_jp = [field(o, "jp") for o in signs]
check_dupes("sign jp", sign_jp)
for o in signs:
    check_kana(f"sign {field(o, 'jp')}", o)
    if field(o, "cat") not in sign_cats:
        errors.append(f"sign {field(o, 'jp')} 的 cat 不存在：{field(o, 'cat')}")
for o in objects(sg, "SCENE_SIGNS"):
    if field(o, "jp") not in sign_jp:
        errors.append(f"SCENE_SIGNS 參照不存在的 SIGNS：{field(o, 'jp')}")

# ---- shopping ----
sh = (DATA / "shopping.js").read_text(encoding="utf-8")
shop_cats = {field(o, "id") for o in objects(sh, "SHOP_CATS")}
shop = objects(sh, "SHOP")
shop_jp = [field(o, "jp") for o in shop]
check_dupes("shop jp", shop_jp)
for o in shop:
    check_kana(f"shop {field(o, 'jp')}", o)
    if field(o, "cat") not in shop_cats:
        errors.append(f"shop {field(o, 'jp')} 的 cat 不存在：{field(o, 'cat')}")
for v in re.findall(r"\{ v: '([^']+)' \}", sh):
    if v not in shop_jp:
        errors.append(f"BOARDS 參照不存在的 SHOP：{v}")
for t, kana in re.findall(r"\{ t: '([^']+)', kana: '([^']+)'", sh):
    if not re.match(r"^[\u3041-\u3096\u30a1-\u30fa\u30fc]+$", kana):
        errors.append(f"BOARDS 片段 {t} 的 kana 含非假名字元：{kana}")

# ---- dialogues ----
dl = (DATA / "dialogues.js").read_text(encoding="utf-8")
dlg_ids = re.findall(r"^    id: '([^']+)',", dl, re.M)
check_dupes("dialogue id", dlg_ids)
# 每個步驟至少要有一個 ok: true
for block in re.split(r"\n      \{\n        type: ", dl)[1:]:
    head = block.split("\n")[0]
    if head not in ("'reply',", "'understand',"):
        errors.append(f"對話步驟 type 錯誤：{head}")
    if "ok: true" not in block.split("\n      },")[0]:
        errors.append(f"對話步驟沒有正確答案：{block[:80]}")

# ---- 便利商店／壽司／電車 ----
extra = 0
for fname, arrays in [("konbini.js", ["KONBINI"]), ("sushi.js", ["SUSHI", "SUSHI_TERMS"]), ("train.js", ["YAMANOTE", "TRAIN_WORDS"])]:
    txt = (DATA / fname).read_text(encoding="utf-8")
    for arr in arrays:
        objs = objects(txt, arr)
        extra += len(objs)
        check_dupes(f"{arr} jp", [field(o, "jp") for o in objs])
        for o in objs:
            check_kana(f"{arr} {field(o, 'jp')}", o)
tr = (DATA / "train.js").read_text(encoding="utf-8")
stations = [field(o, "jp") for o in objects(tr, "YAMANOTE")]
for to in re.findall(r"to: '([^']+)'", tr):
    if to not in stations:
        errors.append(f"FARES_FROM_TOKYO 的目的地不在 YAMANOTE：{to}")

print(f"phrases {len(phrases)}・food {len(food)}・signs {len(signs)}・shop {len(shop)}・dialogues {len(dlg_ids)}・konbini/sushi/train {extra}")
if errors:
    print(f"\n❌ {len(errors)} 個問題：")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("✅ 資料格式檢查通過")
