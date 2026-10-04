import { numberToKana, BASIC_NUMBERS, TRICKY, TSU_COUNTER, PEOPLE_COUNTER, TEN_COUNTER, MAI_COUNTER, HOURS, WEEKDAYS, randomPrice } from '../data/numbers.js';
import { kanaToRomaji } from '../data/kana.js';
import { speak } from '../speech.js';
import { sayBtn, esc } from '../util.js';

const yen = (n) => n.toLocaleString('ja-JP');

export function render(root) {
  root.innerHTML = `
    <header class="page-head">
      <h1>數字與價格</h1>
      <p class="lead">好消息：日文數字的組合方式<b>跟中文一模一樣</b>，只是讀音不同。學會 1～10 和「十、百、千、萬」，就能唸出任何價格。</p>
    </header>

    <section class="card explain">
      <h2>🧩 數字怎麼組合？跟中文一樣！</h2>
      <div class="num-compare">
        <div><b>23</b><span>中文：二十三</span><span class="jp">日文：に・じゅう・さん</span>${sayBtn('にじゅうさん')}</div>
        <div><b>850</b><span>中文：八百五十</span><span class="jp">日文：はっぴゃく・ごじゅう</span>${sayBtn('はっぴゃくごじゅう')}</div>
        <div><b>1,280</b><span>中文：一千二百八十</span><span class="jp">日文：せん・にひゃく・はちじゅう</span>${sayBtn('せんにひゃくはちじゅう')}</div>
        <div><b>15,000</b><span>中文：一萬五千</span><span class="jp">日文：いちまん・ごせん</span>${sayBtn('いちまんごせん')}</div>
      </div>
      <p class="muted small">差別只有兩個：① 一百、一千直接說「ひゃく」「せん」，不說「いち」（但一萬要說「いちまん」）；② 300、600、800、3000、8000 會變音（見下方）。價格最後加上「円（えん）」就是日圓。</p>
    </section>

    <section class="card trainer">
      <h2>💴 價格聽力訓練</h2>
      <p class="muted">按播放，聽店員說的金額，輸入數字。</p>
      <div class="seg" id="lvl">
        <button data-l="easy" class="on">簡單 100~900</button>
        <button data-l="mid">中等 ~3,000</button>
        <button data-l="hard">困難 ~30,000</button>
      </div>
      <div class="price-tag" id="priceTag">
        <button class="btn primary" id="play">▶ 播放金額</button>
      </div>
      <form class="price-form" id="priceForm">
        <input id="priceInput" inputmode="numeric" placeholder="輸入數字" autocomplete="off" />
        <span>円</span>
        <button class="btn">確認</button>
      </form>
      <div id="priceFb" class="q-feedback"></div>
      <p class="muted small">連續答對：<b id="combo">0</b></p>
    </section>

    <section class="card">
      <h2>🔢 數字轉換器</h2>
      <p class="muted">輸入任何金額，看日文怎麼唸。</p>
      <div class="price-form">
        <input id="conv" inputmode="numeric" value="1280" />
        <span>円</span>
      </div>
      <div id="convOut" class="conv-out"></div>
    </section>

    <section>
      <h2 class="section-title">基本數字</h2>
      <div class="num-grid">
        ${BASIC_NUMBERS.map((x) => `
          <button class="num-card" data-say="${esc(x.kana.split('／')[0])}">
            <b>${x.n.toLocaleString()}</b><span class="jp kanji">${x.kanji}</span>
            <span class="jp">${x.kana}</span>
            ${x.note ? `<small class="muted">${x.note}</small>` : ''}
          </button>`).join('')}
      </div>
    </section>

    <section class="card warn-card">
      <h3>⚠ 會變音的數字（一定要記）</h3>
      <div class="chips">
        ${TRICKY.map((n) => `<button class="chip" data-say="${numberToKana(n)}">${n.toLocaleString()} <span class="jp">${numberToKana(n)}</span></button>`).join('')}
      </div>
    </section>

    <section class="card explain">
      <h2>🧮 數東西：什麼是「量詞」？</h2>
      <p>中文數東西時，數字後面會加一個字：一<b>個</b>蘋果、兩<b>位</b>客人、三<b>張</b>票。這個「個、位、張」就叫做<b>量詞</b>。</p>
      <p>日文也一樣，<b>數不同的東西要接不同的量詞</b>。好消息是：旅行只要會下面這 <b>4 種</b>就夠用了。</p>
      <div class="table-scroll">
        <table class="compare counters">
          <thead><tr><th>要數什麼</th><th>日文量詞</th><th>像中文的</th><th>旅行例句</th></tr></thead>
          <tbody>
            <tr><td>🍙 東西（通用）</td><td class="jp">〜つ</td><td>～個</td><td><span class="jp">これを二つください</span> ${sayBtn('これをふたつください')}<br/><small class="muted">請給我兩個這個</small></td></tr>
            <tr><td>👥 人</td><td class="jp">〜人（にん）</td><td>～位、～個人</td><td><span class="jp">二人です</span> ${sayBtn('ふたりです')}<br/><small class="muted">（餐廳）兩位</small></td></tr>
            <tr><td>👕 衣服、商品</td><td class="jp">〜点（てん）</td><td>～件</td><td><span class="jp">二点です</span> ${sayBtn('にてんです')}<br/><small class="muted">（試衣間）兩件</small></td></tr>
            <tr><td>🎫 扁平的東西：票、毛巾、紙</td><td class="jp">〜枚（まい）</td><td>～張、～條</td><td><span class="jp">切符を二枚ください</span> ${sayBtn('きっぷをにまいください')}<br/><small class="muted">請給我兩張車票</small></td></tr>
          </tbody>
        </table>
      </div>
      <div class="callout">
        <b>💡 不知道用哪個量詞？</b>就用「〜つ」（ひとつ、ふたつ…），再加上手指比數量，日本人一定聽得懂。
      </div>
    </section>

    <section class="grid-2">
      <div class="card">
        <h3>🍙 〜つ：數東西（最萬用）</h3>
        <p class="muted small">注意：這組<b>不是</b>「いち、に、さん」加上「つ」，而是日文原本的另一套數法，要整組背起來。只會用到 1～10，超過 10 就直接說數字。</p>
        <table class="mini-table">${TSU_COUNTER.map((x) => `<tr><td>${x.n} 個</td><td class="jp">${x.kana}</td><td class="romaji">${kanaToRomaji(x.kana)}</td><td>${sayBtn(x.kana)}</td></tr>`).join('')}</table>
      </div>
      <div class="card">
        <h3>👥 〜人：人數</h3>
        <p class="muted small">進餐廳時店員會問「何名様ですか？」（請問幾位？），這樣回答。<b>1 人、2 人是特殊唸法</b>（ひとり、ふたり），3 人以後才是「數字＋にん」。4 人唸「よにん」不是「よんにん」。</p>
        <table class="mini-table">${PEOPLE_COUNTER.map((x) => `<tr class="${x.n <= 2 || x.n === 4 ? 'tricky' : ''}"><td>${x.n} 人</td><td class="jp">${x.kana}</td><td class="romaji">${kanaToRomaji(x.kana)}</td><td>${sayBtn(x.kana + 'です')}</td></tr>`).join('')}</table>
        <p class="muted small"><span class="legend-chip tricky"></span> 粉紅色 = 不規則的唸法，要特別記</p>
      </div>
      <div class="card">
        <h3>👕 〜点：衣服、商品件數</h3>
        <p class="muted small">在服飾店試衣間，店員會問「何点ですか？」（幾件？）。1 件唸「いってん」（中間有促音 っ）。</p>
        <table class="mini-table">${TEN_COUNTER.map((x) => `<tr class="${x.n === 1 ? 'tricky' : ''}"><td>${x.n} 件</td><td class="jp">${x.kana}</td><td class="romaji">${kanaToRomaji(x.kana)}</td><td>${sayBtn(x.kana + 'です')}</td></tr>`).join('')}</table>
      </div>
      <div class="card">
        <h3>🎫 〜枚：票、毛巾、紙</h3>
        <p class="muted small">買車票、跟飯店多要一條毛巾時用：「タオルをもう一枚ください」（請再給我一條毛巾）。這組很規則，就是數字＋まい。</p>
        <table class="mini-table">${MAI_COUNTER.map((x) => `<tr><td>${x.n} 張</td><td class="jp">${x.kana}</td><td class="romaji">${kanaToRomaji(x.kana)}</td><td>${sayBtn(x.kana)}</td></tr>`).join('')}</table>
      </div>
    </section>

    <section class="card">
      <h3>🕐 幾點：〜時（じ）</h3>
      <p class="muted small">看營業時間、問退房時間用得到。規則是「數字＋じ」，但 <b>4 點、7 點、9 點有特別唸法</b>（粉紅色），因為 4、7、9 本身有兩種唸法，報時間時固定用其中一種。問「幾點？」是「何時（なんじ）ですか？」</p>
      <div class="table-scroll">
        <table class="mini-table hours">${HOURS.map((x) => `<tr class="${x.tricky ? 'tricky' : ''}"><td>${x.n} 點</td><td class="jp">${x.kana}</td><td class="romaji">${kanaToRomaji(x.kana)}</td><td>${sayBtn(x.kana)}</td></tr>`).join('')}</table>
      </div>
    </section>

    <section class="card">
      <h3>📅 星期（看營業時間、公休日）</h3>
      <div class="chips">${WEEKDAYS.map((d) => `<button class="chip" data-say="${d.kana}"><span class="jp">${d.kanji}</span> <small>${d.zh}</small></button>`).join('')}</div>
      <p class="muted small">招牌常只寫第一個字：「月・火 定休」= 星期一、二公休。</p>
    </section>
  `;

  // ---- 價格訓練 ----
  let level = 'easy';
  let price = null;
  let combo = 0;
  let nextTimer = 0; // 答對後自動出下一題的計時器（離開頁面要清掉）
  const fb = root.querySelector('#priceFb');
  const inp = root.querySelector('#priceInput');

  function newPrice() {
    price = randomPrice(level);
    fb.textContent = '';
    inp.value = '';
    say();
  }
  function say() {
    speak(numberToKana(price) + 'えん');
  }

  root.querySelector('#lvl').addEventListener('click', (e) => {
    const b = e.target.closest('[data-l]');
    if (!b) return;
    level = b.dataset.l;
    root.querySelectorAll('#lvl button').forEach((x) => x.classList.toggle('on', x === b));
    price = null;
    fb.textContent = '';
  });
  root.querySelector('#play').addEventListener('click', () => (price == null ? newPrice() : say()));
  root.querySelector('#priceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (nextTimer) return; // 已答對、等待下一題中，忽略重複送出
    if (price == null) return newPrice();
    const v = Number(inp.value.replace(/[^\d]/g, ''));
    const reading = numberToKana(price) + 'えん';
    if (v === price) {
      combo++;
      fb.innerHTML = `<span class="good">正解！ ¥${yen(price)} = <span class="jp">${reading}</span></span>`;
      nextTimer = setTimeout(() => {
        nextTimer = 0;
        newPrice();
      }, 1400);
    } else {
      combo = 0;
      fb.innerHTML = `<span class="bad">答案是 ¥${yen(price)}：<span class="jp">${reading}</span> ${sayBtn(reading)}</span> <button class="btn small ghost" id="nextP">下一題</button>`;
      fb.querySelector('#nextP').addEventListener('click', newPrice);
    }
    root.querySelector('#combo').textContent = combo;
  });

  // ---- 轉換器 ----
  const conv = root.querySelector('#conv');
  const convOut = root.querySelector('#convOut');
  function update() {
    const n = Number(conv.value.replace(/[^\d]/g, ''));
    if (!conv.value || Number.isNaN(n) || n > 99999999) {
      convOut.innerHTML = '<span class="muted">請輸入 0 ~ 99,999,999</span>';
      return;
    }
    const k = numberToKana(n) + 'えん';
    const parts = [...numberToKana(n, ' ').split(' '), 'えん'];
    convOut.innerHTML = `
      <div class="jp big-kana">${k}</div>
      <div class="num-parts">${parts.map((p) => `<span><b class="jp">${p}</b><small class="romaji">${kanaToRomaji(p)}</small></span>`).join('<i>＋</i>')}</div>
      ${sayBtn(k, '🔊 聽聽看')}`;
  }
  conv.addEventListener('input', update);
  update();
  return () => clearTimeout(nextTimer);
}
