import { SIGNS, SIGN_CATS, SCENE_SIGNS } from '../data/signs.js';
import { kanaToRomaji } from '../data/kana.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn, choices, weightedPick } from '../util.js';
import { webglAvailable } from '../three/textTexture.js';

const byJp = new Map(SIGNS.map((s) => [s.jp, s]));

export async function render(root) {
  let cat = 'door';
  let quiz = null;
  let alive = true;

  root.innerHTML = `
    <header class="page-head">
      <h1>街頭招牌 <small>🏮 3D 街景</small></h1>
      <p class="lead">在夜晚的日本街道散步：拖曳轉頭、滾輪或按鈕前進，點招牌看它的意思。</p>
    </header>
    <div class="street-wrap">
      <div class="street" id="street"></div>
      <div class="street-ctrl">
        <button class="btn small" id="fwd">⬆ 前進</button>
        <button class="btn small" id="bwd">⬇ 後退</button>
      </div>
      <div class="street-info card" id="signInfo"><p class="muted">點擊街上的招牌 👆</p></div>
    </div>

    <section>
      <h2 class="section-title">招牌單字表</h2>
      <div class="toolbar">
        <div class="tabs small" id="signTabs">
          ${SIGN_CATS.map((c) => `<button data-scat="${c.id}" class="${c.id === cat ? 'on' : ''}">${c.icon} ${c.name}</button>`).join('')}
        </div>
        <button class="btn primary small" id="signQuiz">📝 招牌測驗</button>
      </div>
      <div id="quizBox"></div>
      <div class="sign-grid" id="signGrid"></div>
    </section>`;

  const info = root.querySelector('#signInfo');
  const grid = root.querySelector('#signGrid');
  const quizBox = root.querySelector('#quizBox');

  function signDetail(s) {
    return `
      <div class="sign-plate jp">${esc(s.jp)}</div>
      <div><span class="jp">${esc(s.kana)}</span> <span class="romaji">${kanaToRomaji(s.kana)}</span> ${sayBtn(s.kana)}</div>
      <p class="zh-big">${esc(s.zh)}</p>
      ${s.tip ? `<p class="warn">💡 ${esc(s.tip)}</p>` : ''}`;
  }

  function drawGrid() {
    grid.innerHTML = SIGNS.filter((s) => s.cat === cat).map((s) => `
      <button class="sign-card" data-sign="${esc(s.jp)}">
        <span class="sign-face jp ${s.cat}">${esc(s.jp)}</span>
        <span class="jp small">${esc(s.kana)}</span>
        <span class="romaji">${kanaToRomaji(s.kana)}</span>
        <span>${esc(s.zh)}</span>
      </button>`).join('');
  }

  function quizQ() {
    const q = weightedPick(SIGNS, (s) => 'sign:' + s.jp);
    quiz.cur = { q, opts: choices(q, SIGNS, 4, (s) => s.zh), done: false };
    quizBox.innerHTML = `
      <div class="card mini-quiz">
        <p class="muted small">招牌測驗 ${quiz.n + 1}/10・答對 ${quiz.ok} <button class="linklike" id="quitQuiz">結束</button></p>
        <div class="sign-plate jp">${esc(q.jp)}</div>
        <div class="opts">${quiz.cur.opts.map((o, i) => `<button class="opt" data-qi="${i}">${esc(o.zh)}</button>`).join('')}</div>
        <div id="qfb" class="q-feedback"></div>
      </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const sc = t.closest('[data-scat]');
    if (sc) {
      cat = sc.dataset.scat;
      root.querySelectorAll('[data-scat]').forEach((b) => b.classList.toggle('on', b === sc));
      return drawGrid();
    }
    const card = t.closest('[data-sign]');
    if (card) {
      const s = byJp.get(card.dataset.sign);
      speak(s.kana);
      info.innerHTML = signDetail(s);
      return;
    }
    if (t.closest('#signQuiz')) {
      quiz = { n: 0, ok: 0 };
      quizQ();
      quizBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    if (t.closest('#quitQuiz')) {
      quiz = null;
      quizBox.innerHTML = '';
      return;
    }
    const opt = t.closest('[data-qi]');
    if (opt && quiz?.cur && !quiz.cur.done) {
      const { q, opts } = quiz.cur;
      quiz.cur.done = true;
      const ok = opts[Number(opt.dataset.qi)].zh === q.zh;
      record('sign:' + q.jp, ok);
      if (ok) quiz.ok++;
      quizBox.querySelectorAll('[data-qi]').forEach((b, i) => {
        if (opts[i].zh === q.zh) b.classList.add('right');
        else if (b === opt) b.classList.add('wrong');
        b.disabled = true;
      });
      quizBox.querySelector('#qfb').innerHTML = `<span class="jp">${esc(q.jp)}（${esc(q.kana)}）</span> = ${esc(q.zh)}${q.tip ? `<br/><small>💡 ${esc(q.tip)}</small>` : ''}`;
      speak(q.kana);
      setTimeout(() => {
        if (!alive || !quiz) return;
        quiz.n++;
        if (quiz.n >= 10) {
          quizBox.innerHTML = `<div class="card summary"><h3>測驗結束</h3><p class="big-score">${quiz.ok} / 10</p><button class="btn primary" id="signQuiz">再來一次</button></div>`;
          quiz = null;
        } else quizQ();
      }, ok ? 1000 : 2000);
    }
  });

  drawGrid();

  const holder = root.querySelector('#street');
  if (!webglAvailable()) {
    holder.innerHTML = '<p class="muted center">你的瀏覽器不支援 WebGL，請直接看下方的招牌單字表。</p>';
    return () => (alive = false);
  }
  const { createSignStreet } = await import('../three/signStreet.js');
  const signs = SCENE_SIGNS.filter((s) => byJp.has(s.jp));
  const street = await createSignStreet(holder, {
    signs,
    onPick: (s) => {
      const full = byJp.get(s.jp);
      speak(full.kana);
      info.innerHTML = signDetail(full);
    },
  });
  root.querySelector('#fwd').addEventListener('click', street.forward);
  root.querySelector('#bwd').addEventListener('click', street.back);

  return () => {
    alive = false;
    street.dispose();
  };
}
