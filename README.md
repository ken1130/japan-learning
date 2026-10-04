# 旅日語 Tabi Nihongo 🗻

給**零基礎**、目標是**去日本旅行**的自學網站（個人用途）。

- 會講基本旅遊會話（點餐、購物、問路、飯店、求助）
- 聽得懂店員、車站廣播常說的話
- 看得懂菜單、招牌上的日文

## 啟動

這是純靜態網站，不用安裝 Node.js，只需要 Python（Windows 通常已內建 `py`）。

- **Windows**：雙擊 `start.bat`，瀏覽器會自動開啟 http://localhost:8000
- **WSL / macOS / Linux**：`./start.sh`，再打開 http://localhost:8000

> 不能直接雙擊 `index.html`，因為瀏覽器會擋掉 `file://` 的 ES modules。
>
> 第一次開啟需要網路（載入 three.js 與字型 CDN）。

**建議用 Edge 或 Chrome**，日文語音品質最好。若沒有聲音，請看 [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)。

## 功能

| 頁面 | 內容 |
|---|---|
| 首頁 | three.js 富士山＋櫻花＋漂浮假名（點了會發音）、學習進度、學習路線 |
| 新手入門 | 日文的三種文字、平假名 vs 片假名詳細比較、漢字陷阱、發音規則、特殊符號 |
| 五十音 | 平／片假名表、濁音、拗音；每個字的**漢字字源**、例字、易混淆提醒、3D 翻卡 |
| 假名測驗 | 看字選音／聽音選字／看音選字，答錯的字會更常出現 |
| 假名雨 | three.js 打字遊戲：假名從天而降，輸入拼音打散 |
| 數字價格 | 價格聽力訓練、數字轉換器（逐位拆解）、音變、量詞詳解、時間、星期 |
| 旅遊會話 | 13 個情境 161 句（含聊天、服飾店、藥妝店、問路、景點、溫泉），標出「你會聽到」的句子、慢速播放、收藏、練習模式 |
| 情境對話 | 6 組模擬對話（拉麵店、便利商店、服飾店、問路、飯店、聊天），聽懂題＋回答題 |
| 看懂菜單 | 拉麵店、居酒屋模擬菜單，點菜看拆解；80+ 菜單單字庫與測驗 |
| 看懂商店 | 服飾店價格標籤、樓層導覽、特價告示、自助結帳、生活雜貨的可點擊看板；100+ 商店單字；尺寸表 |
| 街頭招牌 | three.js 夜晚街景，點招牌看意思；60+ 招牌單字與測驗 |
| 聽力練習 | 只聽聲音選中文意思 |
| 弱點複習 | 學習報告、14 天活動圖、弱點清單、弱點特訓／間隔複習、進度備份 |

學習進度存在瀏覽器的 localStorage（只在這台電腦的這個瀏覽器）。到「弱點複習」頁可以下載備份檔。

## 線上版（GitHub Pages）

純靜態網站，推到 GitHub 後在 **Settings → Pages** 選 `main` 分支、根目錄 `/` 即可。
網址格式：`https://<帳號>.github.io/<repo 名稱>/`。
注意：線上版和本機版的學習進度是分開的（不同網址 = 不同的 localStorage），可用備份檔搬移。

## 專案結構

```
index.html          入口
css/style.css       全部樣式（淺色／深色主題）
js/
  main.js           路由、設定、全域發音按鈕
  speech.js         日文語音（Web Speech API）
  progress.js       學習進度
  util.js           共用工具
  data/             ★ 學習內容（要加單字、句子改這裡）
  pages/            各頁面
  three/            three.js 3D 場景
docs/               專案文件、學習計畫、變更紀錄
references/         日文學習參考資料（五十音、文法、菜單詞彙…）
.claude/skills/     給 Claude Code 用的技能（新增內容、校對日文、做 3D 場景）
```

詳細架構見 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)，學習建議見 [docs/LEARNING_PLAN.md](docs/LEARNING_PLAN.md)。
