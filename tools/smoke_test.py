#!/usr/bin/env python3
"""Playwright 冒煙測試：每一頁在桌機與手機寬度下打開、操作，檢查 JS 錯誤與水平溢出。

用法（先啟動本機伺服器 python3 -m http.server 8000）：
    pip install playwright && playwright install chromium
    python3 tools/smoke_test.py [--base http://localhost:8000] [--shots 截圖資料夾]
"""
import argparse
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROUTES = ["", "start", "kana", "kana?kata", "quiz", "rain", "phrases", "dialogue", "listen", "speak", "numbers",
          "menu", "shop", "signs", "konbini", "train", "sushi", "review", "cheat"]
VIEWPORTS = {"desktop": (1366, 860), "tablet": (820, 1100), "phone": (375, 780)}


def overflow(page):
    return page.evaluate("""() => {
      const w = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= w + 1) return null;
      const bad = [];
      for (const el of document.querySelectorAll('#app *')) {
        const r = el.getBoundingClientRect();
        if (r.width && r.right > w + 1 && !el.closest('.table-scroll,.belt,.chat,.scene3d')) {
          bad.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + '@' + Math.round(r.right));
          if (bad.length > 4) break;
        }
      }
      return bad.join(', ') || 'unknown';
    }""")


def interactions(page, errors, log):
    def step(name, fn):
        try:
            fn()
            log.append(f"  ✓ {name}")
        except Exception as e:  # noqa: BLE001
            errors.append(f"{name}: {e}".splitlines()[0])

    def go(r):
        page.goto(f"{BASE}/#/{r}")
        page.wait_for_selector("#app h1", timeout=8000)
        page.wait_for_timeout(400)

    def kana_stroke():
        go("kana")
        page.click('.kcell[data-k="あ"]')
        page.wait_for_selector(".stroke-svg", timeout=5000)
        assert page.locator(".sg-ink path").count() >= 3, "あ 應該有 3 畫"

    def train_machine():
        go("train")
        page.click('[data-act="ticket"]')
        target = page.locator(".mission b.jp").inner_text()
        fare = page.locator(f'.fare-list li:has-text("{target}") b').inner_text()
        page.click(f'[data-act="fare:{fare.replace("円", "")}"]')
        adults = page.locator(".mission b").nth(1).inner_text()
        page.click(f'[data-act="p:{adults.split()[1]}"]')
        for _ in range(5):
            if page.locator(".ticket").count():
                break
            page.click('[data-act="pay:500"]')
        assert page.locator(".ticket").count() == 1, "沒有印出車票"

    def train_game():
        page.click('[data-tab="game"]')
        page.click('[data-ans="0"]')
        assert page.locator("#nextRound").count() == 1

    def sushi_order():
        go("sushi")
        page.click('.tb-item >> nth=0')
        page.click("[data-qty='1']")
        page.click("[data-order]")
        page.click('[data-v="history"]')
        assert page.locator(".tb-history li").count() >= 1

    def konbini():
        go("konbini")
        page.click('.vocab[data-item] >> nth=0')
        assert "¥" in page.locator("#itemInfo").inner_text()

    def cheat():
        go("cheat")
        page.click('[data-src="essential"]')
        page.click(".cheat-row >> nth=0")
        assert page.locator("#showStaff").is_visible()
        page.keyboard.press("Escape")
        assert not page.locator("#showStaff").is_visible()

    def speak_page():
        go("speak")
        page.click('[data-cat="hobby"]')
        page.click('[data-move="1"]')
        assert "2 /" in page.locator(".speak-nav").inner_text()

    def dialogue_new():
        go("dialogue?intro")
        page.wait_for_selector(".dlg-opt")
        for _ in range(80):
            if page.locator(".summary").count():
                break
            nxt = page.locator("#nextStep")
            if nxt.count():
                nxt.click()
                continue
            page.locator(".dlg-opt:not([disabled])").first.click()
        assert page.locator(".summary").count() == 1, "對話沒有走到結尾"

    def family_intro():
        go("phrases")
        page.click('[data-cat="family"]')
        assert page.locator(".cat-intro").count() == 1

    def review():
        go("review")
        page.wait_for_selector(".stats-row")

    for name, fn in [("五十音筆順", kana_stroke), ("售票機買票", train_machine), ("山手線廣播", train_game),
                     ("壽司平板點餐", sushi_order), ("便利商店商品", konbini), ("旅行小抄全螢幕", cheat),
                     ("跟讀換句", speak_page), ("自我介紹對話", dialogue_new), ("家人分類說明", family_intro),
                     ("弱點複習", review)]:
        step(name, fn)


def main():
    global BASE
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:8000")
    ap.add_argument("--shots", default="")
    args = ap.parse_args()
    BASE = args.base.rstrip("/")
    shots = Path(args.shots) if args.shots else None
    if shots:
        shots.mkdir(parents=True, exist_ok=True)

    failed = False
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for vp, (w, h) in VIEWPORTS.items():
            ctx = browser.new_context(viewport={"width": w, "height": h}, service_workers="block")
            page = ctx.new_page()
            errors, log = [], []
            page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
            page.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
            for r in ROUTES:
                page.goto(f"{BASE}/#/{r}")
                try:
                    page.wait_for_selector("#app h1", timeout=8000)
                except Exception:  # noqa: BLE001
                    errors.append(f"#/{r}: 沒有 h1（頁面沒載入）")
                page.wait_for_timeout(700)
                ov = overflow(page)
                if ov:
                    errors.append(f"#/{r}: 水平溢出 {ov}")
                if shots:
                    page.screenshot(path=str(shots / f"{vp}-{r.replace('?', '_') or 'home'}.png"), full_page=False)
            interactions(page, errors, log)
            print(f"== {vp} {w}x{h}")
            print("\n".join(log))
            if errors:
                failed = True
                print(f"  ❌ {len(errors)} 個問題")
                for e in errors:
                    print("   -", e)
            else:
                print("  ✅ 沒有錯誤")
            ctx.close()
        browser.close()
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
