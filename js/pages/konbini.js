import { KONBINI, KONBINI_SHELVES } from '../data/konbini.js';
import { kanaToRomaji } from '../data/kana.js';
import { numberToKana } from '../data/numbers.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn, choices, weightedPick } from '../util.js';
import { webglAvailable, isTouchDevice } from '../three/textTexture.js';

export async function render(root) {
  let quiz = null;
  let alive = true;
  let store = null;

  root.innerHTML = `
    <header class="page-head">
      <h1>便利商店 <small>🏪 3D 逛店</small></h1>
      <p class="lead">日本的便利商店（コンビニ）幾乎什麼都買得到。按下面的貨架按鈕（或${isTouchDevice() ? '<b>左右滑動畫面</b>' : '<b>拖曳畫面</b>'}）轉頭，<b>點商品</b>看名稱、讀音和價格。</p>
    </header>

    <div class="scene-wrap">
      <div class="scene3d" id="store" aria-label="3D 便利商店，左右拖曳轉頭，點商品看說明"></div>
      <div class="scene-pop" id="scenePop" hidden aria-live="polite"></div>
    </div>
    <div class="scene-pad">
      <button class="pad-btn" data-turn="0.6" aria-label="向左轉">↶</button>
      <div class="pad-shelves">
        ${KONBINI_SHELVES.map((s) => `<button class="btn small" data-look="${s.id}">${s.icon} ${s.name}</button>`).join('')}
      </div>
      <button class="pad-btn" data-turn="-0.6" aria-label="向右轉">↷</button>
    </div>

    <div class="grid-2 konbini-info">
      <aside class="card" id="itemInfo" aria-live="polite">
        <p class="wd-hint"><span class="wd-hand">👆</span><span>點 3D 貨架上的商品，或下面清單裡的商品，這裡會顯示詳細資訊。</span></p>
      </aside>
      <div class="card">
        <h3>🧾 結帳時店員會問的 4 句話</h3>
        <ol class="tidy">
          <li><span class="jp">温めますか？</span> ${sayBtn('あたためますか')}　要加熱嗎？</li>
          <li><span class="jp">お箸はおつけしますか？</span> ${sayBtn('おはしはおつけしますか')}　要筷子嗎？</li>
          <li><span class="jp">袋はご利用ですか？</span> ${sayBtn('ふくろはごりようですか')}　要袋子嗎？</li>
          <li><span class="jp">ポイントカードはお持ちですか？</span> ${sayBtn('ぽいんとかーどはおもちですか')}　有集點卡嗎？</li>
        </ol>
        <p class="muted small">要就說「はい、お願いします」，不要就說「大丈夫です」。</p>
        <a class="btn small ghost" href="#/dialogue?konbini">🎭 練習便利商店結帳對話 →</a>
      </div>
    </div>

    <section>
      <h2 class="section-title">商品清單 <small>${KONBINI.length} 項</small></h2>
      <div class="toolbar"><button class="btn primary small" id="startQuiz">📝 商品測驗</button></div>
      <div id="quizBox"></div>
      ${KONBINI_SHELVES.map((s) => `
        <h3 class="sub-title">${s.icon} ${s.name}</h3>
        <div class="vocab-grid">
          ${KONBINI.filter((k) => k.shelf === s.id).map((k) => `
            <button class="vocab" data-item="${esc(k.jp)}">
              <span class="emoji">${k.emoji}</span>
              <span class="jp v-jp">${esc(k.jp)}</span>
              <span class="romaji">${kanaToRomaji(k.kana)}</span>
              <span class="v-zh">${esc(k.zh)}</span>
              <span class="v-price">¥${k.price.toLocaleString()}</span>
            </button>`).join('')}
        </div>`).join('')}
    </section>`;

  const info = root.querySelector('#itemInfo');
  const byJp = new Map(KONBINI.map((k) => [k.jp, k]));

  function showItem(k, scroll = false) {
    const priceKana = numberToKana(k.price) + 'えん';
    const order = `${k.jp.replace(/（.*?）/g, '')}をください`;
    info.innerHTML = `
      <div class="big-row"><span class="item-emoji">${k.emoji}</span><span class="jp big-jp">${esc(k.jp)}</span>${sayBtn(k.kana)}</div>
      <div class="jp muted">${esc(k.kana)}</div>
      <div class="romaji">${kanaToRomaji(k.kana)}</div>
      <p class="zh-big">${esc(k.zh)}</p>
      <p>💴 ¥${k.price.toLocaleString()} = <span class="jp">${priceKana}</span> ${sayBtn(priceKana)}</p>
      ${k.tip ? `<p class="tip-inline">💡 ${esc(k.tip)}</p>` : ''}
      <p class="muted small">想買的話：<span class="jp">${esc(order)}</span> ${sayBtn(order)}</p>`;
    speak(k.kana);
    if (scroll) info.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function quizQ() {
    const q = weightedPick(KONBINI, (k) => 'konbini:' + k.jp);
    quiz.cur = { q, opts: choices(q, KONBINI, 4, (k) => k.zh), done: false };
    root.querySelector('#quizBox').innerHTML = `
      <div class="card mini-quiz">
        <p class="muted small">商品測驗 ${quiz.n + 1}/10・答對 ${quiz.ok} <button class="linklike" id="quitQuiz">結束</button></p>
        <div class="q-big jp" data-say="${esc(q.kana)}">${esc(q.jp)}</div>
        <div class="opts">${quiz.cur.opts.map((o, i) => `<button class="opt" data-qi="${i}">${esc(o.zh)}</button>`).join('')}</div>
        <div id="qfb" class="q-feedback"></div>
      </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const look = t.closest('[data-look]');
    if (look) return store?.look(look.dataset.look);
    const tn = t.closest('[data-turn]');
    if (tn) return store?.turn(Number(tn.dataset.turn));
    if (t.closest('#popClose')) {
      root.querySelector('#scenePop').hidden = true;
      return;
    }
    if (t.closest('#popMore')) return info.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const it = t.closest('[data-item]');
    if (it) return showItem(byJp.get(it.dataset.item), true);
    if (t.closest('#startQuiz')) {
      quiz = { n: 0, ok: 0 };
      quizQ();
      return;
    }
    if (t.closest('#quitQuiz')) {
      quiz = null;
      root.querySelector('#quizBox').innerHTML = '';
      return;
    }
    const opt = t.closest('[data-qi]');
    if (opt && quiz?.cur && !quiz.cur.done) {
      const { q, opts } = quiz.cur;
      quiz.cur.done = true;
      const ok = opts[Number(opt.dataset.qi)].zh === q.zh;
      record('konbini:' + q.jp, ok);
      if (ok) quiz.ok++;
      root.querySelectorAll('[data-qi]').forEach((b, i) => {
        if (opts[i].zh === q.zh) b.classList.add('right');
        else if (b === opt) b.classList.add('wrong');
        b.disabled = true;
      });
      root.querySelector('#qfb').innerHTML = `${ok ? '<span class="good">正解！</span>' : '<span class="bad">答錯了</span>'} <span class="jp">${esc(q.jp)}（${esc(q.kana)}）</span> = ${esc(q.zh)}`;
      speak(q.kana);
      setTimeout(() => {
        if (!alive || !quiz) return;
        quiz.n++;
        if (quiz.n >= 10) {
          root.querySelector('#quizBox').innerHTML = `<div class="card summary"><h3>測驗結束</h3><p class="big-score">${quiz.ok} / 10</p><button class="btn primary" id="startQuiz">再來一次</button></div>`;
          quiz = null;
        } else quizQ();
      }, ok ? 1000 : 2000);
    }
  });

  const holder = root.querySelector('#store');
  if (!webglAvailable()) {
    holder.innerHTML = '<p class="muted center pad">你的瀏覽器不支援 WebGL，請直接看下方的商品清單。</p>';
    root.querySelector('.scene-pad').hidden = true;
    return () => (alive = false);
  }
  const { createKonbini } = await import('../three/konbini.js');
  if (!alive || !root.isConnected) return () => {};
  store = await createKonbini(holder, {
    items: KONBINI,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // 點 3D 裡的商品：在畫面上彈出小卡片，不捲動頁面（完整說明同時更新在下方）
    onPick: (k) => {
      showItem(k, false);
      const pop = root.querySelector('#scenePop');
      pop.innerHTML = `
        <span class="pop-emoji">${k.emoji}</span>
        <span class="pop-main"><b class="jp">${esc(k.jp)}</b><small class="jp">${esc(k.kana)}</small><span>${esc(k.zh)}・<b class="pop-price">¥${k.price.toLocaleString()}</b></span></span>
        ${sayBtn(k.kana)}
        <button class="linklike" id="popMore">詳細</button>
        <button class="pop-close" id="popClose" aria-label="關閉">✕</button>`;
      pop.hidden = false;
    },
  });
  return () => {
    alive = false;
    store.dispose();
  };
}
