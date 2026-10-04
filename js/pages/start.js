// 新手入門：假設完全沒接觸過日文，從「日文是怎麼寫的」講起
import { sayBtn, esc } from '../util.js';
import { kanaToRomaji } from '../data/kana.js';

// 例句：每一段標上是哪種文字
const SENTENCE = [
  { t: '私', type: 'kanji', r: 'わたし', zh: '我' },
  { t: 'は', type: 'hira', r: 'wa', zh: '（助詞，標示主題）' },
  { t: 'ラーメン', type: 'kata', r: 'らーめん', zh: '拉麵（外來語）' },
  { t: 'を', type: 'hira', r: 'o', zh: '（助詞，標示受詞）' },
  { t: '食', type: 'kanji', r: 'た', zh: '吃（字根）' },
  { t: 'べます', type: 'hira', r: 'べます', zh: '（動詞變化：禮貌的現在式）' },
];

const PAIRS = [
  ['あ', 'ア', 'a'], ['か', 'カ', 'ka'], ['さ', 'サ', 'sa'], ['て', 'テ', 'te'], ['に', 'ニ', 'ni'], ['ほ', 'ホ', 'ho'], ['も', 'モ', 'mo'], ['ら', 'ラ', 'ra'],
];

const LOANWORDS = [
  { k: 'コーヒー', en: 'coffee', zh: '咖啡' },
  { k: 'ビール', en: 'beer', zh: '啤酒' },
  { k: 'タクシー', en: 'taxi', zh: '計程車' },
  { k: 'ホテル', en: 'hotel', zh: '飯店' },
  { k: 'メニュー', en: 'menu', zh: '菜單' },
  { k: 'トイレ', en: 'toilet', zh: '廁所' },
  { k: 'コンビニ', en: 'convenience store', zh: '便利商店（縮寫）' },
  { k: 'アイスクリーム', en: 'ice cream', zh: '冰淇淋' },
];

const KANJI_TRAPS = [
  { jp: '手紙', kana: 'てがみ', guess: '衛生紙？', real: '信（寫給人的信）' },
  { jp: '大丈夫', kana: 'だいじょうぶ', guess: '男子漢？', real: '沒問題、沒關係' },
  { jp: '勉強', kana: 'べんきょう', guess: '很勉強？', real: '學習、讀書' },
  { jp: '湯', kana: 'ゆ', guess: '湯？', real: '熱水（溫泉門簾上的「ゆ」）' },
  { jp: '切手', kana: 'きって', guess: '切手指？', real: '郵票' },
  { jp: '娘', kana: 'むすめ', guess: '媽媽？', real: '女兒' },
  { jp: '高い', kana: 'たかい', guess: '高的', real: '高的，也是「貴」的意思！' },
];

const VOWELS = [
  { k: 'あ', r: 'a', tip: '像中文「阿」，嘴巴張開' },
  { k: 'い', r: 'i', tip: '像中文「衣」，嘴角往兩邊' },
  { k: 'う', r: 'u', tip: '像「烏」，但嘴唇不要嘟起來，放鬆扁扁的' },
  { k: 'え', r: 'e', tip: '像「欸」，介於「耶」和「誒」之間' },
  { k: 'お', r: 'o', tip: '像「喔」，嘴巴圓圓的' },
];

const SPECIAL = [
  { name: '濁音 ゛', desc: '在假名右上角加兩點，聲音變得比較「濁」（聲帶振動）。', ex: [['か', 'ka'], ['が', 'ga']], word: ['かき（柿子）', 'かぎ（鑰匙）'], say: ['かき', 'かぎ'] },
  { name: '半濁音 ゜', desc: '只有は行會加小圈圈，變成 p 的音。', ex: [['は', 'ha'], ['ぱ', 'pa']], word: ['はん', 'ぱん（麵包）'], say: ['はん', 'ぱん'] },
  { name: '拗音 ゃゅょ', desc: '大字後面跟一個「小的」ゃ・ゅ・ょ，兩個字合起來只唸一拍。', ex: [['きや', 'ki-ya 兩拍'], ['きゃ', 'kya 一拍']], word: ['びよういん（美容院）', 'びょういん（醫院）'], say: ['びよういん', 'びょういん'] },
  { name: '促音 っ', desc: '小小的「っ」不發音，而是「停頓一拍」，下一個子音要頓一下。', ex: [['きて', 'kite'], ['きって', 'kitte']], word: ['きて（來）', 'きって（郵票）'], say: ['きて', 'きって'] },
  { name: '長音 ー', desc: '把前一個音拉長一拍。片假名用「ー」，平假名用母音（おばあさん的「あ」）。', ex: [['おばさん', 'obasan'], ['おばあさん', 'obaasan']], word: ['おばさん（阿姨）', 'おばあさん（奶奶）'], say: ['おばさん', 'おばあさん'] },
];

