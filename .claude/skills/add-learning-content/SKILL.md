---
name: add-learning-content
description: 在旅日語網站新增或修改學習內容（會話句、菜單單字、模擬菜單、招牌、3D 街景招牌、會話情境分類）。當使用者說「加一些句子／單字／菜單／招牌」「新增溫泉情境」「補充便利商店用語」時使用。
---

# 新增學習內容

使用者是**零基礎**、母語**繁體中文**、目標是**日本旅遊**。內容要「旅途中真的會用到或看到」，不要教科書式的冷門句子。

## 1. 決定放哪裡

| 內容 | 檔案 | 陣列 |
|---|---|---|
| 會話句 | `js/data/phrases.js` | `PHRASES`（新情境要先加到 `CATEGORIES`） |
| 菜單單字 | `js/data/food.js` | `FOOD`（分類 `FOOD_CATS`） |
| 模擬菜單 | `js/data/food.js` | `MENUS` |
| 招牌單字 | `js/data/signs.js` | `SIGNS`（分類 `SIGN_CATS`） |
| 商店單字 | `js/data/shopping.js` | `SHOP`（分類 `SHOP_CATS`） |
| 商店模擬看板 | `js/data/shopping.js` | `BOARDS`（片段：字串／`{ v: SHOP.jp }`／`{ t, kana, zh }`） |
| 情境對話 | `js/data/dialogues.js` | `DIALOGUES`（新步驟只能加在最後，不要調換順序：進度 id 用步驟索引） |
| 3D 街景招牌 | `js/data/signs.js` | `SCENE_SIGNS`（`jp` 必須已在 `SIGNS` 裡） |
| 數字／量詞 | `js/data/numbers.js` | 對應常數 |

新增 `CATEGORIES` 後頁面會自動出現分頁，不用改頁面程式。
`js/data/registry.js` 會自動收錄所有資料，弱點複習頁不用另外改。新增一種**全新的資料類型**時，才要在 registry 加上對應的 `TYPES` 與 `build()`。

### 情境對話 `DIALOGUES`

```js
{ type: 'understand', npc: { jp: '温めますか？', kana: 'あたためますか？', zh: '要加熱嗎？' },
  choices: [{ zh: '要加熱嗎？', ok: true, fb: '解說…' }, { zh: '要筷子嗎？', ok: false, fb: '筷子是「お箸」' }] },
{ type: 'reply', situation: '你要加熱：',
  choices: [{ jp: 'はい、お願いします。', ok: true, fb: '…' }, { jp: 'いいえ、結構です。', ok: false, fb: '…' }] },
```

- 每一步至少一個 `ok: true`（可以多個）；**每個選項都要有 `fb` 解說**，錯的選項要說明它其實是什麼意思
- 干擾選項要「看起來合理」，用初學者真的會搞混的句子

## 2. 欄位格式

### 會話 `PHRASES`

```js
{ id: 'onsen-01', cat: 'onsen', jp: 'タオルは持って入れますか', kana: 'たおるはもってはいれますか', ro: 'taoru wa motte hairemasu ka', zh: '可以帶毛巾進去嗎？', note: '多數溫泉毛巾不能放進浴池' },
```

- `id`：`<cat>-<兩位數流水號>`，**永遠不要改已存在的 id**（它是學習進度的 key）
- `jp`：日本人實際的寫法（漢字＋假名）
- `kana`：全平假名讀音（外來語也轉成平假名，例：`めにゅー`）。這欄要跟 `jp` 讀音完全一致
- `ro`：依 `references/romaji-rules.md`：助詞 は→wa、を→o、へ→e；長音照假名寫（ou、ei、ー→重複母音）；詞與助詞間空格
- `zh`：自然的台灣用語
- `note`：選填，一句實用提示（替換用法、文化提醒）
- `hear: true`：這句是**店員／廣播對旅客說的**（重點是聽懂）

### 單字 `FOOD` / `SIGNS`

```js
{ jp: '焼き魚', kana: 'やきざかな', zh: '烤魚', emoji: '🐟', cat: 'dish' },
{ jp: '出口', kana: 'でぐち', zh: '出口', cat: 'door', tip: '選填' },
```

- 拼音由 `kanaToRomaji(kana)` 自動產生，**不要**另外寫 `ro`
- `jp` 不可與現有項目重複（它是進度 key）
- 意思相同的兩個詞要加同樣的 `syn: '<群組名>'`，測驗時才不會互當干擾選項（例：トイレ／お手洗い）

### 模擬菜單 `MENUS`

`items[].parts` 列出組成這道菜的 `FOOD.jp`，詳細面板會顯示拆解；`parts` 裡的字必須存在於 `FOOD`，不存在的會被略過，所以順手補進 `FOOD`。

## 3. 寫完後

1. 依 `.claude/skills/japanese-content-review/SKILL.md` 校對（讀音、拼音、自然度）。
2. 跑資料檢查：
   ```bash
   python3 .claude/skills/japanese-content-review/check_data.py
   ```
3. 在 `docs/CHANGELOG.md` 最上面加一行。
4. 啟動 `python3 -m http.server 8000`，打開對應頁面點幾個 🔊 確認發音正常。
