import { PHRASES, CATEGORIES } from '../data/phrases.js';
import { FOOD } from '../data/food.js';
import { SIGNS } from '../data/signs.js';
import { SHOP } from '../data/shopping.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, choices, weightedPick } from '../util.js';

// 每個題庫統一成 { id, say, show, zh, syn }
const SOURCES = {
  hear: { name: '👂 店員・廣播', items: () => PHRASES.filter((p) => p.hear).map(fromPhrase) },
  phrase: { name: '💬 所有會話', items: () => PHRASES.map(fromPhrase) },
  food: { name: '🍜 菜單單字', items: () => FOOD.map((f) => ({ id: 'food:' + f.jp, say: f.kana, show: f.jp, sub: f.kana, zh: f.zh, syn: f.syn })) },
  shop: { name: '👕 商店單字', items: () => SHOP.map((s) => ({ id: 'shop:' + s.jp, say: s.kana, show: s.jp, sub: s.kana, zh: s.zh, syn: s.syn })) },
  sign: { name: '🏮 招牌單字', items: () => SIGNS.map((s) => ({ id: 'sign:' + s.jp, say: s.kana, show: s.jp, sub: s.kana, zh: s.zh, syn: s.syn })) },
};

function fromPhrase(p) {
  return { id: 'phrase:' + p.id, say: p.jp, show: p.jp, sub: p.ro, zh: p.zh, cat: CATEGORIES.find((c) => c.id === p.cat)?.icon };
}

const ROUND = 10;

export function render(root) {
  let src = 'hear';
  let round = null;
  let alive = true;

  function setup() {
    root.innerHTML = `
      <header class="page-head">
        <h1>聽力練習 <small>🎧</small></h1>
        <p class="lead">只聽聲音，選出正確的中文意思。旅行時店員講話不會給你看字幕，先從「店員・廣播」開始練吧！</p>
      </header>
      <div class="card setup">
        <label>題庫</label>
        <div class="seg">${Object.entries(SOURCES).map(([k, s]) => `<button data-src="${k}" class="${k === src ? 'on' : ''}">${s.name}</button>`).join('')}</div>
        <p class="muted small">建議先到右上角 ⚙ 把語速調慢一點，熟了再加快。</p>
        <button class="btn primary big" id="start">開始 ▶</button>
      </div>`;
  }

  function next() {
    const items = SOURCES[src].items();
    let q;
    do q = weightedPick(items, (x) => x.id);
    while (round.last === q.id && items.length > 1);
    round.last = q.id;
    round.cur = { q, opts: choices(q, items, 4, (x) => x.zh), done: false };
    root.innerHTML = `
      <div class="quiz">
        <div class="quiz-top">
          <span>${round.i + 1} / ${ROUND}</span>
          <span class="bar"><i style="width:${(round.i / ROUND) * 100}%"></i></span>
          <span>✅ ${round.ok}</span>
        </div>
        <div class="q-prompt listen-prompt">
          <button class="q-listen" id="replay">🔊<small>再聽一次</small></button>
          <button class="q-listen slow" id="slow">🐢<small>慢速</small></button>
        </div>
        <div class="opts">${round.cur.opts.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd>${esc(o.zh)}</button>`).join('')}</div>
        <div class="q-feedback" id="fb"></div>
      </div>`;
    setTimeout(() => alive && speak(q.say), 250);
  }

  function answer(i) {
    const cur = round?.cur;
    if (!cur || cur.done) return;
    cur.done = true;
    const ok = cur.opts[i].zh === cur.q.zh;
    record(cur.q.id, ok);
    if (ok) round.ok++;
    root.querySelectorAll('.opt').forEach((b, j) => {
      if (cur.opts[j].zh === cur.q.zh) b.classList.add('right');
      else if (j === i) b.classList.add('wrong');
      b.disabled = true;
    });
    root.querySelector('#fb').innerHTML = `
      <div class="${ok ? 'good' : 'bad'}">${ok ? '正解！' : '答錯了'}</div>
      <div class="jp reveal" data-say="${esc(cur.q.say)}">${esc(cur.q.show)}</div>
      <div class="romaji">${esc(cur.q.sub || '')}</div>
      <button class="btn primary" id="next">下一題 →</button>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const s = t.closest('[data-src]');
    if (s) {
      src = s.dataset.src;
      return setup();
    }
    if (t.closest('#start')) {
      round = { i: 0, ok: 0, last: null, cur: null };
      return next();
    }
    if (t.closest('#replay')) return speak(round.cur.q.say);
    if (t.closest('#slow')) return speak(round.cur.q.say, { rate: 0.6 });
    const o = t.closest('.opt');
    if (o) return answer(Number(o.dataset.i));
    if (t.closest('#next')) {
      round.i++;
      if (round.i < ROUND) return next();
      root.innerHTML = `
        <div class="card summary">
          <div class="score-ring" style="--p:${Math.round((round.ok / ROUND) * 100)}"><span>${round.ok}/${ROUND}</span></div>
          <h2>${round.ok >= 8 ? 'よく聞こえました！耳朵很好！' : '多聽幾次就會越來越清楚 💪'}</h2>
          <div class="row-actions"><button class="btn primary" id="start">再一回合</button><a class="btn ghost" href="#/phrases">去會話頁複習</a></div>
        </div>`;
      round.cur = null;
    }
    if (t.closest('#back')) setup();
  });

  const onKey = (e) => {
    if (!round?.cur) return;
    if (/^[1-4]$/.test(e.key)) answer(Number(e.key) - 1);
    else if (e.key === ' ' && !round.cur.done) {
      e.preventDefault();
      speak(round.cur.q.say);
    } else if (e.key === 'Enter' && round.cur.done) root.querySelector('#next')?.click();
  };
  document.addEventListener('keydown', onKey);

  setup();
  return () => {
    alive = false;
    document.removeEventListener('keydown', onKey);
  };
}
