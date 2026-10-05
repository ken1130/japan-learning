import * as THREE from 'three';

export const JP_FONT = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';

/**
 * 等日文字型載入，避免貼圖畫出來是預設字型。
 * Google Fonts 會把字型切成很多小包（unicode-range），只會下載用到的字，
 * 所以要把「貼圖上會出現的所有文字」傳進來，例如 fontsReady('お弁当・パン・お菓子')
 */
export async function fontsReady(text = '') {
  const sample = 'あア漢' + text;
  try {
    await Promise.race([
      Promise.all([document.fonts.load(`900 64px "Noto Sans JP"`, sample), document.fonts.load(`700 64px "Noto Sans JP"`, sample)]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch {
    /* 字型載入失敗就用系統字型 */
  }
}

/**
 * 把文字畫在 canvas 上做成貼圖。
 * vertical: 直書（日本招牌常見）
 */
export function textTexture(text, { w = 256, h = 256, bg = '#fffaf0', fg = '#1d1d1f', weight = 900, sub = '', subColor, border, vertical = false, radius = 0 } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');

  if (bg) {
    g.fillStyle = bg;
    if (radius) {
      g.beginPath();
      g.roundRect(0, 0, w, h, radius);
      g.fill();
    } else g.fillRect(0, 0, w, h);
  }
  if (border) {
    g.strokeStyle = border;
    g.lineWidth = Math.max(4, w * 0.03);
    const inset = g.lineWidth;
    g.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  }

  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const chars = [...text];

  if (vertical) {
    const size = Math.min(w * 0.7, (h * 0.86) / chars.length);
    g.font = `${weight} ${size}px ${JP_FONT}`;
    const top = h / 2 - (size * chars.length) / 2 + size / 2;
    chars.forEach((ch, i) => g.fillText(ch, w / 2, top + i * size));
  } else {
    const mainH = sub ? h * 0.68 : h;
    const size = Math.min(mainH * 0.72, (w * 0.86) / chars.length);
    g.font = `${weight} ${size}px ${JP_FONT}`;
    g.fillText(text, w / 2, mainH / 2 + (sub ? h * 0.04 : 0));
    if (sub) {
      g.fillStyle = subColor || fg;
      g.font = `700 ${h * 0.16}px ${JP_FONT}`;
      g.fillText(sub, w / 2, h * 0.82);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** 偵測 WebGL；不支援時頁面要顯示替代內容 */
export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** 把場景中的 geometry / material / texture 全部釋放 */
export function disposeScene(scene) {
  scene.traverse((obj) => {
    obj.geometry?.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) if (v && v.isTexture) v.dispose();
      m.dispose();
    }
  });
}

/** 觸控裝置（手機、平板） */
export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * 建立 renderer：手機把像素比上限降到 1.5（3 倍螢幕畫 2 倍像素很吃效能，肉眼差別不大）
 */
export function makeRenderer(container, { alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouchDevice() ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  return renderer;
}

/** 讓 renderer 跟著容器大小變化；大小沒變就不重設（避免手機網址列伸縮時一直重算） */
export function autoResize(container, renderer, camera, onResize) {
  let lastW = 0;
  let lastH = 0;
  const fit = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    onResize?.();
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(container);
  return () => ro.disconnect();
}

/** 追蹤元素是否在畫面上；捲出畫面時場景可以暫停繪製，省電又不卡 */
export function watchVisible(el) {
  const state = { visible: true, stop() {} };
  if (!('IntersectionObserver' in window)) return state;
  const io = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    state.onChange?.(state.visible);
  });
  io.observe(el);
  state.stop = () => io.disconnect();
  return state;
}
