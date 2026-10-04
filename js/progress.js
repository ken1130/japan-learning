// 學習進度：存在瀏覽器 localStorage（只在這台電腦、這個瀏覽器）
// 結構：
//   items[id] = { c: 答對次數, w: 答錯次數, s: 熟練度 0~5, t: 最後練習時間 }
//   log[YYYY-MM-DD] = { c, w }  每天作答數，畫活動圖用
//   days = 有學習的日期，算連續天數
const KEY = 'tabi-nihongo-v1';

const DEFAULT_SETTINGS = { rate: 0.9, romaji: true, theme: 'auto' };

// 間隔複習：熟練度越高，隔越久才需要再複習
const DAY = 864e5;
const INTERVALS = [0, 10 * 60e3, DAY, 2 * DAY, 4 * DAY, 7 * DAY];

function fresh() {
  return { items: {}, days: [], log: {}, favs: [], settings: { ...DEFAULT_SETTINGS } };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw || typeof raw !== 'object') return fresh();
    const st = { ...fresh(), ...raw, settings: { ...DEFAULT_SETTINGS, ...raw.settings } };
    if (!Array.isArray(st.days)) st.days = [];
    if (!Array.isArray(st.favs)) st.favs = [];
    if (!st.log || typeof st.log !== 'object') st.log = {};
    if (!st.items || typeof st.items !== 'object') st.items = {};
    return st;
  } catch {
    return fresh();
  }
}

const state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 無痕模式等情況存不了，就算了 */
  }
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 記錄一次作答。strength 0~5：答對 +1、答錯 -2。
 * id 例：'kana:あ'、'phrase:rest-03'、'food:ラーメン'、'sign:出口'、'shop:メンズ'、'dlg:konbini:2'
 */
export function record(id, correct) {
  const it = (state.items[id] ||= { c: 0, w: 0, s: 0 });
  if (correct) {
    it.c++;
    it.s = Math.min(it.s + 1, 5);
  } else {
    it.w++;
    it.s = Math.max(it.s - 2, 0);
  }
  it.t = Date.now();
  const t = dateKey();
  if (!state.days.includes(t)) state.days.push(t);
  const day = (state.log[t] ||= { c: 0, w: 0 });
  correct ? day.c++ : day.w++;
  save();
}

export function strength(id) {
  const s = state.items[id]?.s ?? 0;
  return Math.min(5, Math.max(0, s | 0));
}

export function itemStats(id) {
  return state.items[id] || null;
}

/** 所有練習過的 id */
export function practicedIds() {
  return Object.keys(state.items);
}

/** 越不熟的權重越高，測驗時更常出現 */
export function weight(id) {
  return 6 - strength(id);
}

/** 一組項目的熟練度 0~1 */
export function mastery(ids) {
  if (!ids.length) return 0;
  return ids.reduce((sum, id) => sum + strength(id), 0) / (ids.length * 5);
}

export function learnedCount(ids) {
  return ids.filter((id) => strength(id) >= 3).length;
}

/** 一組項目的答對/答錯總數 */
export function accuracy(ids) {
  let c = 0;
  let w = 0;
  for (const id of ids) {
    const it = state.items[id];
    if (it) {
      c += it.c;
      w += it.w;
    }
  }
  return { c, w, rate: c + w ? c / (c + w) : null };
}

/** 弱點：練習過，但熟練度 < 3 或答錯比答對多 */
export function isWeak(id) {
  const it = state.items[id];
  return !!it && (it.s < 3 || it.w > it.c);
}

/** 到期該複習（只算練習過的） */
export function isDue(id) {
  const it = state.items[id];
  return !!it && Date.now() - (it.t || 0) >= INTERVALS[it.s];
}

/** 弱點排序：熟練度低 → 錯得多 → 最近錯的優先 */
export function weakSort(a, b) {
  const A = state.items[a] || { s: 9, w: 0, t: 0 };
  const B = state.items[b] || { s: 9, w: 0, t: 0 };
  return A.s - B.s || B.w - A.w || (B.t || 0) - (A.t || 0);
}

/** 最近 n 天每天的作答數 */
export function dailyLog(n = 14) {
  const out = [];
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    const k = dateKey(d);
    out.push({ date: k, label: `${d.getMonth() + 1}/${d.getDate()}`, ...(state.log[k] || { c: 0, w: 0 }) });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** 連續學習天數（今天或昨天有學才算延續） */
export function streak() {
  const set = new Set(state.days);
  let n = 0;
  const d = new Date();
  if (!set.has(dateKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dateKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function totalDays() {
  return state.days.length;
}

export function isFav(id) {
  return state.favs.includes(id);
}

export function toggleFav(id) {
  const i = state.favs.indexOf(id);
  if (i >= 0) state.favs.splice(i, 1);
  else state.favs.push(id);
  save();
  return i < 0;
}

export function getSetting(key) {
  return state.settings[key];
}

export function setSetting(key, value) {
  state.settings[key] = value;
  save();
}

export function resetProgress() {
  state.items = {};
  state.days = [];
  state.log = {};
  save();
}

/** 備份：整份進度轉成 JSON 字串 */
export function exportData() {
  return JSON.stringify({ app: 'tabi-nihongo', version: 1, exported: new Date().toISOString(), data: state }, null, 1);
}

/** 還原備份。成功回傳 true */
export function importData(text) {
  const obj = JSON.parse(text);
  const data = obj?.app === 'tabi-nihongo' ? obj.data : null;
  if (!data || typeof data.items !== 'object' || data.items === null) return false;
  // 備份檔可能被改過：每個欄位都重新整理成安全的型別與範圍
  const num = (v) => (Number.isFinite(+v) ? Math.max(0, Math.floor(+v)) : 0);
  const items = {};
  for (const [id, it] of Object.entries(data.items)) {
    if (!it || typeof it !== 'object') continue;
    items[String(id)] = { c: num(it.c), w: num(it.w), s: Math.min(5, num(it.s)), t: num(it.t) };
  }
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const log = {};
  for (const [d, v] of Object.entries(data.log && typeof data.log === 'object' ? data.log : {})) {
    if (dateRe.test(d) && v && typeof v === 'object') log[d] = { c: num(v.c), w: num(v.w) };
  }
  const s = data.settings && typeof data.settings === 'object' ? data.settings : {};
  const next = {
    items,
    log,
    days: Array.isArray(data.days) ? data.days.filter((d) => dateRe.test(d)) : [],
    favs: Array.isArray(data.favs) ? data.favs.map(String) : [],
    settings: {
      rate: Number.isFinite(+s.rate) ? Math.min(1.5, Math.max(0.5, +s.rate)) : DEFAULT_SETTINGS.rate,
      romaji: typeof s.romaji === 'boolean' ? s.romaji : DEFAULT_SETTINGS.romaji,
      theme: ['auto', 'light', 'dark'].includes(s.theme) ? s.theme : DEFAULT_SETTINGS.theme,
    },
  };
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, next);
  save();
  return true;
}
