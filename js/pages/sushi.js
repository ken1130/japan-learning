import { SUSHI, SUSHI_CATS, SUSHI_TERMS } from '../data/sushi.js';
import { kanaToRomaji } from '../data/kana.js';
import { numberToKana } from '../data/numbers.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn, pick, shuffle, choices, weightedPick, toast } from '../util.js';

const byJp = new Map(SUSHI.map((s) => [s.jp, s]));

export function render(root) {
  let alive = true;
  let cat = 'nigiri';
  let detail = null; // { item, qty, sabi }
  let history = []; // 已下單：{ jp, qty, sabi }
  let view = 'menu'; // menu | history | bill
  let hints = true;
  let mission = null;
  let quiz = null;

  function newMission() {
    const nigiri = shuffle(SUSHI.filter((s) => s.cat === 'nigiri' || s.cat === 'gunkan')).slice(0, 2);
    mission = {
      lines: nigiri.map((s, i) => ({ jp: s.jp, qty: i === 0 ? 2 : 1, sabi: i === 1 && Math.random() < 0.5 })),
      done: false,
      mistakes: 0,
    };
  }

  const missionText = () =>
    mission.lines.map((l) => `<b class="jp">${l.jp}</b>（${byJp.get(l.jp).zh}）× ${l.qty}${l.sabi ? '，<b>不要芥末</b>' : ''}`).join('、');

  function plateHtml(s) {
    return `<span class="plate" style="--c:${s.color}"><span>${s.emoji}</span></span>`;
  }

  function screenHtml() {
    if (view === 'history') {
      const total = history.reduce((sum, h) => sum + byJp.get(h.jp).price * h.qty, 0);
      return `
        <div class="tb-panel">
          <h3 class="jp">注文履歴 ${hints ? '<small>點餐紀錄</small>' : ''}</h3>
          ${history.length ? `<ul class="tb-history">${history.map((h) => `<li><span class="jp">${h.jp}${h.sabi ? '（さび抜き）' : ''}</span><span>× ${h.qty}</span><b>${byJp.get(h.jp).price * h.qty}円</b></li>`).join('')}</ul>
          <p class="tb-total">合計 <b>${total.toLocaleString()}円</b></p>` : `<p class="muted">まだ注文がありません ${hints ? '（還沒有點餐）' : ''}</p>`}
          <button class="tk-btn" data-v="menu"><b class="jp">戻る</b>${hints ? '<small class="tk-zh">返回</small>' : ''}</button>
        </div>`;
    }
    if (view === 'bill') {
      const total = history.reduce((sum, h) => sum + byJp.get(h.jp).price * h.qty, 0);
      const say = `ごうけい、${numberToKana(total)}えんです`;
      return `
        <div class="tb-panel center">
          <h3 class="jp">お会計 ${hints ? '<small>結帳</small>' : ''}</h3>
          <p class="tb-total">合計 <b>${total.toLocaleString()}円</b> ${sayBtn(say)}</p>
          <p class="jp">レジまでお越しください</p>
          ${hints ? '<p class="muted small">請到收銀台結帳。很多店是把盤子數量用平板或機器自動計算。</p>' : ''}
          <button class="tk-btn" data-v="menu"><b class="jp">戻る</b>${hints ? '<small class="tk-zh">返回</small>' : ''}</button>
        </div>`;
    }
    const items = SUSHI.filter((s) => s.cat === cat);
    return `
      <div class="tb-body">
        <nav class="tb-cats">
          ${SUSHI_CATS.map((c) => `<button data-cat="${c.id}" class="${c.id === cat ? 'on' : ''}"><b class="jp">${c.name}</b>${hints ? `<small>${c.zh}</small>` : ''}</button>`).join('')}
        </nav>
        <div class="tb-items">
          ${items.map((s) => `
            <button class="tb-item" data-item="${esc(s.jp)}">
              ${plateHtml(s)}
              <b class="jp">${esc(s.jp)}</b>
              <span class="tb-price">${s.price}円</span>
            </button>`).join('')}
        </div>
      </div>
      ${detail ? `
        <div class="tb-modal" role="dialog" aria-label="${esc(detail.item.jp)}">
          <div class="tb-modal-box">
            ${plateHtml(detail.item)}
            <div class="big-row"><span class="jp big-jp">${esc(detail.item.jp)}</span>${sayBtn(detail.item.kana)}</div>
            <div class="jp muted">${esc(detail.item.kana)}　<span class="romaji">${kanaToRomaji(detail.item.kana)}</span></div>
            <p class="zh-big">${esc(detail.item.zh)}</p>
            <div class="tb-qty"><span class="jp">数量${hints ? '<small>數量</small>' : ''}</span>
              <button class="qty-btn" data-qty="-1" aria-label="減少">−</button><b>${detail.qty}</b><button class="qty-btn" data-qty="1" aria-label="增加">＋</button>
            </div>
            ${detail.item.cat === 'nigiri' || detail.item.cat === 'gunkan' ? `
              <label class="switch tb-sabi"><input type="checkbox" id="sabi" ${detail.sabi ? 'checked' : ''}/> <span class="jp">さび抜き</span>${hints ? '<small>（不要芥末）</small>' : ''}</label>` : ''}
            <div class="tb-actions">
              <button class="tk-btn tk-cancel" data-close><b class="jp">取消</b>${hints ? '<small class="tk-zh">取消</small>' : ''}</button>
              <button class="tk-btn tk-ok" data-order><b class="jp">注文する</b>${hints ? '<small class="tk-zh">確認點餐</small>' : ''}</button>
            </div>
          </div>
        </div>` : ''}`;
  }

  function tabletHtml() {
    const count = history.reduce((n, h) => n + h.qty, 0);
    return `
      <div class="tablet">
        <div class="tb-top">
          <span class="tb-logo jp">🍣 すし ${hints ? '<small>壽司店</small>' : ''}</span>
          <button class="tb-top-btn" data-v="history"><span class="jp">注文履歴</span>${hints ? '<small>點餐紀錄</small>' : ''}${count ? `<b class="tb-badge">${count}</b>` : ''}</button>
          <button class="tb-top-btn" data-call><span class="jp">店員呼出</span>${hints ? '<small>呼叫店員</small>' : ''}</button>
          <button class="tb-top-btn tb-bill" data-v="bill"><span class="jp">お会計</span>${hints ? '<small>結帳</small>' : ''}</button>
        </div>
        <div class="tb-screen" id="tbScreen">${screenHtml()}</div>
      </div>`;
  }

  function beltHtml() {
    const plates = [...SUSHI.filter((s) => s.cat !== 'side' && s.cat !== 'dessert'), ...SUSHI.filter((s) => s.cat !== 'side' && s.cat !== 'dessert')];
    return `<div class="belt" aria-hidden="true"><div class="belt-track">${plates.map((s) => `<button class="belt-plate" data-item="${esc(s.jp)}" tabindex="-1">${plateHtml(s)}<small class="jp">${esc(s.jp)}</small></button>`).join('')}</div></div>`;
  }

  function draw() {
    root.innerHTML = `
      <header class="page-head">
        <h1>迴轉壽司 <small>🍣 平板點餐</small></h1>
        <p class="lead">現在的迴轉壽司店大多用<b>桌上的平板點餐</b>，點好的壽司會直接送到你面前。照著任務操作平板，順便記住壽司料的名字。</p>
      </header>
      ${beltHtml()}
      <div class="mission">🎯 任務：點 ${missionText()} <button class="linklike" id="newMission">換一個任務</button></div>
      <div class="sushi-layout">
        <div id="tabletWrap">${tabletHtml()}</div>
        <div class="card sushi-side">
          <label class="switch"><input type="checkbox" id="hints" ${hints ? 'checked' : ''}/> 顯示中文提示</label>
          <h3>🍵 店內用語</h3>
          <div class="term-list">
            ${SUSHI_TERMS.map((t) => `<button class="term" data-say="${esc(t.kana)}"><b class="jp">${esc(t.jp)}</b><span>${esc(t.zh)}</span>${t.tip ? `<small>💡 ${esc(t.tip)}</small>` : ''}</button>`).join('')}
          </div>
        </div>
      </div>
      <section>
        <h2 class="section-title">壽司料測驗</h2>
        <button class="btn primary small" id="startQuiz">📝 這盤是什麼？</button>
        <div id="quizBox"></div>
      </section>`;
  }

  function redrawTablet() {
    root.querySelector('#tabletWrap').innerHTML = tabletHtml();
  }

  function order() {
    const { item, qty, sabi } = detail;
    const existing = history.find((h) => h.jp === item.jp && h.sabi === sabi);
    if (existing) existing.qty += qty;
    else history.push({ jp: item.jp, qty, sabi });
    detail = null;
    speak('ごちゅうもんありがとうございます');
    toast(`已點 ${item.jp} × ${qty}${sabi ? '（不要芥末）' : ''}`);
    checkMission();
    redrawTablet();
  }

  function checkMission() {
    if (mission.done) return;
    const ok = mission.lines.every((l) => history.some((h) => h.jp === l.jp && h.qty >= l.qty && h.sabi === l.sabi));
    if (ok) {
      mission.done = true;
      mission.lines.forEach((l) => record('sushi:' + l.jp, true));
      if (mission.lines.some((l) => l.sabi)) record('sushi:さび抜き', true);
      setTimeout(() => alive && toast('🎉 任務完成！可以按「お会計」看看結帳畫面', 3000), 600);
    }
  }

  function quizQ() {
    const q = weightedPick(SUSHI, (s) => 'sushi:' + s.jp);
    quiz.cur = { q, opts: choices(q, SUSHI, 4, (s) => s.zh), done: false };
    root.querySelector('#quizBox').innerHTML = `
      <div class="card mini-quiz">
        <p class="muted small">壽司料測驗 ${quiz.n + 1}/10・答對 ${quiz.ok}</p>
        <div class="q-big jp" data-say="${esc(q.kana)}">${esc(q.jp)}</div>
        <div class="opts">${quiz.cur.opts.map((o, i) => `<button class="opt" data-qi="${i}">${esc(o.zh)}</button>`).join('')}</div>
        <div id="qfb" class="q-feedback"></div>
      </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const c = t.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      return redrawTablet();
    }
    const it = t.closest('[data-item]');
    if (it) {
      const item = byJp.get(it.dataset.item);
      if (it.classList.contains('belt-plate')) {
        speak(item.kana);
        return toast(`${item.jp}（${item.kana}）= ${item.zh}`, 2200);
      }
      detail = { item, qty: 1, sabi: false };
      view = 'menu';
      redrawTablet();
      speak(item.kana);
      return;
    }
    const q = t.closest('[data-qty]');
    if (q && detail) {
      detail.qty = Math.min(4, Math.max(1, detail.qty + Number(q.dataset.qty)));
      return redrawTablet();
    }
    if (t.closest('[data-close]')) {
      detail = null;
      return redrawTablet();
    }
    if (t.closest('[data-order]') && detail) return order();
    const v = t.closest('[data-v]');
    if (v) {
      view = v.dataset.v;
      detail = null;
      redrawTablet();
      if (view === 'bill' && history.length) {
        const total = history.reduce((sum, h) => sum + byJp.get(h.jp).price * h.qty, 0);
        speak(`ごうけい、${numberToKana(total)}えんです`);
      }
      return;
    }
    if (t.closest('[data-call]')) {
      speak('しょうしょうおまちください');
      return toast('店員：少々お待ちください（請稍等）');
    }
    if (t.closest('#newMission')) {
      newMission();
      history = [];
      return draw();
    }
    if (t.closest('#startQuiz')) {
      quiz = { n: 0, ok: 0 };
      return quizQ();
    }
    const opt = t.closest('[data-qi]');
    if (opt && quiz?.cur && !quiz.cur.done) {
      const { q: qq, opts } = quiz.cur;
      quiz.cur.done = true;
      const ok = opts[Number(opt.dataset.qi)].zh === qq.zh;
      record('sushi:' + qq.jp, ok);
      if (ok) quiz.ok++;
      root.querySelectorAll('[data-qi]').forEach((b, i) => {
        if (opts[i].zh === qq.zh) b.classList.add('right');
        else if (b === opt) b.classList.add('wrong');
        b.disabled = true;
      });
      root.querySelector('#qfb').innerHTML = `<span class="jp">${esc(qq.jp)}（${esc(qq.kana)}）</span> = ${esc(qq.zh)}`;
      speak(qq.kana);
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
  root.addEventListener('change', (e) => {
    if (e.target.id === 'sabi' && detail) detail.sabi = e.target.checked;
    if (e.target.id === 'hints') {
      hints = e.target.checked;
      redrawTablet();
    }
  });
  const onKey = (e) => {
    if (e.key === 'Escape' && detail) {
      detail = null;
      redrawTablet();
    }
  };
  document.addEventListener('keydown', onKey);

  newMission();
  draw();
  return () => {
    alive = false;
    document.removeEventListener('keydown', onKey);
  };
}
