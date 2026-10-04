# 架構說明

## 設計原則

1. **零建置**：原生 ES modules，用任何靜態伺服器就能跑，不需要 Node.js。
2. **內容與程式分離**：所有日文內容在 `js/data/`，頁面只負責呈現。
3. **離開頁面就清乾淨**：每頁回傳 cleanup，避免 three.js 記憶體洩漏、計時器跨頁亂跑。

## 執行流程

```
index.html
  └─ js/main.js
       ├─ 監聽 hashchange → 動態 import('./pages/xxx.js')
       ├─ 呼叫上一頁的 cleanup()
       ├─ 建立全新的 <div class="view"> 放進 #app
       ├─ mod.render(view) → 可回傳 cleanup（可以是 async）
       ├─ 全域 click：[data-say] → speech.speak()
       └─ 設定面板（語速、羅馬拼音、主題）→ progress.setSetting()
```

路由用 hash（`#/kana`），因為靜態伺服器（含 GitHub Pages）不支援 history fallback。
頁內錨點不能用 `href="#xxx"`（會被當成路由），要自己攔截 click 再 `scrollIntoView`（見 `start.js`）。

**每頁一個全新容器**：頁面把事件監聽器掛在 `root` 上，換頁時舊容器整個被丟掉，監聽器也跟著消失。
掛在 `document`／`window` 上的監聽器、計時器、three.js 仍然要在 cleanup 裡自己移除。

## 選單（RWD）

| 寬度 | 版面 |
|---|---|
| > 1100px | 左側固定分組側欄 |
| ≤ 1100px | 頂部 ☰ 打開抽屜式側欄（同一份 `#sidebar`） |
| ≤ 760px | 再加上底部分頁列（首頁／五十音／會話／複習／更多） |

`main.js` 有 `navToken` 防止「快速切頁時，舊頁面 async render 完才回來覆蓋新頁面」。

## 模組

| 檔案 | 責任 |
|---|---|
| `js/speech.js` | 挑選日文語音（優先 Nanami / Google / Kyoko），`speak(text, {rate})` 回傳 Promise |
| `js/progress.js` | localStorage 讀寫。每個項目 `strength` 0～5，答對 +1、答錯 −2；每日作答紀錄、`isWeak()`、`isDue()`（間隔 0／10 分／1／2／4／7 天）、匯出匯入 |
| `js/util.js` | `choices()` 產生選擇題（排除同義詞 `syn`）、`weightedPick()` 依熟練度加權抽題、`sayBtn()`、`toast()` |
| `js/data/kana.js` | 五十音、字源、例字、易混淆；`kanaToRomaji()` 自動轉拼音 |
| `js/data/phrases.js` | 會話（含 `hear` 標記） |
| `js/data/food.js` | 菜單單字與模擬菜單 |
| `js/data/signs.js` | 招牌單字與 3D 街景用的招牌設定 |
| `js/data/shopping.js` | 商店單字、可點擊的模擬看板 `BOARDS`、尺寸表 |
| `js/data/dialogues.js` | 情境對話腳本（`reply` 回答題／`understand` 聽懂題） |
| `js/data/registry.js` | 把所有資料統一成 `{ id, type, show, sub, say, zh }`，弱點複習用它出題 |
| `js/data/numbers.js` | `numberToKana()`（處理 300/600/800/3000/8000 音變）、量詞、時間 |

## 進度 ID 規則

| 類型 | ID 格式 | 例 |
|---|---|---|
| 假名 | `kana:<假名>` | `kana:あ`、`kana:キャ` |
| 會話 | `phrase:<id>` | `phrase:rest-08` |
| 菜單單字 | `food:<jp>` | `food:ラーメン` |
| 招牌 | `sign:<jp>` | `sign:出口` |
| 商店單字 | `shop:<jp>` | `shop:メンズ` |
| 對話步驟 | `dlg:<對話id>:<步驟索引>` | `dlg:konbini:2` |

改了 id 或 jp，舊的進度就會對不上，所以**不要改已存在的**。

## three.js 場景

全部放在 `js/three/`，每個都是 `async create...(container, options)`：

| 場景 | 用在 | 內容 |
|---|---|---|
| `hero.js` | 首頁 | 低多邊形富士山、夕陽、InstancedMesh 櫻花、可點擊的假名方塊 |
| `signStreet.js` | 招牌頁 | 夜晚街道、建築、直書／橫書招牌（Raycaster 點選）、燈籠 |
| `kanaRain.js` | 假名雨 | Sprite 假名落下、粒子爆炸、鳥居 |
| `textTexture.js` | 共用 | 文字 → CanvasTexture（支援直書）、`disposeScene()`、`autoResize()`、WebGL 偵測 |

規範：等字型載入（`fontsReady()`）再畫貼圖；用 `ResizeObserver` 跟容器同步大小；回傳的 dispose 要釋放 renderer、geometry、material、texture 與事件。
不支援 WebGL 時頁面要能退回純 HTML 內容。

## 樣式

`css/style.css` 單一檔案，色彩全部用 CSS 變數，深色主題在 `prefers-color-scheme` 與 `[data-theme]` 兩處定義（使用者可在設定強制淺／深色）。
`body.hide-romaji` 隱藏所有 `.romaji`，給想脫離拼音的時候用。
