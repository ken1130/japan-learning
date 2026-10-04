// 跟讀練習：用瀏覽器的語音辨識（Web Speech API）聽你說日文，跟目標句子比對
import { CATEGORIES, PHRASES } from '../data/phrases.js';
import { toHiragana } from '../data/kana.js';
import { record, isFav } from '../progress.js';
import { speak } from '../speech.js';
import { esc, shuffle } from '../util.js';

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// 比對前的正規化：去掉標點空白、片假名轉平假名
const norm = (s) => toHiragana(String(s).replace(/[\s、。，．,.!?！？「」『』（）()〜~・ー\-]/g, '').toLowerCase());

/** 最長共同子序列：回傳 target 裡有對到的字的位置 */
function lcsMatch(target, heard) {
  const a = [...target];
  const b = [...heard];
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const hit = new Set();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      hit.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { len: dp[0][0], hit };
}

/** 分數 0~100：對到的字數 / 兩者較長的長度 */
function score(target, heard) {
  const t = norm(target);
  const h = norm(heard);
  if (!t || !h) return { pct: 0, hit: new Set(), t };
  const { len, hit } = lcsMatch(t, h);
  return { pct: Math.round((len / Math.max(t.length, h.length)) * 100), hit, t };
}

export function render(root) {
  let cat = 'basic';
  let list = [];
  let idx = 0;
  let rec = null;
  let listening = false;
  let alive = true;

  function buildList() {
    if (cat === 'fav') list = PHRASES.filter((p) => isFav('phrase:' + p.id));
    else if (cat === 'random') list = shuffle(PHRASES.filter((p) => !p.hear)).slice(0, 20);
    else list = PHRASES.filter((p) => p.cat === cat);
    idx = 0;
  }

  function cardHtml() {
    if (!list.length) return '<p class="muted">這個分類沒有句子。收藏句子：到「旅遊會話」頁按 ☆。</p>';
    const p = list[idx];
    return `
      <div class="card speak-card">
        <div class="speak-nav">
          <button class="btn small ghost" data-move="-1" ${idx === 0 ? 'disabled' : ''}>← 上一句</button>
          <span class="muted">${idx + 1} / ${list.length}</span>
          <button class="btn small ghost" data-move="1" ${idx >= list.length - 1 ? 'disabled' : ''}>下一句 →</button>
        </div>
        <div class="speak-target">
          <div class="jp speak-jp" id="targetJp">${esc(p.jp)}</div>
          ${p.kana !== p.jp ? `<div class="jp muted">${esc(p.kana)}</div>` : ''}
          <div class="romaji">${esc(p.ro)}</div>
          <div class="speak-zh">${esc(p.zh)}</div>
        </div>
        <div class="speak-actions">
          <button class="btn" data-listen="1">🔊 聽一次</button>
          <button class="btn" data-listen="0.6">🐢 慢速</button>
          <button class="mic ${listening ? 'on' : ''}" id="mic" ${Recognition ? '' : 'disabled'} aria-label="${listening ? '停止錄音' : '開始說'}">
            <span>🎤</span><small>${listening ? '聆聽中…點一下停止' : '按我開始說'}</small>
          </button>
        </div>
        <div class="speak-result" id="result" aria-live="polite"></div>
      </div>`;
  }

  function draw() {
    root.innerHTML = `
      <header class="page-head">
        <h1>跟讀練習 <small>🎤 說說看</small></h1>
        <p class="lead">先按 🔊 聽，再按 🎤 跟著說一次。瀏覽器會把你說的話轉成文字，跟目標句子比對，告訴你哪些字有說對。</p>
      </header>
      ${Recognition ? '' : `<div class="callout warn-callout">⚠ 你的瀏覽器不支援語音辨識。請用電腦或 Android 的 <b>Chrome</b> 或 <b>Edge</b>（iPhone 請用 Safari）。不能辨識時，仍然可以聽發音、大聲跟讀。</div>`}
      <div class="callout">
        <b>小技巧：</b>第一次使用時瀏覽器會詢問麥克風權限，請按「允許」。說的時候離麥克風近一點、一口氣說完整句。辨識會把有些字轉成漢字或假名，分數只是參考，<b>敢開口最重要</b>！
      </div>
      <div class="tabs small">
        ${CATEGORIES.map((c) => `<button data-cat="${c.id}" class="${c.id === cat ? 'on' : ''}">${c.icon} ${c.name}</button>`).join('')}
        <button data-cat="fav" class="${cat === 'fav' ? 'on' : ''}">★ 收藏</button>
        <button data-cat="random" class="${cat === 'random' ? 'on' : ''}">🎲 隨機 20 句</button>
      </div>
      <div id="cardWrap">${cardHtml()}</div>`;
  }

  function redrawCard() {
    stop();
    root.querySelector('#cardWrap').innerHTML = cardHtml();
  }

  function stop() {
    listening = false;
    try {
      rec?.abort();
    } catch {
      /* ignore */
    }
    rec = null;
  }

  function showResult(alternatives) {
    const p = list[idx];
    // 取跟「漢字寫法」或「假名讀音」最接近的辨識結果
    let best = { pct: -1 };
    for (const alt of alternatives) {
      for (const target of [p.jp, p.kana]) {
        const s = score(target, alt);
        if (s.pct > best.pct) best = { ...s, heard: alt, target };
      }
    }
    const chars = [...best.t];
    const marked = chars.map((c, i) => `<span class="${best.hit.has(i) ? 'hit' : 'miss'}">${esc(c)}</span>`).join('');
    const level = best.pct >= 85 ? ['good', '🎉 說得很好！'] : best.pct >= 60 ? ['ok', '👍 不錯，再清楚一點會更好'] : ['bad', '💪 再試一次，可以先用慢速聽'];
    if (best.pct >= 85) record('phrase:' + p.id, true);
    else if (best.pct < 50) record('phrase:' + p.id, false);
    root.querySelector('#result').innerHTML = `
      <div class="score-line ${level[0]}"><b>${best.pct}</b> 分　${level[1]}</div>
      <div class="muted small">辨識到：<span class="jp">${esc(best.heard)}</span></div>
      <div class="jp marked">${marked}</div>
      <p class="muted small">綠色＝有說對的音，灰色＝沒聽到或不一樣（比對時漢字、片假名都會轉成平假名）</p>`;
  }

  function startListening() {
    if (!Recognition) return;
    if (listening) return stop() || redrawCard();
    window.speechSynthesis?.cancel();
    rec = new Recognition();
    rec.lang = 'ja-JP';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    listening = true;
    const btn = root.querySelector('#mic');
    btn.classList.add('on');
    btn.querySelector('small').textContent = '聆聽中…點一下停止';
    rec.onresult = (ev) => {
      const alts = [...ev.results[0]].map((r) => r.transcript);
      if (alive) showResult(alts);
    };
    rec.onerror = (ev) => {
      if (!alive) return;
      const msg = { 'not-allowed': '麥克風權限被拒絕，請在網址列左邊的鎖頭圖示裡允許麥克風。', 'no-speech': '沒有聽到聲音，請再試一次。', network: '語音辨識需要網路連線。' }[ev.error] || `辨識失敗（${ev.error}）`;
      root.querySelector('#result').innerHTML = `<p class="bad">${esc(msg)}</p>`;
    };
    rec.onend = () => {
      listening = false;
      const b = root.querySelector('#mic');
      if (b) {
        b.classList.remove('on');
        b.querySelector('small').textContent = '按我開始說';
      }
    };
    try {
      rec.start();
    } catch {
      listening = false;
    }
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const c = t.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      buildList();
      stop();
      return draw();
    }
    const mv = t.closest('[data-move]');
    if (mv) {
      idx = Math.min(list.length - 1, Math.max(0, idx + Number(mv.dataset.move)));
      return redrawCard();
    }
    const ls = t.closest('[data-listen]');
    if (ls) return speak(list[idx].jp, { rate: Number(ls.dataset.listen) === 1 ? undefined : 0.6 });
    if (t.closest('#mic')) startListening();
  });

  const initial = new URLSearchParams(location.hash.split('?')[1] || '').get('cat');
  if (initial && (CATEGORIES.some((c) => c.id === initial) || initial === 'fav')) cat = initial;
  buildList();
  draw();
  return () => {
    alive = false;
    stop();
  };
}
