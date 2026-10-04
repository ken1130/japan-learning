---
name: three-scene
description: 為旅日語網站新增或修改 three.js 3D 場景／動畫（例如 3D 便利商店、電車車廂、假名雨新模式）。當使用者想要「用 3D 或動畫呈現」某個學習內容時使用。
---

# three.js 場景規範

場景的目的是**幫助初學者記憶**，不是炫技：每個 3D 物件最好都能點擊並帶出日文（發音＋意思）。

## 檔案與介面

- 放在 `js/three/<name>.js`，`import * as THREE from 'three'`（版本由 `index.html` 的 importmap 固定）。
- 匯出 `async function createXxx(container, options)`，回傳 dispose 函式，或含 `dispose()` 的物件。
- 頁面用動態 import 載入，並先檢查 WebGL：

```js
import { webglAvailable } from '../three/textTexture.js';

if (!webglAvailable()) { /* 顯示純 HTML 替代內容 */ return; }
const { createXxx } = await import('../three/xxx.js');
const scene = await createXxx(holder, { onPick: (item) => speak(item.kana) });
return () => scene.dispose();   // 頁面的 cleanup
```

## 必須做到

1. **等字型**：`await fontsReady()` 之後才用 `textTexture()` 畫日文，否則貼圖會是預設字型。
2. **大小**：`autoResize(container, renderer, camera)`（ResizeObserver），容器高度由 CSS 決定；canvas 加 `width:100%;height:100%`。
3. **像素比**：`renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`，`outputColorSpace = SRGBColorSpace`。
4. **釋放**：dispose 要 `cancelAnimationFrame`、移除事件、`disposeScene(scene)`、`renderer.dispose()`、移除 canvas。
5. **互動**：用 `Raycaster` + pointer 事件；拖曳與點擊要區分（移動 < 6px 才算點擊）。手機要能用（`touch-action: none`、pointer events）。
6. **減少動態**：接受 `reducedMotion` 選項，`prefers-reduced-motion` 時放慢或減少粒子。
7. **效能**：大量重複物件用 `InstancedMesh`；共用 geometry／material；貼圖做快取（見 `kanaRain.js` 的 `texCache`）。

## 共用工具（`js/three/textTexture.js`）

| 函式 | 用途 |
|---|---|
| `textTexture(text, { w, h, bg, fg, sub, vertical, border })` | 文字 → CanvasTexture；`vertical: true` 直書（日本招牌風格）；`bg: null` 透明底 |
| `fontsReady()` | 等 Noto Sans JP 載入（最多 2.5 秒） |
| `autoResize(container, renderer, camera)` | 回傳停止函式 |
| `disposeScene(scene)` | 釋放所有 geometry／material／texture |
| `webglAvailable()` | WebGL 偵測 |

## 風格

- 低多邊形（`flatShading: true`）、日系配色：朱紅 `#c8402f`、藍 `#2b4c7e`、櫻粉 `#f7b7c8`、和紙 `#fffaf0`。
- 參考現有場景：`hero.js`（漂浮＋點擊發音）、`signStreet.js`（可走動的街景＋招牌）、`kanaRain.js`（遊戲迴圈＋粒子）。

## 完成後

- 在 `docs/ARCHITECTURE.md` 的場景表格加一列，`docs/CHANGELOG.md` 加一行。
- 實際開瀏覽器測：切到別頁再切回來數次，確認沒有殘留動畫或錯誤。
