import { groups, weakIds, dueIds } from '../data/registry.js';
import { mastery, learnedCount, streak, totalDays, practicedIds } from '../progress.js';
import { speak } from '../speech.js';
import { HIRA_ITEMS } from '../data/kana.js';
import { shuffle, pick, prefersReducedMotion, toast } from '../util.js';
import { webglAvailable } from '../three/textTexture.js';

const TIPS = [
  '「すみません」是旅行最萬用的一句：叫店員、借過、道歉都可以。',
  '日文的「は」當助詞時唸 wa，「を」唸 o，「へ」唸 e。',
  '門上寫「押」是推、「引」是拉——跟中文直覺相反！',
  '平假名從漢字草書演變而來，例如「あ」來自「安」、「な」來自「奈」。',
  '片假名多半用來寫外來語，像メニュー（menu）、コーヒー（coffee）。',
  '長音「ー」表示把前一個音拉長：ラーメン = ra-a-men。',
  '小小的「っ」是停頓一拍：きっぷ = kip-pu。',
  '日本不用給小費，結帳時說「お会計お願いします」就好。',
  '居酒屋坐下就送上的小菜叫「お通し」，會收費，這是正常的。',
  '票價表上的「小人」是兒童票，不是壞人 😄',
  '數字 4、7、9 有兩種唸法，報時間要說 よじ、しちじ、くじ。',
  '不知道量詞怎麼說時，用「ひとつ、ふたつ、みっつ」最安全。',
];

const PATH = [
  { step: 0, title: '新手入門', desc: '日文怎麼寫？平假名和片假名差在哪？', href: '#/start', key: null, cta: '先讀這篇 →' },
  { step: 1, title: '平假名', desc: '46 個基本音 + 濁音', href: '#/kana', key: 'hira' },
  { step: 2, title: '片假名', desc: '菜單上的外來語都靠它', href: '#/kana?kata', key: 'kata' },
  { step: 3, title: '數字與價格', desc: '聽懂「いくら？」的答案', href: '#/numbers', key: null, cta: '練習區 →' },
  { step: 4, title: '旅遊會話', desc: '餐廳、購物、聊天必備句', href: '#/phrases', key: 'phrase' },
  { step: 5, title: '情境對話', desc: '模擬真實的一來一往', href: '#/dialogue', key: 'dlg' },
  { step: 6, title: '菜單・商店・招牌', desc: '看懂吃什麼、買什麼、往哪走', href: '#/menu', key: 'read' },
];

export async function render(root) {
  const g = Object.fromEntries(groups().map((x) => [x.key, x.ids]));
  const stat = (ids) => ({ m: mastery(ids), n: learnedCount(ids), total: ids.length });
  const stats = {
    hira: stat(g.hira),
    kata: stat(g.kata),
    phrase: stat(g.phrase),
    dlg: stat(g.dlg),
    read: stat([...g.food, ...g.shop, ...g.sign]),
  };
  const practiced = practicedIds();
  const weakN = weakIds().length;
  const dueN = dueIds().length;

  root.innerHTML = `
    <section class="hero">
      <div class="hero-canvas" id="heroCanvas"></div>
      <div class="hero-copy">
        <p class="eyebrow">零基礎・為旅行而學</p>
        <h1>こんにちは！<br /><span>一起學會旅行用的日文</span></h1>
        <p class="lead">從五十音開始，到點餐、問路、看懂招牌。所有日文都可以點 🔊 聽發音。</p>
        <div class="hero-actions">
          <a class="btn primary" href="#/start">🔰 新手從這裡開始</a>
          <a class="btn ghost" href="#/kana">直接學五十音</a>
        </div>
        <p class="hint">👆 點點看漂浮的假名方塊</p>
      </div>
    </section>

    <section class="stats-row">
      <div class="stat"><b>${streak()}</b><span>連續學習天數 🔥</span></div>
      <div class="stat"><b>${totalDays()}</b><span>累計學習天數</span></div>
      <div class="stat"><b>${stats.hira.n + stats.kata.n}</b><span>已熟悉的假名</span></div>
      <a class="stat stat-link" href="#/review"><b class="${weakN ? 'bad' : ''}">${weakN}</b><span>弱點項目・${dueN} 個該複習 →</span></a>
    </section>

    ${practiced.length === 0 ? `
      <a class="card first-time" href="#/start">
        <span class="ft-emoji">🔰</span>
        <span><b>第一次來嗎？</b><br/>先看「新手入門」：10 分鐘了解日文的三種文字、平假名和片假名的差別。</span>
        <span class="ft-arrow">→</span>
      </a>` : weakN ? `
      <a class="card first-time" href="#/review">
        <span class="ft-emoji">🎯</span>
        <span><b>你有 ${weakN} 個弱點項目</b><br/>花 3 分鐘做一輪「弱點特訓」，把不熟的練到熟。</span>
        <span class="ft-arrow">→</span>
      </a>` : ''}

    <section>
      <h2 class="section-title">學習路線</h2>
      <ol class="path">
        ${PATH.map((p) => {
          const s = p.key ? stats[p.key] : null;
          const pct = s ? Math.round(s.m * 100) : null;
          return `
          <li>
            <a class="path-card" href="${p.href}">
              <span class="path-step">${p.step || '🔰'}</span>
              <span class="path-body">
                <b>${p.title}</b>
                <small>${p.desc}</small>
                ${s ? `<span class="bar"><i style="width:${pct}%"></i></span><small class="muted">${s.n} / ${s.total} 熟悉</small>` : `<small class="muted">${p.cta}</small>`}
              </span>
            </a>
          </li>`;
        }).join('')}
      </ol>
    </section>

    <section class="grid-2">
      <div class="card tip-card">
        <h3>💡 今日小知識</h3>
        <p id="tip">${pick(TIPS)}</p>
        <button class="btn ghost small" id="nextTip">再一則</button>
      </div>
      <div class="card">
        <h3>🎮 練習區</h3>
        <div class="quick-links">
          <a href="#/quiz">📝 假名測驗</a>
          <a href="#/rain">🌧️ 假名雨遊戲</a>
          <a href="#/dialogue">🎭 情境對話</a>
          <a href="#/listen">🎧 聽力練習</a>
          <a href="#/speak">🎤 跟讀練習</a>
          <a href="#/konbini">🏪 3D 便利商店</a>
          <a href="#/train">🚃 搭電車</a>
          <a href="#/sushi">🍣 迴轉壽司</a>
          <a href="#/shop">👕 看懂商店</a>
          <a href="#/signs">🏮 3D 街頭招牌</a>
          <a href="#/cheat">📇 旅行小抄</a>
        </div>
      </div>
    </section>
  `;

  root.querySelector('#nextTip').addEventListener('click', () => {
    root.querySelector('#tip').textContent = pick(TIPS);
  });

  const holder = root.querySelector('#heroCanvas');
  if (!webglAvailable()) {
    holder.classList.add('fallback');
    return;
  }
  const { createHero } = await import('../three/hero.js');
  const kana = shuffle(HIRA_ITEMS.filter((k) => k.group === 'basic')).slice(0, 12);
  return createHero(holder, {
    kana,
    reducedMotion: prefersReducedMotion(),
    onPick: (k) => {
      speak(k.k);
      toast(`${k.k}　${k.r}`);
    },
  });
}