export function render(root) {
  root.innerHTML = `
    <header class="page-head">
      <h1>新手入門 <small>📖 完全零基礎從這裡開始</small></h1>
      <p class="lead">如果你從來沒學過日文，先花 10 分鐘看完這頁。看完你就會知道：日文是怎麼寫的、平假名和片假名差在哪、為什麼要先學五十音。</p>
      <nav class="toc" aria-label="本頁目錄">
        <a href="#s1">① 三種文字</a><a href="#s2">② 平假名 vs 片假名</a><a href="#s3">③ 漢字</a>
        <a href="#s4">④ 發音規則</a><a href="#s5">⑤ 特殊符號</a><a href="#s6">⑥ 怎麼開始</a>
      </nav>
    </header>

    <section class="guide" id="s1">
      <h2><span class="num">1</span> 日文用三種文字混著寫</h2>
      <p>中文只有漢字，但日文的一句話裡，會<b>同時出現三種文字</b>。先看這句「我要吃拉麵」：</p>
      <div class="sentence-demo">
        <div class="sentence jp">
          ${SENTENCE.map((s, i) => `<button class="sent-part ${s.type}" data-part="${i}">${s.t}</button>`).join('')}
        </div>
        <div class="sentence-info" id="partInfo">👆 點句子裡的每一段，看它是哪種文字</div>
        ${sayBtn('私はラーメンを食べます', '🔊 聽整句')}
        <div class="legend-row">
          <span><i class="sw hira"></i>平假名</span>
          <span><i class="sw kata"></i>片假名</span>
          <span><i class="sw kanji"></i>漢字</span>
        </div>
      </div>
      <div class="script-cards">
        <div class="script-card hira">
          <div class="script-big jp">ひらがな</div>
          <h3>平假名</h3>
          <p>日文的<b>基本字母</b>。用來寫助詞（は、を）、動詞的變化（〜ます），以及沒有漢字的詞。<b>小孩最先學、所有日文都能用它寫出來。</b></p>
        </div>
        <div class="script-card kata">
          <div class="script-big jp">カタカナ</div>
          <h3>片假名</h3>
          <p>主要用來寫<b>外來語</b>（從英文等外語借來的詞）、外國人名地名、強調的字。<b>菜單、衣服、商品名稱到處都是。</b></p>
        </div>
        <div class="script-card kanji">
          <div class="script-big jp">漢字</div>
          <h3>漢字</h3>
          <p>從中國傳過去的字，用來寫名詞和動詞、形容詞的「字根」。<b>會中文的你已經看得懂一大半！</b></p>
        </div>
      </div>
      <div class="callout">
        <b>💡 重點：日文沒有空格。</b>三種文字的切換處，就是你判斷「詞從哪裡開始、哪裡結束」的線索。
      </div>
    </section>

    <section class="guide" id="s2">
      <h2><span class="num">2</span> 平假名和片假名：同一套發音，兩種寫法</h2>
      <p>這是新手最常問的問題。最簡單的理解方式：</p>
      <div class="callout big">
        平假名和片假名就像英文的<b>小寫和大寫</b>——<b>唸法一模一樣</b>，只是外觀不同、用途不同。<br/>
        「あ」和「ア」都唸 <b>a</b>；「か」和「カ」都唸 <b>ka</b>。
      </div>

      <div class="pair-grid">
        ${PAIRS.map(([h, k, r]) => `
          <button class="pair" data-say="${h}">
            <span class="jp ph">${h}</span><span class="eq">=</span><span class="jp pk">${k}</span>
            <span class="romaji">${r}</span>
          </button>`).join('')}
      </div>
      <p class="muted small">點每一組聽聽看，發音完全一樣。</p>

      <div class="table-scroll">
        <table class="compare">
          <thead><tr><th></th><th>平假名 ひらがな</th><th>片假名 カタカナ</th></tr></thead>
          <tbody>
            <tr><th>外觀</th><td>圓圓的、有曲線<br/><span class="jp big-sample">あ い う え お</span></td><td>直直的、有稜角<br/><span class="jp big-sample">ア イ ウ エ オ</span></td></tr>
            <tr><th>從哪來</th><td>漢字的<b>草書</b>（整個字寫快變圓）<br/>例：安 → あ</td><td>取漢字的<b>一小部分</b>（偏旁）<br/>例：阿 → ア（取左邊的「阝」）</td></tr>
            <tr><th>用來寫</th><td>助詞、動詞變化、日本本來就有的詞</td><td>外來語、外國人名地名、擬聲詞、強調</td></tr>
            <tr><th>旅行時在哪看到</th><td>所有句子裡、招牌的讀音標示、車站名的讀音</td><td>菜單（ラーメン、ビール）、服飾（シャツ、パンツ）、商品名、便利商店（コンビニ）</td></tr>
            <tr><th>數量</th><td colspan="2" class="center">都是基本 46 個，加上濁音、拗音等變化，<b>兩套一一對應</b></td></tr>
            <tr><th>學習順序</th><td><b>先學</b>（第 1 週）</td><td>學完平假名再學（第 2 週），因為發音一樣，學起來會快很多</td></tr>
          </tbody>
        </table>
      </div>

      <h3>片假名猜猜看：外來語其實是英文！</h3>
      <p>片假名的外來語多半來自英文，只是用日文的發音唸。<b>唸出來就猜得到意思</b>，點卡片翻面看答案：</p>
      <div class="loan-grid">
        ${LOANWORDS.map((w) => `
          <button class="loan" data-flip>
            <span class="loan-front"><span class="jp">${w.k}</span><span class="romaji">${kanaToRomaji(w.k)}</span></span>
            <span class="loan-back"><b>${w.en}</b><span>${w.zh}</span></span>
          </button>`).join('')}
      </div>
      <p class="muted small">日文的音節一定是「子音＋母音」，所以英文的 coffee 會變成 ko-o-hi-i（コーヒー）。</p>
    </section>

    <section class="guide" id="s3">
      <h2><span class="num">3</span> 漢字：會中文的超能力（但要小心陷阱）</h2>
      <p>日文的漢字多數跟中文意思一樣：<span class="jp">駅</span>（車站）、<span class="jp">出口</span>、<span class="jp">禁煙</span>、<span class="jp">牛肉</span>……你不用學就看得懂，<b>這是台灣人學日文最大的優勢</b>。</p>
      <p>但要注意兩件事：</p>
      <ol class="tidy">
        <li><b>讀音完全不同</b>：「出口」日文唸 <span class="jp">でぐち</span>（deguchi），所以看得懂不代表會說，要另外記讀音。</li>
        <li><b>有些字長得一樣，意思卻不一樣</b>：</li>
      </ol>
      <div class="trap-grid">
        ${KANJI_TRAPS.map((t) => `
          <div class="trap">
            <div class="jp trap-jp" data-say="${t.kana}">${t.jp}</div>
            <div class="jp muted small">${t.kana}</div>
            <div class="trap-guess">你可能以為：${t.guess}</div>
            <div class="trap-real">其實是：<b>${t.real}</b></div>
          </div>`).join('')}
      </div>
      <p class="muted small">日本的漢字有些寫法跟繁體中文不同，例如「駅」（驛）、「気」（氣）、「円」（圓），但多半猜得出來。</p>
    </section>

    <section class="guide" id="s4">
      <h2><span class="num">4</span> 發音規則：一個假名 = 一拍</h2>
      <p>日文的發音其實比中文簡單：<b>沒有聲調</b>，而且只有 <b>5 個母音</b>。</p>
      <div class="vowel-row">
        ${VOWELS.map((v) => `
          <button class="vowel" data-say="${v.k}">
            <span class="jp">${v.k}</span><b>${v.r}</b><small>${v.tip}</small>
          </button>`).join('')}
      </div>

      <h3>五十音表怎麼看？</h3>
      <p>五十音表是一張「子音 × 母音」的表格。<b>橫的一排叫「行」</b>（同一個子音），<b>直的一列叫「段」</b>（同一個母音）。</p>
      <div class="grid-explain">
        <div class="ge-row ge-head"><span></span><span>a</span><span>i</span><span>u</span><span>e</span><span>o</span></div>
        <div class="ge-row"><span class="ge-label">（無）</span><span class="jp">あ</span><span class="jp">い</span><span class="jp">う</span><span class="jp">え</span><span class="jp">お</span></div>
        <div class="ge-row hl"><span class="ge-label">k</span><span class="jp">か</span><span class="jp">き</span><span class="jp">く</span><span class="jp">け</span><span class="jp">こ</span></div>
        <div class="ge-row"><span class="ge-label">s</span><span class="jp">さ</span><span class="jp">し</span><span class="jp">す</span><span class="jp">せ</span><span class="jp">そ</span></div>
      </div>
      <p>例如「か行」就是 k 加上五個母音：<b>k + a = か (ka)</b>、k + i = き (ki)……所以只要記住 5 個母音和每一行的子音，就能推出大部分的讀音。</p>
      <div class="callout">
        <b>⚠ 有幾個例外要特別記：</b> し = shi（不是 si）、ち = chi、つ = tsu、ふ = fu、ん = n（唯一沒有母音的字）。
      </div>
      <p>每個假名都佔<b>一樣長的時間（一拍）</b>，像打拍子一樣平均地唸：<span class="jp">さ・し・み</span>（三拍）、<span class="jp">す・し</span>（兩拍）。</p>
    </section>

    <section class="guide" id="s5">
      <h2><span class="num">5</span> 五個特殊符號（聽聽看差別！）</h2>
      <p>這些小符號會改變讀音，有時候還會<b>完全改變意思</b>。每一組都點來聽聽看：</p>
      <div class="special-list">
        ${SPECIAL.map((s) => `
          <div class="special card">
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
            <div class="special-ex">
              <span class="jp">${s.ex[0][0]}</span><small>${s.ex[0][1]}</small>
              <span class="arrow">→</span>
              <span class="jp">${s.ex[1][0]}</span><small>${s.ex[1][1]}</small>
            </div>
            <div class="special-words">
              <button class="chip jp" data-say="${s.say[0]}">🔊 ${esc(s.word[0])}</button>
              <button class="chip jp" data-say="${s.say[1]}">🔊 ${esc(s.word[1])}</button>
            </div>
          </div>`).join('')}
      </div>
    </section>

    <section class="guide" id="s6">
      <h2><span class="num">6</span> 那我要怎麼開始？</h2>
      <div class="callout">
        <b>關於羅馬拼音：</b>網站上每個日文下面都有英文字母的拼音（例如 konnichiwa），剛開始可以靠它，但<b>目標是兩、三週後不看拼音</b>。右上角 ⚙ 可以關掉拼音來考自己。
      </div>
      <ol class="steps">
        <li><b>第 1 週：平假名</b>。到「五十音」頁，一天學 2～3 行，點每個字看漢字字源（例：あ←安），很好記。</li>
        <li><b>每天做假名測驗或玩假名雨</b>，答錯的字網站會記住，之後更常出題。</li>
        <li><b>第 2 週：片假名</b>。發音跟平假名一樣，對照著學很快。</li>
        <li><b>第 3 週起</b>：數字價格 → 旅遊會話 → 情境對話 → 菜單、商店、招牌。</li>
        <li><b>每次學習先打開「弱點複習」</b>，把不熟的練到熟。</li>
      </ol>
      <div class="row-actions left">
        <a class="btn primary big" href="#/kana">開始學平假名 →</a>
        <a class="btn ghost" href="#/review">看我的學習報告</a>
      </div>
    </section>
  `;

  root.addEventListener('click', (e) => {
    const p = e.target.closest('[data-part]');
    if (p) {
      const s = SENTENCE[Number(p.dataset.part)];
      const name = { hira: '平假名', kata: '片假名', kanji: '漢字' }[s.type];
      root.querySelectorAll('.sent-part.sel').forEach((x) => x.classList.remove('sel'));
      p.classList.add('sel');
      root.querySelector('#partInfo').innerHTML = `<b class="jp">${s.t}</b>　<span class="tag ${s.type}">${name}</span>　讀音：<span class="jp">${s.r}</span>　意思：${s.zh}`;
      return;
    }
    const f = e.target.closest('[data-flip]');
    if (f) f.classList.toggle('flipped');
    const a = e.target.closest('.toc a');
    if (a) {
      e.preventDefault();
      root.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
