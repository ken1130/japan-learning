# CLAUDE.md

個人用的日文學習網站，使用者**零基礎**、母語**繁體中文（台灣）**，目標是**日本旅遊**能用。

## 規則

- 介面與說明文字一律用**繁體中文**。
- 純靜態網站：HTML + CSS + 原生 ES modules，**沒有建置步驟、沒有 npm**。three.js 透過 `index.html` 的 importmap 從 jsDelivr 載入。
- 本機測試：`python3 -m http.server 8000`（或 `start.bat` / `start.sh`）。
- 所有 Markdown 文件放 `docs/`；日文學習參考資料放 `references/`；Claude 技能放 `.claude/skills/`。
- 任何改動都要在 `docs/CHANGELOG.md` 補一行。

## 內容資料

- 學習內容都在 `js/data/*.js`。新增或修改內容前先讀 `.claude/skills/add-learning-content/SKILL.md`。
- 日文正確性很重要（使用者無法自己判斷對錯）。改完日文內容後用 `.claude/skills/japanese-content-review/SKILL.md` 自我校對。
- 資料的 `id` 是進度記錄的 key，**不要改已存在的 id**。
- 羅馬拼音規則見 `references/romaji-rules.md`。

## 頁面慣例

- 每個 `js/pages/*.js` 匯出 `render(root)`，可回傳 cleanup 函式（離開頁面時呼叫，用來釋放 three.js、移除全域事件、停止計時器）。
- 任何元素加 `data-say="日文"` 點擊就會發音（`main.js` 統一處理），或用 `util.js` 的 `sayBtn()`。
- three.js 場景放 `js/three/`，規範見 `.claude/skills/three-scene/SKILL.md`。
