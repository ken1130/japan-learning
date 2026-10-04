import { SHOP, SHOP_CATS, BOARDS, SIZE_TABLE } from '../data/shopping.js';
import { kanaToRomaji } from '../data/kana.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn, choices, weightedPick } from '../util.js';

const byJp = new Map(SHOP.map((s) => [s.jp, s]));

export function render(root) {
  let boardId = BOARDS[0].id;
  let cat = 'all';
  let query = '';
  let quiz = null;
  let alive = true;

  // 把看板片段轉成 HTML；可點的詞存在 segs 陣列裡
  let segs = [];
  function segHtml(seg) {
    if (typeof seg === 'string') return `<span>${esc(seg)}</span>`;
    const w = seg.v ? byJp.get(seg.v) : seg;
    if (!w) return `<span>${esc(seg.v || seg.t)}</span>`;
    segs.push(w);
    return `<button class="seg-word" data-seg="${segs.length - 1}">${esc(seg.v || seg.t)}</button>`;
  }

  function boardHtml(b) {
    segs = [];
    return `<div class="board board-${b.style}">
      <div class="board-title">${esc(b.title)}</div>
      ${b.lines.map((line) => `<div class="board-line jp">${line.map(segHtml).join('')}</div>`).join('')}
    </div>`;
  }

  function wordDetail(w) {
    return `
      <div class="big-row"><span class="jp big-jp">${esc(w.jp || w.t)}</span>${sayBtn(w.kana)}</div>
      <div class="jp muted">${esc(w.kana)}</div>
      <div class="romaji">${kanaToRomaji(w.kana)}</div>
      <p class="zh-big">${w.emoji ? w.emoji + ' ' : ''}${esc(w.zh)}</p>
      ${w.tip ? `<p class="tip-inline">💡 ${esc(w.tip)}</p>` : ''}`;
  }

  function vocabHtml() {
    const q = query.trim().toLowerCase();
    const items = SHOP.filter((f) => (cat === 'all' || f.cat === cat) && (!q || f.jp.toLowerCase().includes(q) || f.kana.includes(q) || f.zh.includes(q) || kanaToRomaji(f.kana).includes(q)));
    return items.length
      ? items.map((f) => `
        <button class="vocab" data-word="${esc(f.jp)}">
          <span class="emoji">${f.emoji}</span>
          <span class="jp v-jp">${esc(f.jp)}</span>
          ${f.kana !== f.jp ? `<span class="jp v-kana">${esc(f.kana)}</span>` : ''}
          <span class="romaji">${kanaToRomaji(f.kana)}</span>
          <span class="v-zh">${esc(f.zh)}</span>
        </button>`).join('')
      : '<p class="muted">找不到符合的單字</p>';
  }

  function draw() {
    const b = BOARDS.find((x) => x.id === boardId);
    root.innerHTML = `
      <header class="page-head">
        <h1>看懂商店 <small>👕 服飾店・平價連鎖・生活雜貨</small></h1>
        <p class="lead">逛 UNIQLO、GU 這類平價服飾店或無印良品時，最常看到的是<b>價格標籤、樓層導覽、特價告示、自助結帳機</b>。下面是模擬的看板，<b>點任何有底線的字</b>就能看讀音和意思。</p>
      </header>

      <div class="tabs">${BOARDS.map((x) => `<button data-board="${x.id}" class="${x.id === boardId ? 'on' : ''}">${esc(x.title)}</button>`).join('')}</div>
      <p class="tip">💡 ${esc(b.tip)}</p>
      <div class="board-layout">
        ${boardHtml(b)}
        <aside class="card word-detail" id="wordDetail" aria-live="polite">
          <p class="wd-hint"><span class="wd-hand">👆</span><span>點看板上<b>有虛線底線</b>的字，這裡會顯示讀音、意思和發音。</span></p>
        </aside>
      </div>

      <section class="grid-2">
        <div class="card">
          <h3>📏 日本衣服尺寸參考</h3>
          <p class="muted small">日本的尺寸通常比歐美小一號。下表是一般平價服飾的參考，實際請看各店的尺寸表或直接試穿。</p>
          <div class="table-scroll">
            <table class="mini-table">
              <tr><th>尺寸</th><th>男生</th><th>女生</th></tr>
              ${SIZE_TABLE.map((r) => `<tr><td><b>${r.jp}</b></td><td>${r.men} cm</td><td>${r.women} cm</td></tr>`).join('')}
            </table>
          </div>
        </div>
        <div class="card">
          <h3>🛍️ 購物小常識</h3>
          <ul class="tidy">
            <li><b>免稅</b>：同一天同一家店，未稅滿 5,000 円就能免稅，記得帶<b>護照</b>正本。</li>
            <li><b>價格標示</b>：看清楚是「税込」（含稅）還是「本体価格」（未稅，結帳再加 10%）。</li>
            <li><b>試衣間</b>：進去前要<b>脫鞋</b>，店員可能問「何点ですか」（幾件）。</li>
            <li><b>塑膠袋</b>：要付費，自備環保袋（エコバッグ）最方便。</li>
            <li><b>自助結帳</b>：很多平價服飾店把整籃放進機器就會自動算好，介面多半可以切換中文。</li>
          </ul>
          <a class="btn small ghost" href="#/dialogue?fashion">🎭 練習「服飾店買衣服」對話 →</a>
          <a class="btn small ghost" href="#/phrases">💬 服飾店常用句</a>
        </div>
      </section>

      <section>
        <h2 class="section-title">商店單字庫 <small>${SHOP.length} 個</small></h2>
        <div class="toolbar">
          <div class="tabs small">
            <button data-cat="all" class="${cat === 'all' ? 'on' : ''}">全部</button>
            ${SHOP_CATS.map((c) => `<button data-cat="${c.id}" class="${cat === c.id ? 'on' : ''}">${c.icon} ${c.name}</button>`).join('')}
          </div>
        </div>
        <div class="toolbar">
          <input class="search" id="search" type="search" placeholder="搜尋：褲子、pantsu、ぱんつ" value="${esc(query)}" />
          <button class="btn primary small" id="startQuiz">📝 商店單字測驗</button>
        </div>
        <div id="quizBox"></div>
        <div class="vocab-grid" id="vocab">${vocabHtml()}</div>
      </section>`;
  }

  function showWord(w) {
    const d = root.querySelector('#wordDetail');
    d.innerHTML = wordDetail(w);
    speak(w.kana);
    if (window.innerWidth < 900) d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function quizQ() {
    const q = weightedPick(SHOP, (f) => 'shop:' + f.jp);
    quiz.cur = { q, opts: choices(q, SHOP, 4, (f) => f.zh), done: false };
    root.querySelector('#quizBox').innerHTML = `
      <div class="card mini-quiz">
        <p class="muted small">商店單字測驗 ${quiz.n + 1}/10・答對 ${quiz.ok} <button class="linklike" id="quitQuiz">結束</button></p>
        <div class="q-big jp" data-say="${esc(q.kana)}">${esc(q.jp)}</div>
        <div class="opts">${quiz.cur.opts.map((o, i) => `<button class="opt" data-qi="${i}">${esc(o.zh)}</button>`).join('')}</div>
        <div id="qfb" class="q-feedback"></div>
      </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const bb = t.closest('[data-board]');
    if (bb) {
      boardId = bb.dataset.board;
      return draw();
    }
    const sg = t.closest('[data-seg]');
    if (sg) {
      root.querySelectorAll('.seg-word.sel').forEach((x) => x.classList.remove('sel'));
      sg.classList.add('sel');
      return showWord(segs[Number(sg.dataset.seg)]);
    }
    const wd = t.closest('[data-word]');
    if (wd) {
      const w = byJp.get(wd.dataset.word);
      return speak(w.kana);
    }
    const c = t.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      root.querySelectorAll('[data-cat]').forEach((b) => b.classList.toggle('on', b === c));
      root.querySelector('#vocab').innerHTML = vocabHtml();
      return;
    }
    if (t.closest('#startQuiz')) {
      quiz = { n: 0, ok: 0 };
      quizQ();
      root.querySelector('#quizBox').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      record('shop:' + q.jp, ok);
      if (ok) quiz.ok++;
      root.querySelectorAll('[data-qi]').forEach((b, i) => {
        if (opts[i].zh === q.zh) b.classList.add('right');
        else if (b === opt) b.classList.add('wrong');
        b.disabled = true;
      });
      root.querySelector('#qfb').innerHTML = `${ok ? '<span class="good">正解！</span>' : '<span class="bad">答錯了</span>'} <span class="jp">${esc(q.jp)}（${esc(q.kana)}）</span> = ${esc(q.zh)}${q.tip ? `<br/><small>💡 ${esc(q.tip)}</small>` : ''}`;
      speak(q.kana);
      setTimeout(() => {
        if (!alive || !quiz) return;
        quiz.n++;
        if (quiz.n >= 10) {
          root.querySelector('#quizBox').innerHTML = `<div class="card summary"><h3>測驗結束</h3><p class="big-score">${quiz.ok} / 10</p><button class="btn primary" id="startQuiz">再來一次</button> <a class="btn ghost" href="#/review">去弱點複習</a></div>`;
          quiz = null;
        } else quizQ();
      }, ok ? 1000 : 2200);
    }
  });
  root.addEventListener('input', (e) => {
    if (e.target.id === 'search') {
      query = e.target.value;
      root.querySelector('#vocab').innerHTML = vocabHtml();
    }
  });

  draw();
  return () => {
    alive = false;
  };
}
