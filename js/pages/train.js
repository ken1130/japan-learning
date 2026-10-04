import { YAMANOTE, FARES_FROM_TOKYO, TRAIN_WORDS } from '../data/train.js';
import { kanaToRomaji } from '../data/kana.js';
import { numberToKana } from '../data/numbers.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn, pick, shuffle, choices, weightedPick, toast } from '../util.js';

const N = YAMANOTE.length;

export function render(root) {
  let alive = true;
  let tab = 'machine';

  // ---------- 售票機 ----------
  let mission = null;
  let mstate = null;

  function newMission() {
    const f = pick(FARES_FROM_TOKYO);
    const adults = Math.random() < 0.6 ? 1 : 2;
    mission = { ...f, adults };
    mstate = { step: 'home', paid: 0, mistakes: 0 };
  }

  const station = (jp) => YAMANOTE.find((s) => s.jp === jp);

  function machineHtml() {
    const s = station(mission.to);
    const total = mission.fare * mission.adults;
    let screen = '';
    const btn = (act, jp, zh, extra = '') => `<button class="tk-btn ${extra}" data-act="${act}"><b class="jp">${jp}</b><small class="tk-zh">${zh}</small></button>`;
    if (mstate.step === 'home') {
      screen = `
        <p class="tk-msg jp">ご希望のボタンを押してください</p><p class="tk-msg-zh">請按下您要的按鈕</p>
        <div class="tk-grid">${btn('ticket', 'きっぷ', '買車票')}${btn('charge', 'チャージ', 'IC 卡儲值')}${btn('adjust', '精算', '補票')}${btn('call', '呼出', '呼叫站務員')}</div>`;
    } else if (mstate.step === 'fare') {
      const fares = [...new Set(FARES_FROM_TOKYO.map((f) => f.fare))].sort((a, b) => a - b);
      screen = `
        <p class="tk-msg jp">金額を選んでください</p><p class="tk-msg-zh">請選擇金額（看左邊的運賃表）</p>
        <div class="tk-grid fares">${fares.map((f) => btn('fare:' + f, f + '円', '')).join('')}</div>
        <div class="tk-grid">${btn('cancel', '取消', '取消', 'tk-cancel')}</div>`;
    } else if (mstate.step === 'people') {
      screen = `
        <p class="tk-msg jp">人数を選んでください</p><p class="tk-msg-zh">請選擇人數</p>
        <div class="tk-grid">${btn('p:1', '大人 1名', '全票 1 張')}${btn('p:2', '大人 2名', '全票 2 張')}${btn('p:c', '小児 1名', '兒童票 1 張')}${btn('cancel', '取消', '取消', 'tk-cancel')}</div>`;
    } else if (mstate.step === 'pay') {
      screen = `
        <p class="tk-msg jp">お金を入れてください</p><p class="tk-msg-zh">請投入金額</p>
        <p class="tk-amount">合計 <b>${total}円</b>　投入 <b>${mstate.paid}円</b></p>
        <div class="tk-grid coins">${[100, 500, 1000].map((c) => `<button class="coin ${c === 1000 ? 'bill' : ''}" data-act="pay:${c}">${c}円</button>`).join('')}</div>
        <div class="tk-grid">${btn('cancel', '取消', '取消', 'tk-cancel')}</div>`;
    } else {
      const change = mstate.paid - total;
      screen = `
        <p class="tk-msg jp">きっぷ${change ? 'とおつり' : ''}をお取りください</p><p class="tk-msg-zh">請拿取車票${change ? '和找零' : ''}</p>
        <div class="ticket">
          <div class="ticket-head jp">乗車券</div>
          <div class="ticket-body jp">東京 → ${mission.fare}円区間</div>
          <div class="ticket-foot jp">大人 ${mission.adults}名・${total}円${change ? `・おつり ${change}円` : ''}</div>
        </div>
        <p class="good">${mstate.mistakes ? `完成！（中途按錯 ${mstate.mistakes} 次）` : '完美！一次就買對了 🎉'}</p>
        <button class="btn primary" data-act="next">下一個任務 →</button>`;
    }
    return `
      <div class="machine-layout">
        <div class="card fare-map">
          <h3>🗺️ 運賃表（運賃表）</h3>
          <p class="muted small">售票機上方的票價圖：找到目的地，旁邊的數字就是票價（示意）。</p>
          <ul class="fare-list">
            <li class="here">📍 東京（現在地）</li>
            ${FARES_FROM_TOKYO.map((f) => `<li><span class="jp">${f.to}</span><small class="muted">${station(f.to)?.kana || ''}</small><b>${f.fare}円</b></li>`).join('')}
          </ul>
        </div>
        <div>
          <div class="mission">🎯 任務：從<b>東京</b>買 <b>大人 ${mission.adults} 張</b>到 <b class="jp">${mission.to}</b>（<span class="jp">${s?.kana || ''}</span>）的車票</div>
          <div class="ticket-machine">
            <div class="tk-top jp">きっぷうりば　<small>JR</small></div>
            <div class="tk-screen">${screen}</div>
            <div class="tk-hint" id="tkHint" aria-live="polite"></div>
          </div>
        </div>
      </div>`;
  }

  function machineAct(act) {
    const total = mission.fare * mission.adults;
    const hint = (msg) => {
      mstate.mistakes++;
      const h = root.querySelector('#tkHint');
      if (h) h.textContent = '💡 ' + msg;
    };
    if (act === 'next') {
      newMission();
      return drawTab();
    }
    if (act === 'cancel') {
      mstate = { step: 'home', paid: 0, mistakes: mstate.mistakes };
      toast('取消（とりけし）：回到第一步');
      return drawTab();
    }
    if (mstate.step === 'home') {
      if (act === 'ticket') mstate.step = 'fare';
      else return hint({ charge: '「チャージ」是幫 IC 卡（Suica 等）儲值，我們要買車票「きっぷ」。', adjust: '「精算」是車資不夠時補票用的。', call: '「呼出」會叫站務員過來，有問題時再按。' }[act]);
    } else if (mstate.step === 'fare') {
      const f = Number(act.split(':')[1]);
      if (f !== mission.fare) return hint(`到${mission.to}的票價不是 ${f} 円喔，看左邊運賃表找「${mission.to}」。`);
      record('train:運賃表', mstate.mistakes === 0);
      mstate.step = 'people';
    } else if (mstate.step === 'people') {
      const p = act.split(':')[1];
      if (p === 'c') return hint('「小児」是兒童票，任務是買大人的票。');
      if (Number(p) !== mission.adults) return hint(`任務是 ${mission.adults} 張喔。「名」是人數的單位。`);
      mstate.step = 'pay';
    } else if (mstate.step === 'pay') {
      mstate.paid += Number(act.split(':')[1]);
      if (mstate.paid >= total) {
        mstate.step = 'done';
        record('train:切符', mstate.mistakes === 0);
        speak(mstate.paid > total ? 'きっぷとおつりをおとりください' : 'きっぷをおとりください');
      }
    }
    drawTab();
  }

  // ---------- 山手線廣播遊戲 ----------
  let game = { cur: Math.floor(Math.random() * N), dir: 1, answered: false, ok: 0, n: 0, opts: [] };

  function nextIdx() {
    return (game.cur + game.dir + N) % N;
  }

  function announcement() {
    const nx = YAMANOTE[nextIdx()];
    let a = `次は、${nx.jp}、${nx.jp}。`;
    if (nx.t) a += `${nx.t.split('・')[0]}は、お乗り換えです。`;
    return a;
  }

  function mapSvg() {
    const cx = 260;
    const cy = 250;
    const r = 175;
    const pos = (i) => {
      const a = (i / N) * Math.PI * 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a), a];
    };
    const nx = nextIdx();
    return `
      <svg class="line-map" viewBox="0 0 520 500" role="img" aria-label="山手線路線圖，現在在${YAMANOTE[game.cur].jp}">
        <circle cx="${cx}" cy="${cy}" r="${r}" class="lm-track" />
        <text x="${cx}" y="${cy - 10}" class="lm-center jp">山手線</text>
        <text x="${cx}" y="${cy + 14}" class="lm-center-sub">${game.dir === 1 ? '外回り（順時針 ↻）' : '内回り（逆時針 ↺）'}</text>
        ${YAMANOTE.map((s, i) => {
          const [x, y, a] = pos(i);
          const cls = i === game.cur ? 'cur' : game.answered && i === nx ? 'next' : '';
          const showLabel = s.t || i === game.cur || (game.answered && i === nx);
          const lx = cx + (r + 16) * Math.cos(a);
          const ly = cy + (r + 16) * Math.sin(a);
          const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
          const dy = Math.sin(a) > 0.3 ? 12 : Math.sin(a) < -0.3 ? -4 : 4;
          return `
            <g class="lm-st ${cls}" data-st="${i}" tabindex="0" role="button" aria-label="${s.jp}（${s.kana}）">
              <circle cx="${x}" cy="${y}" r="${i === game.cur ? 9 : s.t ? 6.5 : 5}" />
              ${showLabel ? `<text x="${lx}" y="${ly + dy}" text-anchor="${anchor}" class="jp">${s.jp}</text>` : ''}
            </g>`;
        }).join('')}
      </svg>`;
  }

  function newRound() {
    game.cur = Math.floor(Math.random() * N);
    game.answered = false;
    const nx = YAMANOTE[nextIdx()];
    const pool = YAMANOTE.filter((s, i) => i !== game.cur);
    game.opts = choices(nx, pool, 4, (s) => s.jp);
  }

  function gameHtml() {
    const cur = YAMANOTE[game.cur];
    const nx = YAMANOTE[nextIdx()];
    return `
      <div class="game-layout">
        <div class="card map-card">${mapSvg()}</div>
        <div class="card announce">
          <div class="seg">
            <button data-dir="1" class="${game.dir === 1 ? 'on' : ''}">外回り ↻</button>
            <button data-dir="-1" class="${game.dir === -1 ? 'on' : ''}">内回り ↺</button>
          </div>
          <p>📍 現在地：<b class="jp">${cur.jp}</b> <span class="jp muted">${cur.kana}</span></p>
          <p class="muted small">車內廣播會說「次は、〇〇」（下一站是〇〇）。按播放，選出下一站：</p>
          <button class="btn primary" id="playAnn">🔊 播放車內廣播</button>
          <div class="opts station-opts">
            ${game.opts.map((s, i) => `<button class="opt" data-ans="${i}" ${game.answered ? 'disabled' : ''}><span class="jp">${s.jp}</span><small class="muted jp">${s.kana}</small></button>`).join('')}
          </div>
          <div class="q-feedback" id="annFb">${game.answered ? `
            <div class="jp">${esc(announcement())}</div>
            <div class="muted small">下一站是「${nx.jp}（${nx.kana}）」${nx.t ? `，可轉乘：${esc(nx.t)}` : ''}</div>
            <button class="btn" id="nextRound">下一題 →</button>` : ''}</div>
          <p class="muted small">本次答對 ${game.ok} / ${game.n}　・　點地圖上的車站可以聽站名</p>
        </div>
      </div>`;
  }

  // ---------- 單字 ----------
  let wq = null;
  function wordsHtml() {
    return `
      <div class="toolbar"><button class="btn primary small" id="wordQuiz">📝 電車單字測驗</button></div>
      <div id="wqBox"></div>
      <div class="vocab-grid">
        ${TRAIN_WORDS.map((w) => `
          <button class="vocab" data-say="${esc(w.kana)}" title="${esc(w.tip || '')}">
            <span class="jp v-jp">${esc(w.jp)}</span>
            <span class="jp v-kana">${esc(w.kana)}</span>
            <span class="romaji">${kanaToRomaji(w.kana)}</span>
            <span class="v-zh">${esc(w.zh)}</span>
            ${w.tip ? `<small class="v-tip">💡 ${esc(w.tip)}</small>` : ''}
          </button>`).join('')}
      </div>
      <p class="muted small">車內廣播的完整句子在 <a href="#/phrases">旅遊會話 → 交通</a>。</p>`;
  }
  function wordQ() {
    const q = weightedPick(TRAIN_WORDS, (w) => 'train:' + w.jp);
    wq.cur = { q, opts: choices(q, TRAIN_WORDS, 4, (w) => w.zh), done: false };
    root.querySelector('#wqBox').innerHTML = `
      <div class="card mini-quiz">
        <p class="muted small">電車單字 ${wq.n + 1}/10・答對 ${wq.ok}</p>
        <div class="q-big jp" data-say="${esc(q.kana)}">${esc(q.jp)}</div>
        <div class="opts">${wq.cur.opts.map((o, i) => `<button class="opt" data-wi="${i}">${esc(o.zh)}</button>`).join('')}</div>
        <div id="wfb" class="q-feedback"></div>
      </div>`;
  }

  function drawTab() {
    const body = root.querySelector('#tabBody');
    if (tab === 'machine') body.innerHTML = machineHtml();
    else if (tab === 'game') body.innerHTML = gameHtml();
    else body.innerHTML = wordsHtml();
  }

  root.innerHTML = `
    <header class="page-head">
      <h1>搭電車 <small>🚃 售票機・路線圖・車內廣播</small></h1>
      <p class="lead">東京的電車很多，但只要會<b>買票、看懂路線、聽懂「下一站」</b>就能到處跑。用 Suica 等 IC 卡最方便，但學會用售票機以備不時之需。</p>
    </header>
    <div class="tabs" role="tablist">
      <button data-tab="machine" class="on" role="tab">🎫 售票機模擬</button>
      <button data-tab="game" role="tab">🗺️ 山手線廣播遊戲</button>
      <button data-tab="words" role="tab">📖 電車單字</button>
    </div>
    <div id="tabBody"></div>`;

  newMission();
  newRound();
  drawTab();

  root.addEventListener('click', (e) => {
    const t = e.target;
    const tb = t.closest('[data-tab]');
    if (tb) {
      tab = tb.dataset.tab;
      root.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b === tb));
      return drawTab();
    }
    const act = t.closest('[data-act]');
    if (act) return machineAct(act.dataset.act);
    const dir = t.closest('[data-dir]');
    if (dir) {
      game.dir = Number(dir.dataset.dir);
      newRound();
      return drawTab();
    }
    if (t.closest('#playAnn')) return speak(announcement());
    const st = t.closest('[data-st]');
    if (st) {
      const s = YAMANOTE[Number(st.dataset.st)];
      speak(s.kana);
      return toast(`${s.jp}（${s.kana}）${s.t ? '・轉乘：' + s.t : ''}`, 2400);
    }
    const ans = t.closest('[data-ans]');
    if (ans && !game.answered) {
      const nx = YAMANOTE[nextIdx()];
      const chosen = game.opts[Number(ans.dataset.ans)];
      const ok = chosen.jp === nx.jp;
      record('station:' + nx.jp, ok);
      game.n++;
      if (ok) game.ok++;
      game.answered = true;
      drawTab();
      root.querySelectorAll('[data-ans]').forEach((b, i) => {
        if (game.opts[i].jp === nx.jp) b.classList.add('right');
        else if (b === root.querySelectorAll('[data-ans]')[Number(ans.dataset.ans)]) b.classList.add('wrong');
      });
      root.querySelector('#annFb').insertAdjacentHTML('afterbegin', ok ? '<div class="good">正解！</div>' : '<div class="bad">答錯了</div>');
      speak(nx.kana);
      return;
    }
    if (t.closest('#nextRound')) {
      newRound();
      drawTab();
      setTimeout(() => alive && speak(announcement()), 300);
      return;
    }
    if (t.closest('#wordQuiz')) {
      wq = { n: 0, ok: 0 };
      return wordQ();
    }
    const wo = t.closest('[data-wi]');
    if (wo && wq?.cur && !wq.cur.done) {
      const { q, opts } = wq.cur;
      wq.cur.done = true;
      const ok = opts[Number(wo.dataset.wi)].zh === q.zh;
      record('train:' + q.jp, ok);
      if (ok) wq.ok++;
      root.querySelectorAll('[data-wi]').forEach((b, i) => {
        if (opts[i].zh === q.zh) b.classList.add('right');
        else if (b === wo) b.classList.add('wrong');
        b.disabled = true;
      });
      root.querySelector('#wfb').innerHTML = `<span class="jp">${esc(q.jp)}（${esc(q.kana)}）</span> = ${esc(q.zh)}`;
      speak(q.kana);
      setTimeout(() => {
        if (!alive || !wq) return;
        wq.n++;
        if (wq.n >= 10) {
          root.querySelector('#wqBox').innerHTML = `<div class="card summary"><h3>測驗結束</h3><p class="big-score">${wq.ok} / 10</p><button class="btn primary" id="wordQuiz">再來一次</button></div>`;
          wq = null;
        } else wordQ();
      }, ok ? 1000 : 2000);
    }
  });
  root.addEventListener('keydown', (e) => {
    const st = e.target.closest?.('[data-st]');
    if (st && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      st.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  return () => {
    alive = false;
  };
}
