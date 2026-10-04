import { DIALOGUES } from '../data/dialogues.js';
import { kanaToRomaji } from '../data/kana.js';
import { record, mastery, itemStats } from '../progress.js';
import { speak } from '../speech.js';
import { esc, shuffle } from '../util.js';

const stepIds = (d) => d.steps.map((_, i) => `dlg:${d.id}:${i}`);

export function render(root) {
  let dlg = null;
  let step = 0;
  let log = []; // 聊天紀錄：{ who: 'npc' | 'me', jp, kana, zh, revealed }
  let order = [];
  let firstTry = true;
  let answered = false;
  let results = [];

  function list() {
    dlg = null;
    root.innerHTML = `
      <header class="page-head">
        <h1>情境對話 <small>🎭 模擬真實對話</small></h1>
        <p class="lead">像玩遊戲一樣，模擬在日本會遇到的對話。對方說話時會自動唸出來，你要選出「他在說什麼」或「你該怎麼回」。選錯沒關係，每個選項都有解說。</p>
      </header>
      <div class="card how-to">
        <b>玩法</b>
        <ol>
          <li>👂 <b>聽懂題</b>：對方說一句日文，選出正確的中文意思。</li>
          <li>💬 <b>回答題</b>：根據情境，選出最適合的日文回答。每個選項旁的 🔊 可以先聽發音。</li>
          <li>答錯可以再選，但只有<b>第一次</b>的答案會記入學習進度，錯的會出現在「弱點複習」。</li>
        </ol>
      </div>
      <div class="dlg-grid">
        ${DIALOGUES.map((d) => {
          const ids = stepIds(d);
          const tried = ids.filter((id) => itemStats(id)).length;
          const pct = Math.round(mastery(ids) * 100);
          return `
          <button class="dlg-card" data-dlg="${d.id}">
            <span class="dlg-icon">${d.icon}</span>
            <span class="dlg-body">
              <b>${esc(d.title)}</b>
              <small>${esc(d.desc)}</small>
              <span class="dlg-meta">
                <span class="level" title="難度">${'★'.repeat(d.level)}${'☆'.repeat(3 - d.level)}</span>
                <span>${d.steps.length} 步</span>
                ${tried ? `<span>熟練度 ${pct}%</span>` : '<span class="new">NEW</span>'}
              </span>
              <span class="bar"><i style="width:${pct}%"></i></span>
            </span>
          </button>`;
        }).join('')}
      </div>`;
  }

  function start(d) {
    dlg = d;
    step = 0;
    log = [];
    results = [];
    history.replaceState(null, '', `#/dialogue?${d.id}`);
    drawStep();
  }

  function bubble(l, i) {
    if (l.who === 'me') return `<div class="bubble me"><div class="jp" data-say="${esc(l.jp)}">${esc(l.jp)}</div></div>`;
    const showKana = l.kana && l.kana !== l.jp;
    return `
      <div class="bubble npc">
        <span class="avatar">${dlg.icon}</span>
        <div class="bubble-body">
          <div class="jp npc-jp">${esc(l.jp)} <button class="say small-say" data-say="${esc(l.jp)}" aria-label="播放">🔊</button></div>
          ${showKana ? `<div class="jp npc-kana">${esc(l.kana)}</div>` : ''}
          <div class="romaji">${esc(kanaToRomaji(l.kana || l.jp))}</div>
          ${l.revealed ? `<div class="npc-zh">${esc(l.zh)}</div>` : `<button class="linklike reveal" data-reveal="${i}">顯示中文</button>`}
        </div>
      </div>`;
  }

  function drawStep() {
    const st = dlg.steps[step];
    if (st.npc && !log.some((l) => l.step === step)) log.push({ who: 'npc', step, ...st.npc, revealed: false });
    order = shuffle(st.choices);
    firstTry = true;
    answered = false;
    const isUnderstand = st.type === 'understand';
    root.innerHTML = `
      <div class="dlg-play">
        <div class="dlg-top">
          <button class="btn small ghost" id="toList">← 對話列表</button>
          <b>${dlg.icon} ${esc(dlg.title)}</b>
          <span class="muted">${step + 1} / ${dlg.steps.length}</span>
        </div>
        <span class="bar"><i style="width:${(step / dlg.steps.length) * 100}%"></i></span>
        <div class="chat" id="chat">
          ${log.map(bubble).join('')}
          ${st.situation ? `<div class="situation">🎯 ${esc(st.situation)}</div>` : ''}
        </div>
        <div class="choice-panel">
          <p class="q-label">${isUnderstand ? '👂 對方在說什麼？' : '💬 你要怎麼回？'}</p>
          <div class="dlg-opts">
            ${order.map((c, i) => `
              <div class="dlg-opt-row">
                <button class="opt dlg-opt ${isUnderstand ? '' : 'jp'}" data-i="${i}"><kbd>${i + 1}</kbd>${esc(c.jp || c.zh)}</button>
                ${c.jp ? `<button class="say" data-say="${esc(c.jp)}" aria-label="聽這個選項">🔊</button>` : ''}
              </div>`).join('')}
          </div>
          <div id="dfb" class="dlg-fb" aria-live="polite"></div>
        </div>
      </div>`;
    const chat = root.querySelector('#chat');
    chat.scrollTop = chat.scrollHeight;
    if (st.npc) speak(st.npc.jp);
  }

  function choose(i) {
    if (answered) return;
    const st = dlg.steps[step];
    const c = order[i];
    const btn = root.querySelector(`.dlg-opt[data-i="${i}"]`);
    if (!btn || btn.disabled) return;
    if (firstTry) {
      record(`dlg:${dlg.id}:${step}`, c.ok);
      results.push(c.ok);
    }
    const fb = root.querySelector('#dfb');
    if (!c.ok) {
      firstTry = false;
      btn.classList.add('wrong');
      btn.disabled = true;
      fb.innerHTML = `<div class="fb-box bad-box">❌ ${esc(c.fb)}<br/><small>再選一次看看！</small></div>`;
      return;
    }
    answered = true;
    btn.classList.add('right');
    root.querySelectorAll('.dlg-opt').forEach((b) => (b.disabled = true));
    if (st.type === 'understand') {
      const npc = log.find((l) => l.step === step);
      if (npc) npc.revealed = true;
    } else {
      log.push({ who: 'me', jp: c.jp });
      speak(c.jp);
    }
    const last = step === dlg.steps.length - 1;
    fb.innerHTML = `
      <div class="fb-box good-box">⭕ ${esc(c.fb)}</div>
      <button class="btn primary" id="nextStep">${last ? '看結果 🎉' : '下一步 →'}</button>`;
    fb.querySelector('#nextStep').focus({ preventScroll: true });
    // 顯示更新後的聊天紀錄（加入我的回答／中文翻譯）
    const chat = root.querySelector('#chat');
    chat.innerHTML = log.map(bubble).join('') + (st.situation ? `<div class="situation done">🎯 ${esc(st.situation)}</div>` : '');
    chat.scrollTop = chat.scrollHeight;
  }

  function summary() {
    const ok = results.filter(Boolean).length;
    const pct = Math.round((ok / dlg.steps.length) * 100);
    const missed = dlg.steps.map((st, i) => ({ st, i })).filter(({ i }) => results[i] === false);
    root.innerHTML = `
      <div class="card summary">
        <div class="score-ring" style="--p:${pct}"><span>${ok}/${dlg.steps.length}</span></div>
        <h2>${pct === 100 ? '完璧！一次全對！' : pct >= 70 ? 'すごい！很不錯！' : '多練幾次就會越來越順 💪'}</h2>
        ${missed.length ? `
          <div class="missed-list">
            <p>第一次答錯的地方：</p>
            ${missed.map(({ st }) => {
              const right = st.choices.find((c) => c.ok);
              return `<div class="missed-item">
                <div>${st.npc ? `<span class="jp" data-say="${esc(st.npc.jp)}">🔊 ${esc(st.npc.jp)}</span>` : esc(st.situation)}</div>
                <div class="good">→ ${esc(right.jp || right.zh)}</div>
              </div>`;
            }).join('')}
          </div>` : ''}
        <div class="row-actions">
          <button class="btn primary" id="again">再玩一次</button>
          <button class="btn ghost" id="toList">換一個對話</button>
        </div>
      </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const card = t.closest('[data-dlg]');
    if (card) return start(DIALOGUES.find((d) => d.id === card.dataset.dlg));
    if (t.closest('#toList')) {
      history.replaceState(null, '', '#/dialogue');
      return list();
    }
    if (t.closest('#again')) return start(dlg);
    const rv = t.closest('[data-reveal]');
    if (rv) {
      log[Number(rv.dataset.reveal)].revealed = true;
      rv.outerHTML = `<div class="npc-zh">${esc(log[Number(rv.dataset.reveal)].zh)}</div>`;
      return;
    }
    const opt = t.closest('.dlg-opt');
    if (opt) return choose(Number(opt.dataset.i));
    if (t.closest('#nextStep')) {
      step++;
      if (step >= dlg.steps.length) summary();
      else drawStep();
    }
  });

  const onKey = (e) => {
    if (!dlg || e.target.matches('input, textarea')) return;
    if (/^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
  };
  document.addEventListener('keydown', onKey);

  const initial = DIALOGUES.find((d) => d.id === location.hash.split('?')[1]);
  if (initial) start(initial);
  else list();
  return () => document.removeEventListener('keydown', onKey);
}
