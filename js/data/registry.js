// 所有「可練習項目」的總表：把各種資料統一成同一種格式，弱點複習頁用它出題。
//   { id, type, show（主要顯示）, sub（讀音/拼音）, say（發音用）, zh（意思/答案）, syn, href }
import { HIRA_ITEMS, KATA_ITEMS } from './kana.js';
import { PHRASES } from './phrases.js';
import { FOOD } from './food.js';
import { SIGNS } from './signs.js';
import { SHOP } from './shopping.js';
import { DIALOGUES } from './dialogues.js';
import { KONBINI } from './konbini.js';
import { SUSHI, SUSHI_TERMS } from './sushi.js';
import { TRAIN_WORDS, YAMANOTE } from './train.js';
import { practicedIds, isWeak, isDue, weakSort } from '../progress.js';

export const TYPES = {
  kana: { name: '假名', icon: 'あ', href: '#/kana' },
  phrase: { name: '會話', icon: '💬', href: '#/phrases' },
  food: { name: '菜單', icon: '🍜', href: '#/menu' },
  shop: { name: '商店', icon: '👕', href: '#/shop' },
  sign: { name: '招牌', icon: '🏮', href: '#/signs' },
  konbini: { name: '便利商店', icon: '🏪', href: '#/konbini' },
  sushi: { name: '壽司', icon: '🍣', href: '#/sushi' },
  train: { name: '電車', icon: '🚃', href: '#/train' },
  dlg: { name: '情境對話', icon: '🎭', href: '#/dialogue' },
};

let cache = null;

function build() {
  const list = [];
  for (const k of [...HIRA_ITEMS, ...KATA_ITEMS]) {
    list.push({ id: 'kana:' + k.k, type: 'kana', show: k.k, sub: k.r, say: k.k, zh: k.r, script: /[゠-ヿ]/.test(k.k) ? 'kata' : 'hira' });
  }
  for (const p of PHRASES) list.push({ id: 'phrase:' + p.id, type: 'phrase', show: p.jp, sub: p.ro, say: p.jp, zh: p.zh });
  for (const f of FOOD) list.push({ id: 'food:' + f.jp, type: 'food', show: f.jp, sub: f.kana, say: f.kana, zh: f.zh, syn: f.syn });
  for (const s of SHOP) list.push({ id: 'shop:' + s.jp, type: 'shop', show: s.jp, sub: s.kana, say: s.kana, zh: s.zh, syn: s.syn });
  for (const s of SIGNS) list.push({ id: 'sign:' + s.jp, type: 'sign', show: s.jp, sub: s.kana, say: s.kana, zh: s.zh, syn: s.syn });
  for (const k of KONBINI) list.push({ id: 'konbini:' + k.jp, type: 'konbini', show: k.jp, sub: k.kana, say: k.kana, zh: k.zh });
  for (const s of [...SUSHI, ...SUSHI_TERMS]) list.push({ id: 'sushi:' + s.jp, type: 'sushi', show: s.jp, sub: s.kana, say: s.kana, zh: s.zh });
  for (const w of TRAIN_WORDS) list.push({ id: 'train:' + w.jp, type: 'train', show: w.jp, sub: w.kana, say: w.kana, zh: w.zh });
  for (const st of YAMANOTE) list.push({ id: 'station:' + st.jp, type: 'train', show: st.jp, sub: st.kana, say: st.kana, zh: `${st.jp}站（山手線）`, station: true });
  for (const d of DIALOGUES) {
    d.steps.forEach((st, i) => {
      const right = st.choices.find((c) => c.ok);
      list.push({
        id: `dlg:${d.id}:${i}`,
        type: 'dlg',
        show: st.npc ? st.npc.jp : st.situation,
        sub: d.title,
        say: st.npc ? st.npc.jp : right.jp,
        zh: right.jp || right.zh,
        href: `#/dialogue?${d.id}`,
      });
    });
  }
  return new Map(list.map((x) => [x.id, x]));
}

function all() {
  return (cache ||= build());
}

export function getItem(id) {
  return all().get(id) || null;
}

export function allItems() {
  return [...all().values()];
}

export function itemsOfType(type) {
  return allItems().filter((x) => x.type === type);
}

/** 學習報告用的分組 */
export function groups() {
  const items = allItems();
  const ids = (fn) => items.filter(fn).map((x) => x.id);
  return [
    { key: 'hira', name: '平假名', icon: 'あ', href: '#/kana', ids: ids((x) => x.type === 'kana' && x.script === 'hira') },
    { key: 'kata', name: '片假名', icon: 'ア', href: '#/kana?kata', ids: ids((x) => x.type === 'kana' && x.script === 'kata') },
    { key: 'phrase', name: '旅遊會話', icon: '💬', href: '#/phrases', ids: ids((x) => x.type === 'phrase') },
    { key: 'dlg', name: '情境對話', icon: '🎭', href: '#/dialogue', ids: ids((x) => x.type === 'dlg') },
    { key: 'food', name: '菜單單字', icon: '🍜', href: '#/menu', ids: ids((x) => x.type === 'food') },
    { key: 'shop', name: '商店單字', icon: '👕', href: '#/shop', ids: ids((x) => x.type === 'shop') },
    { key: 'sign', name: '招牌單字', icon: '🏮', href: '#/signs', ids: ids((x) => x.type === 'sign') },
    { key: 'konbini', name: '便利商店', icon: '🏪', href: '#/konbini', ids: ids((x) => x.type === 'konbini') },
    { key: 'sushi', name: '迴轉壽司', icon: '🍣', href: '#/sushi', ids: ids((x) => x.type === 'sushi') },
    { key: 'train', name: '電車', icon: '🚃', href: '#/train', ids: ids((x) => x.type === 'train') },
  ];
}

/** 目前內容裡還存在、且是弱點的項目 id（首頁、選單徽章、弱點複習頁共用，數字才會一致） */
export function weakIds() {
  return practicedIds().filter((id) => getItem(id) && isWeak(id)).sort(weakSort);
}

/** 到期該複習的項目 id（情境對話步驟不能單獨出題，排除） */
export function dueIds() {
  return practicedIds().filter((id) => getItem(id) && getItem(id).type !== 'dlg' && isDue(id)).sort(weakSort);
}
