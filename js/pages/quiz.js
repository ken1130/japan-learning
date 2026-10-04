import { HIRA_ITEMS, KATA_ITEMS } from '../data/kana.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { choices, weightedPick, esc } from '../util.js';

const MODES = {
  see: { name: '看字選音', desc: '看假名，選羅馬拼音' },
  hear: { name: '聽音選字', desc: '聽發音，選假名' },
  romaji: { name: '看音選字', desc: '看拼音，選假名' },
};
const RANGES = {
  basic: { name: '清音', groups: ['basic'] },
  dakuten: { name: '+濁音', groups: ['basic', 'dakuten'] },
  all: { name: '全部', groups: ['basic', 'dakuten', 'yoon'] },
};
const ROUND = 10;

export function render(root) {
  const cfg = { script: 'hira', mode: 'see', range: 'basic' };
  let round = null;
  let alive = true;

  function pool() {
    const src = cfg.script === 'hira' ? HIRA_ITEMS : cfg.script === 'kata' ? KATA_ITEMS : [...HIRA_ITEMS, ...KATA_ITEMS];
    return src.filter((x) => RANGES[cfg.range].groups.includes(x.group));
  }

  function setup() {
    const seg = (key, opts) =>
      `<div class="seg">${Object.entries(opts).map(([v, o]) => `<button data-cfg="${key}" data-v="${v}" class="${cfg[key] === v ? 'on' : ''}">${o.name || o}</button>`).join('')}</div>`;
    root.innerHTML = `
      <header class="page-head">
        <h1>假名測驗</h1>
        <p class="lead">每回合 ${ROUND} 題。答錯的假名之後會更常出現，答對會讓五十音表上的格子變綠。</p>
      </header>
      <div class="card setup">
        <label>文字</label>${seg('script', { hira: '平假名', kata: '片假名', mix: '混合' })}
        <label>題型</label>${seg('mode', MODES)}
        <p class="muted small">${MODES[cfg.mode].desc}</p>
        <label>範圍</label>${seg('range', RANGES)}
        <button class="btn primary big" id="start">開始 ▶</button>
      </div>`;
  }

  function nextQuestion() {
    const items = pool();
    let q;
    do q = weightedPick(items, (x) => 'kana:' + x.k);
    while (round.last && q.k === round.last.k && items.length > 1);
    round.last = q;
    round.current = { q, opts: choices(q, items, 4, (x) => x.r), answered: false };
    drawQuestion();
    if (cfg.mode === 'hear') speak(q.k);
  }

  function drawQuestion() {
    const { q, opts } = round.current;
    const prompt =
      cfg.mode === 'see' ? `<div class="q-big jp">${q.k}</div>`
      : cfg.mode === 'hear' ? `<button class="q-listen" data-say="${esc(q.k)}">🔊<small>再聽一次</small></button>`
      : `<div class="q-big">${q.r}</div>`;
    const label = (o) => (cfg.mode === 'see' ? o.r : `<span class="jp">${o.k}</span>`);
    root.innerHTML = `
      <div class="quiz">
        <div class="quiz-top">
          <span>${round.i + 1} / ${ROUND}</span>
          <span class="bar"><i style="width:${(round.i / ROUND) * 100}%"></i></span>
          <span>✅ ${round.correct}</span>
        </div>
        <div class="q-prompt">${prompt}</div>
        <div class="opts ${cfg.mode === 'see' ? '' : 'jp-opts'}">
          ${opts.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd>${label(o)}</button>`).join('')}
        </div>
        <div class="q-feedback" id="fb"></div>
      </div>`;
  }

  function answer(i) {
    const cur = round.current;
    if (!cur || cur.answered) return;
    cur.answered = true;
    const chosen = cur.opts[i];
    const ok = chosen.r === cur.q.r;
    record('kana:' + cur.q.k, ok);
    if (ok) round.correct++;
    else round.missed.push(cur.q);

    root.querySelectorAll('.opt').forEach((b, j) => {
      const o = cur.opts[j];
      if (o.r === cur.q.r) b.classList.add('right');
      else if (j === i) b.classList.add('wrong');
      b.disabled = true;
    });
    const fb = root.querySelector('#fb');
    fb.innerHTML = ok
      ? `<span class="good">正解！ ${cur.q.k} = ${cur.q.r}</span>`
      : `<span class="bad">答案是 <b class="jp">${cur.q.k}</b> = ${cur.q.r}</span>`;
    if (cfg.mode !== 'hear') speak(cur.q.k);
    setTimeout(() => {
      if (!alive) return;
      round.i++;
      if (round.i >= ROUND) summary();
      else nextQuestion();
    }, ok ? 800 : 1700);
  }

  function summary() {
    round.current = null;
    const pct = Math.round((round.correct / ROUND) * 100);
    const msg = pct === 100 ? '完璧（かんぺき）！完美！' : pct >= 70 ? 'すごい！很棒！' : 'がんばって！再接再厲！';
    const missed = [...new Map(round.missed.map((m) => [m.k, m])).values()];
    root.innerHTML = `
      <div class="card summary">
        <div class="score-ring" style="--p:${pct}"><span>${round.correct}/${ROUND}</span></div>
        <h2>${msg}</h2>
        ${missed.length ? `<p>需要再加強：</p><div class="missed">${missed.map((m) => `<button class="chip jp" data-say="${esc(m.k)}">${m.k} <small>${m.r}</small></button>`).join('')}</div>` : ''}
        <div class="row-actions">
          <button class="btn primary" id="again">再一回合</button>
          <button class="btn ghost" id="back">換設定</button>
        </div>
      </div>`;
  }

  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cfg]');
    if (c) {
      cfg[c.dataset.cfg] = c.dataset.v;
      return setup();
    }
    const o = e.target.closest('.opt');
    if (o) return answer(Number(o.dataset.i));
    if (e.target.closest('#start') || e.target.closest('#again')) {
      round = { i: 0, correct: 0, missed: [], last: null, current: null };
      return nextQuestion();
    }
    if (e.target.closest('#back')) setup();
  });

  const onKey = (e) => {
    if (round?.current && /^[1-4]$/.test(e.key)) answer(Number(e.key) - 1);
  };
  document.addEventListener('keydown', onKey);

  setup();
  return () => {
    alive = false;
    document.removeEventListener('keydown', onKey);
  };
}
