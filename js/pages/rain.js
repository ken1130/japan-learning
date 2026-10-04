import { HIRA_ITEMS, KATA_ITEMS } from '../data/kana.js';
import { record } from '../progress.js';
import { speak } from '../speech.js';
import { webglAvailable } from '../three/textTexture.js';
import { esc } from '../util.js';

// 其他常見的拼法也算對（訓令式、輸入法拼法）
const ALT = {
  shi: ['si'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], ji: ['zi', 'di'], zu: ['du'], o: ['wo'],
  sha: ['sya'], shu: ['syu'], sho: ['syo'], cha: ['tya', 'cya'], chu: ['tyu', 'cyu'], cho: ['tyo', 'cyo'],
  ja: ['zya', 'jya'], ju: ['zyu', 'jyu'], jo: ['zyo', 'jyo'], n: ['nn'],
};

const BEST_KEY = 'tabi-nihongo-rain-best';

export async function render(root) {
  const cfg = { script: 'hira', range: 'basic' };
  root.innerHTML = `
    <header class="page-head">
      <h1>假名雨 <small>🌧️ 打字小遊戲</small></h1>
      <p class="lead">假名會從天空落下，輸入它的羅馬拼音按 Enter（或直接打完）就能打散它。落到地面會扣一條命，共 3 條命。</p>
    </header>
    <div class="rain-wrap">
      <div class="rain-canvas" id="rainCanvas">
        <div class="rain-overlay" id="overlay">
          <h2>準備好了嗎？</h2>
          <div class="seg" id="scriptSeg">
            <button data-s="hira" class="on">平假名</button><button data-s="kata">片假名</button><button data-s="mix">混合</button>
          </div>
          <div class="seg" id="rangeSeg">
            <button data-r="basic" class="on">清音</button><button data-r="all">含濁音</button>
          </div>
          <button class="btn primary big" id="go">開始 ▶</button>
          <p class="muted small" id="best"></p>
        </div>
      </div>
      <div class="rain-hud">
        <span id="lives">❤️❤️❤️</span>
        <input id="answer" class="rain-input" placeholder="輸入拼音，例如 ka" autocomplete="off" autocapitalize="off" spellcheck="false" disabled />
        <span>分數 <b id="score">0</b></span>
      </div>
      <p class="muted small center">「ん」請打 nn 或 n + Enter。漏掉的假名會記下來，結束時列出讓你複習。</p>
    </div>`;

  const holder = root.querySelector('#rainCanvas');
  const overlay = root.querySelector('#overlay');
  const input = root.querySelector('#answer');
  const scoreEl = root.querySelector('#score');
  const livesEl = root.querySelector('#lives');
  const bestEl = root.querySelector('#best');
  let score = 0;
  let missed = [];
  const best = () => Number(localStorageGet(BEST_KEY) || 0);
  bestEl.textContent = best() ? `最高分：${best()}` : '';

  if (!webglAvailable()) {
    overlay.innerHTML = '<p>你的瀏覽器不支援 WebGL，無法玩這個遊戲 😢</p>';
    return;
  }

  const { createKanaRain } = await import('../three/kanaRain.js');
  const game = await createKanaRain(holder, {
    onHit: (item) => {
      score += 10;
      scoreEl.textContent = score;
      record('kana:' + item.k, true);
    },
    onMiss: (item, lives) => {
      livesEl.textContent = '❤️'.repeat(Math.max(lives, 0)) + '🤍'.repeat(3 - Math.max(lives, 0));
      missed.push(item);
      record('kana:' + item.k, false);
    },
    onOver: () => {
      input.disabled = true;
      const isBest = score > best();
      if (isBest) localStorageSet(BEST_KEY, score);
      const uniq = [...new Map(missed.map((m) => [m.k, m])).values()];
      overlay.hidden = false;
      overlay.innerHTML = `
        <h2>ゲームオーバー</h2>
        <p class="big-score">${score} 分 ${isBest ? '🏆 新紀錄！' : ''}</p>
        ${uniq.length ? `<p>漏掉的假名（點擊聽發音）：</p><div class="missed">${uniq.map((m) => `<button class="chip jp" data-say="${esc(m.k)}">${m.k} <small>${m.r}</small></button>`).join('')}</div>` : ''}
        <button class="btn primary big" id="go">再玩一次</button>`;
    },
  });

  function start() {
    const src = cfg.script === 'hira' ? HIRA_ITEMS : cfg.script === 'kata' ? KATA_ITEMS : [...HIRA_ITEMS, ...KATA_ITEMS];
    const groups = cfg.range === 'basic' ? ['basic'] : ['basic', 'dakuten'];
    const items = src.filter((x) => groups.includes(x.group)).map((x) => ({ ...x, answers: [x.r, ...(ALT[x.r] || [])] }));
    score = 0;
    missed = [];
    scoreEl.textContent = '0';
    livesEl.textContent = '❤️❤️❤️';
    overlay.hidden = true;
    input.disabled = false;
    input.value = '';
    input.focus();
    game.start(items);
  }

  overlay.addEventListener('click', (e) => {
    const s = e.target.closest('[data-s]');
    const r = e.target.closest('[data-r]');
    if (s) {
      cfg.script = s.dataset.s;
      overlay.querySelectorAll('[data-s]').forEach((b) => b.classList.toggle('on', b === s));
    }
    if (r) {
      cfg.range = r.dataset.r;
      overlay.querySelectorAll('[data-r]').forEach((b) => b.classList.toggle('on', b === r));
    }
    if (e.target.closest('#go')) start();
  });

  // 打完就自動判定；Enter 清空重打
  input.addEventListener('input', () => {
    // 單獨的 n 可能是 na/ni… 的開頭，要打 nn 或 n+Enter 才算「ん」
    if (input.value.trim().toLowerCase() === 'n') return;
    const hit = game.tryAnswer(input.value);
    if (hit) {
      speak(hit.k);
      input.value = '';
      input.classList.add('flash');
      setTimeout(() => input.classList.remove('flash'), 200);
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (!game.tryAnswer(input.value) && input.value) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 300);
      }
      input.value = '';
    }
  });

  return () => game.dispose();
}

function localStorageGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function localStorageSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}
