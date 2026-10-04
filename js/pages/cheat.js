// 旅行小抄：收藏句＋精選必備句，可列印、可全螢幕「給店員看」
import { CATEGORIES, PHRASES } from '../data/phrases.js';
import { isFav } from '../progress.js';
import { esc } from '../util.js';

// 精選生存句（沒有收藏時的預設內容）
const ESSENTIALS = [
  'basic-05', 'basic-04', 'basic-15', 'basic-08', 'basic-09', 'basic-11', 'basic-12', 'basic-13',
  'rest-03', 'rest-08', 'rest-13', 'rest-12', 'rest-17', 'rest-18', 'rest-20',
  'shop-01', 'shop-06', 'shop-07', 'shop-08', 'fashion-02', 'fashion-09',
  'train-02', 'train-03', 'train-07', 'direction-05',
  'hotel-02', 'hotel-04', 'help-01', 'help-02', 'help-04', 'help-08',
];

const byId = new Map(PHRASES.map((p) => [p.id, p]));

export function render(root) {
  const favList = () => PHRASES.filter((p) => isFav('phrase:' + p.id));
  let source = favList().length ? 'fav' : 'essential';
  let query = '';

  function items() {
    let list = source === 'fav' ? favList() : source === 'essential' ? ESSENTIALS.map((id) => byId.get(id)).filter(Boolean) : PHRASES.filter((p) => !p.hear);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.jp.includes(q) || p.kana.includes(q) || p.ro.includes(q) || p.zh.includes(q));
    return list;
  }

  function listHtml() {
    const list = items();
    if (!list.length) {
      return source === 'fav'
        ? '<p class="muted">還沒有收藏的句子。到 <a href="#/phrases">旅遊會話</a> 按 ☆ 收藏，或切換到「精選必備句」。</p>'
        : '<p class="muted">找不到符合的句子。</p>';
    }
    return CATEGORIES.map((c) => {
      const rows = list.filter((p) => p.cat === c.id);
      if (!rows.length) return '';
      return `
        <section class="cheat-group">
          <h3>${c.icon} ${c.name}</h3>
          ${rows.map((p) => `
            <button class="cheat-row" data-show="${p.id}">
              <span class="cheat-zh">${esc(p.zh)}</span>
              <span class="jp cheat-jp">${esc(p.jp)}</span>
              <span class="romaji cheat-ro">${esc(p.ro)}</span>
            </button>`).join('')}
        </section>`;
    }).join('');
  }

  root.innerHTML = `
    <header class="page-head">
      <h1>旅行小抄 <small>📇 出門帶著走</small></h1>
      <p class="lead">把最需要的句子整理在一頁。<b>點任何一句就會全螢幕放大</b>，可以直接把手機拿給店員看，也可以按「列印」做成紙本小抄。</p>
    </header>
    <div class="toolbar no-print">
      <div class="seg" id="src">
        <button data-src="fav" class="${source === 'fav' ? 'on' : ''}">★ 我的收藏（${favList().length}）</button>
        <button data-src="essential" class="${source === 'essential' ? 'on' : ''}">🧳 精選必備句</button>
        <button data-src="all" class="${source === 'all' ? 'on' : ''}">📚 全部</button>
      </div>
      <input class="search" id="search" type="search" placeholder="搜尋：廁所、toire、トイレ" />
      <button class="btn" id="print">🖨️ 列印</button>
    </div>
    <div class="cheat-list" id="cheatList">${listHtml()}</div>
    <div class="show-staff" id="showStaff" hidden role="dialog" aria-modal="true" aria-label="給店員看"></div>`;

  const overlay = root.querySelector('#showStaff');

  function openShow(p) {
    overlay.innerHTML = `
      <div class="ss-inner">
        <p class="ss-hint">（請店員看這句）</p>
        <div class="jp ss-jp">${esc(p.jp)}</div>
        <div class="ss-zh">${esc(p.zh)}</div>
        <div class="ss-actions">
          <button class="btn primary" data-say="${esc(p.jp)}">🔊 播放給對方聽</button>
          <button class="btn" id="closeShow">✕ 關閉</button>
        </div>
      </div>`;
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    overlay.querySelector('#closeShow').focus();
  }
  function closeShow() {
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const s = t.closest('[data-src]');
    if (s) {
      source = s.dataset.src;
      root.querySelectorAll('[data-src]').forEach((b) => b.classList.toggle('on', b === s));
      root.querySelector('#cheatList').innerHTML = listHtml();
      return;
    }
    const row = t.closest('[data-show]');
    if (row) return openShow(byId.get(row.dataset.show));
    if (t.closest('#closeShow') || t === overlay) return closeShow();
    if (t.closest('#print')) window.print();
  });
  root.addEventListener('input', (e) => {
    if (e.target.id === 'search') {
      query = e.target.value;
      root.querySelector('#cheatList').innerHTML = listHtml();
    }
  });
  const onKey = (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeShow();
  };
  document.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('no-scroll');
  };
}
