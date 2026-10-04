// 共用小工具
import { weight } from './progress.js';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 依熟練度加權抽一個（越不熟越容易抽到） */
export function weightedPick(items, idOf) {
  const ws = items.map((it) => weight(idOf(it)));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** 產生一題選擇題：正解 + n-1 個不重複的干擾選項 */
export function choices(answer, pool, n = 4, keyOf = (x) => x) {
  const key = keyOf(answer);
  // syn 相同的是同義詞，不能拿來當干擾選項
  const others = shuffle(pool.filter((x) => keyOf(x) !== key && !(answer.syn && x.syn === answer.syn)));
  const seen = new Set([key]);
  const picked = [];
  for (const o of others) {
    if (picked.length >= n - 1) break;
    if (seen.has(keyOf(o))) continue;
    seen.add(keyOf(o));
    picked.push(o);
  }
  return shuffle([answer, ...picked]);
}

let toastTimer;
export function toast(msg, ms = 1800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/** 唸出按鈕的 HTML；點擊由 main.js 統一處理 data-say */
export function sayBtn(text, label = '🔊') {
  // 有文字的按鈕用膠囊形，只有圖示的用圓形
  const cls = label === '🔊' ? 'say' : 'say wide';
  return `<button class="${cls}" data-say="${esc(text)}" aria-label="播放發音" title="播放發音">${label}</button>`;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
