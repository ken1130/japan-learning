import { FOOD, FOOD_CATS, MENUS } from '../data/food.js';
import { kanaToRomaji } from '../data/kana.js';
import { numberToKana } from '../data/numbers.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn, choices, weightedPick } from '../util.js';

const byJp = new Map(FOOD.map((f) => [f.jp, f]));

export function render(root) {
  let menuId = MENUS[0].id;
  let vocabCat = 'all';
  let query = '';
  let quiz = null;

  function menuHtml(m) {
    return `
      <div class="menu-board menu-${m.style}">
        <div class="menu-title">
          <span class="jp">${esc(m.name)}</span>
          <small class="jp">${esc(m.kana)}</small>
        </div>
        ${m.sections.map((s, si) => `
          <div class="menu-section">
            <h3 class="jp">${esc(s.title)}</h3>
            <ul>
              ${s.items.map((it, ii) => `
                <li class="menu-item" data-item="${si}:${ii}" tabindex="0">
                  <span class="jp mi-name">${esc(it.jp)}${it.badge ? `<em class="mi-badge">${esc(it.badge)}</em>` : ''}</span>
                  <span class="mi-dots"></span>
                  <span class="mi-price">${it.price.toLocaleString()}<small>円</small></span>
                </li>`).join('')}
            </ul>
          </div>`).join('')}
        <p class="menu-foot jp">※価格は税込です</p>
      </div>`;
  }

  function itemDetail(it) {
    const priceKana = numberToKana(it.price) + 'えん';
    const order = `${it.jp.replace(/（.*?）/g, '')}をください`;
    return `
      <div class="pop">
        <div class="big-row"><span class="jp big-jp">${esc(it.jp)}</span>${sayBtn(it.kana)}</div>
        <div class="jp muted">${esc(it.kana)}</div>
        <div class="romaji">${kanaToRomaji(it.kana)}</div>
        <p class="zh-big">${esc(it.zh)}</p>
        ${it.badge ? `<p>🏷️ <span class="jp">${esc(it.badge)}</span>：${esc(badgeZh(it.badge))}</p>` : ''}
        <p>💴 ${it.price.toLocaleString()} 円 = <span class="jp">${priceKana}</span> ${sayBtn(priceKana)}</p>
        <h4>拆解單字</h4>
        <div class="parts">
          ${it.parts.map((p) => byJp.get(p)).filter(Boolean).map((f) => `
            <button class="part" data-say="${esc(f.kana)}">
              <span class="emoji">${f.emoji}</span><span class="jp">${esc(f.jp)}</span><small>${esc(f.zh)}</small>
            </button>`).join('')}
        </div>
        <h4>點這道菜</h4>
        <p><span class="jp">${esc(order)}</span> ${sayBtn(order)}<br/><small class="muted">（請給我 ${esc(it.zh)}）</small></p>
      </div>`;
  }

  function vocabHtml() {
    const q = query.trim().toLowerCase();
    const items = FOOD.filter((f) => (vocabCat === 'all' || f.cat === vocabCat) && (!q || f.jp.includes(q) || f.kana.includes(q) || f.zh.includes(q) || kanaToRomaji(f.kana).includes(q)));
    return items.length
      ? items.map((f) => `
        <button class="vocab" data-say="${esc(f.kana)}">
          <span class="emoji">${f.emoji}</span>
          <span class="jp v-jp">${esc(f.jp)}</span>
          ${f.kana !== f.jp ? `<span class="jp v-kana">${esc(f.kana)}</span>` : ''}
          <span class="romaji">${kanaToRomaji(f.kana)}</span>
          <span class="v-zh">${esc(f.zh)}</span>
        </button>`).join('')
      : '<p class="muted">找不到符合的單字</p>';
  }

  function draw() {
    const m = MENUS.find((x) => x.id === menuId);
    root.innerHTML = `
      <header class="page-head">
        <h1>看懂菜單</h1>
        <p class="lead">點菜單上的任何一道菜，看讀音、意思、拆解單字，還有怎麼點餐。</p>
      </header>
      <div class="seg">${MENUS.map((x) => `<button data-menu="${x.id}" class="${x.id === menuId ? 'on' : ''}">${esc(x.name)}</button>`).join('')}</div>
      <p class="tip">💡 ${esc(m.tip)}</p>
      <div class="menu-layout">
        ${menuHtml(m)}
        <aside class="card menu-detail" id="itemDetail"><p class="muted">👈 點一道菜看看</p></aside>
      </div>

      <section>
        <h2 class="section-title">菜單單字庫 <small>${FOOD.length} 個</small></h2>
        <div class="toolbar">
          <div class="tabs small">
            <button data-vcat="all" class="${vocabCat === 'all' ? 'on' : ''}">全部</button>
            ${FOOD_CATS.map((c) => `<button data-vcat="${c.id}" class="${vocabCat === c.id ? 'on' : ''}">${c.icon} ${c.name}</button>`).join('')}
          </div>
          <input class="search" id="search" placeholder="搜尋：拉麵、ramen、らーめん" value="${esc(query)}" />
          <button class="btn primary small" id="startQuiz">📝 單字測驗</button>
        </div>
        <div class="vocab-grid" id="vocab">${vocabHtml()}</div>
      </section>`;
  }

  // ---- 單字測驗（看日文選中文） ----
  function quizQ() {
    const q = weightedPick(FOOD, (f) => 'food:' + f.jp);
    quiz.cur = { q, opts: choices(q, FOOD, 4, (f) => f.zh), done: false };
    const d = root.querySelector('#itemDetail');
    d.innerHTML = `
      <div class="mini-quiz">
        <p class="muted small">單字測驗 ${quiz.n + 1}/10・答對 ${quiz.ok}</p>
        <div class="q-big jp" data-say="${esc(q.kana)}">${esc(q.jp)}</div>
        <div class="opts">${quiz.cur.opts.map((o, i) => `<button class="opt" data-qi="${i}">${esc(o.zh)}</button>`).join('')}</div>
        <div id="qfb" class="q-feedback"></div>
      </div>`;
    d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const mb = t.closest('[data-menu]');
    if (mb) {
      menuId = mb.dataset.menu;
      quiz = null;
      return draw();
    }
    const item = t.closest('[data-item]');
    if (item) {
      const [si, ii] = item.dataset.item.split(':').map(Number);
      const it = MENUS.find((x) => x.id === menuId).sections[si].items[ii];
      root.querySelectorAll('.menu-item.sel').forEach((x) => x.classList.remove('sel'));
      item.classList.add('sel');
      quiz = null;
      const d = root.querySelector('#itemDetail');
      d.innerHTML = itemDetail(it);
      speak(it.kana);
      if (matchMedia('(max-width: 760px)').matches) d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const vc = t.closest('[data-vcat]');
    if (vc) {
      vocabCat = vc.dataset.vcat;
      root.querySelectorAll('[data-vcat]').forEach((b) => b.classList.toggle('on', b === vc));
      root.querySelector('#vocab').innerHTML = vocabHtml();
      return;
    }
    if (t.closest('#startQuiz')) {
      quiz = { n: 0, ok: 0, cur: null };
      return quizQ();
    }
    const opt = t.closest('[data-qi]');
    if (opt && quiz?.cur && !quiz.cur.done) {
      const { q, opts } = quiz.cur;
      quiz.cur.done = true;
      const ok = opts[Number(opt.dataset.qi)].zh === q.zh;
      record('food:' + q.jp, ok);
      if (ok) quiz.ok++;
      root.querySelectorAll('[data-qi]').forEach((b, i) => {
        if (opts[i].zh === q.zh) b.classList.add('right');
        else if (b === opt) b.classList.add('wrong');
        b.disabled = true;
      });
      root.querySelector('#qfb').innerHTML = `${ok ? '<span class="good">正解！</span>' : '<span class="bad">答錯了</span>'} <span class="jp">${esc(q.jp)}（${esc(q.kana)}）</span> = ${esc(q.zh)}`;
      speak(q.kana);
      setTimeout(() => {
        if (!quiz || !root.isConnected) return;
        quiz.n++;
        if (quiz.n >= 10) {
          root.querySelector('#itemDetail').innerHTML = `<div class="summary"><h3>測驗結束</h3><p class="big-score">${quiz.ok} / 10</p><button class="btn primary" id="startQuiz">再來一次</button></div>`;
          quiz = null;
        } else quizQ();
      }, ok ? 900 : 1800);
    }
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('.menu-item')) e.target.click();
  });
  root.addEventListener('input', (e) => {
    if (e.target.id === 'search') {
      query = e.target.value;
      root.querySelector('#vocab').innerHTML = vocabHtml();
    }
  });

  draw();
  return () => {
    quiz = null;
  };
}

function badgeZh(b) {
  return { 人気: '人氣商品', おすすめ: '店家推薦', 限定: '限定', おかわり無料: '免費續碗' }[b] || b;
}
