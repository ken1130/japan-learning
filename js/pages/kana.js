import { GOJUON, DAKUTEN, YOON, toKatakana, toHiragana, kanaInfo, kanaToRomaji } from '../data/kana.js';
import { strength } from '../progress.js';
import { speak } from '../speech.js';
import { esc, sayBtn } from '../util.js';
import { mountStrokes } from '../strokes.js';

const VOWELS = ['a', 'i', 'u', 'e', 'o'];

export function render(root) {
  let script = location.hash.includes('kata') ? 'kata' : 'hira';
  let selected = null;
  let strokeCtl = null;

  const conv = (k) => (script === 'kata' ? toKatakana(k) : k);

  function cell(c) {
    if (!c) return '<div class="kcell empty"></div>';
    const k = conv(c[0]);
    const s = strength('kana:' + k);
    return `<button class="kcell lv${s}" data-k="${esc(k)}" data-r="${c[1]}">
      <span class="kchar">${k}</span><span class="romaji">${c[1]}</span>
    </button>`;
  }

  function table(rows, cols) {
    return `<div class="ktable" style="--cols:${cols}">
      ${rows.map(([, cells]) => cells.map(cell).join('')).join('')}
    </div>`;
  }

  function detail(k, r) {
    const info = kanaInfo(k);
    const [word, meaning] = info.example || [];
    const isWord = word && !word.startsWith('（');
    return `
      <div class="sheet-bar">
        <span class="sheet-handle" aria-hidden="true"></span>
        <button class="sheet-close" id="sheetClose" aria-label="關閉說明">✕ 關閉</button>
      </div>
      <div class="kdetail-inner">
        <button class="flip3d" id="flip" aria-label="翻面看拼音和字源">
          <span class="face front"><span>${k}</span></span>
          <span class="face back"><span>${r}</span>${info.origin ? `<small>字源：${info.origin}</small>` : ''}</span>
        </button>
        <div class="kdetail-text">
          <div class="big-row"><span class="big">${k}</span> <span class="romaji big-r">${r}</span> ${sayBtn(k)}</div>
          ${info.origin ? `<p>🈶 字源：從漢字「<b class="origin">${info.origin}</b>」演變而來</p>` : ''}
          ${word ? `<p>📘 例字：<b class="jp">${esc(word)}</b> ${isWord ? `<span class="romaji">${kanaToRomaji(word)}</span> ${sayBtn(word)}` : ''}<br/><span class="muted">${esc(meaning)}</span></p>` : ''}
          ${info.confusable ? `<p class="warn">⚠ 容易跟「${info.confusable}」搞混</p>` : ''}
          <p class="muted small">點卡片可以翻面看拼音和字源</p>
        </div>
        <div class="stroke-wrap">
          <div class="stroke-head"><b>✍️ 筆順</b><button class="btn small ghost" id="replayStroke">↻ 再播一次</button></div>
          <div class="stroke-box" id="strokeBox"><p class="muted small">載入中…</p></div>
          <p class="muted tiny">紅色數字是筆畫順序。筆順資料來自 <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener">KanjiVG</a>（CC BY-SA 3.0）</p>
        </div>
      </div>`;
  }

  function draw() {
    root.innerHTML = `
      <header class="page-head">
        <h1>五十音 <small>${script === 'hira' ? 'ひらがな 平假名' : 'カタカナ 片假名'}</small></h1>
        <p class="lead">${script === 'hira'
          ? '平假名是日文的基礎，所有日文都能用它寫出來。先從第一張表開始，一天學一兩行就好。'
          : '片假名主要用來寫外來語——菜單上的ラーメン、コーヒー、ビール都是。發音跟平假名完全一樣。'}</p>
        <div class="kana-intro">
          <div><b class="jp">ひらがな</b> 平假名：圓圓的，日文的<b>基本字母</b>，助詞、動詞變化都用它。<b>先學這個。</b></div>
          <div><b class="jp">カタカナ</b> 片假名：直直的，寫<b>外來語</b>（ラーメン、シャツ）。<b>發音跟平假名完全一樣</b>，只是寫法不同。</div>
        </div>
        <p class="muted small">還不太懂？👉 <a href="#/start">新手入門：平假名和片假名差在哪？</a></p>
        <div class="seg">
          <button data-script="hira" class="${script === 'hira' ? 'on' : ''}">平假名 あ</button>
          <button data-script="kata" class="${script === 'kata' ? 'on' : ''}">片假名 ア</button>
        </div>
      </header>

      <div class="kana-layout">
        <div>
          <h2 class="section-title">清音 <small>基本 46 音</small></h2>
          <div class="vowel-head">${VOWELS.map((v) => `<span>${v}</span>`).join('')}</div>
          ${table(GOJUON, 5)}

          <h2 class="section-title">濁音・半濁音 <small>加上「゛」或「゜」</small></h2>
          <p class="muted small">「゛」讓聲音變濁：か ka → が ga；「゜」只用在 は 行：は ha → ぱ pa</p>
          ${table(DAKUTEN, 5)}

          <h2 class="section-title">拗音 <small>小的 ゃ ゅ ょ</small></h2>
          <p class="muted small">「き」+ 小「ゃ」= きゃ kya，兩個字合成一拍</p>
          ${table(YOON, 3)}

          <div class="card rules">
            <h3>📌 三個特別規則</h3>
            <ul>
              <li><b class="jp">${conv('っ')}</b>（小つ）：停頓一拍，下一個子音重複。<span class="jp">${conv('きっぷ')}</span> = kippu ${sayBtn('きっぷ')}</li>
              <li><b class="jp">ー</b>（長音）：把前一個音拉長，片假名最常見。<span class="jp">ラーメン</span> = raamen ${sayBtn('ラーメン')}</li>
              <li><b class="jp">${conv('ん')}</b>：鼻音，自己算一拍。<span class="jp">${conv('せんせい')}</span> = sensei ${sayBtn('せんせい')}</li>
            </ul>
          </div>

          <div class="legend">
            熟練度：<span class="kcell lv0 mini"></span>未練習
            <span class="kcell lv2 mini"></span>練習中
            <span class="kcell lv5 mini"></span>很熟了
            <a class="btn primary small" href="#/quiz">去測驗 →</a>
          </div>
        </div>

        <aside class="kdetail card" id="detail" aria-live="polite">
          <p class="muted">👈 點任何一個假名，看字源、例字、筆順、聽發音</p>
        </aside>
      </div>
      <div class="sheet-scrim" id="sheetScrim" hidden></div>
    `;
    if (selected) showDetail(selected.k, selected.r, false);
  }

  function showDetail(k, r, say = true) {
    selected = { k, r };
    root.querySelectorAll('.kcell.sel').forEach((el) => el.classList.remove('sel'));
    root.querySelector(`.kcell[data-k="${CSS.escape(k)}"]`)?.classList.add('sel');
    const d = root.querySelector('#detail');
    d.innerHTML = detail(k, r);
    strokeCtl?.stop();
    strokeCtl = null;
    mountStrokes(d.querySelector('#strokeBox'), k).then((c) => {
      if (selected?.k === k) strokeCtl = c;
      else c.stop();
    });
    d.classList.remove('pop');
    void d.offsetWidth;
    d.classList.add('pop');
    if (say) speak(k);
    // 手機：說明從畫面下方滑出（bottom sheet），不用捲到頁尾
    if (say && phone.matches) openSheet();
  }

  const phone = window.matchMedia('(max-width: 760px)');
  function openSheet() {
    const d = root.querySelector('#detail');
    d.classList.add('sheet-open');
    d.scrollTop = 0;
    root.querySelector('#sheetScrim').hidden = false;
    document.body.classList.add('no-scroll');
  }
  function closeSheet() {
    root.querySelector('#detail')?.classList.remove('sheet-open');
    const s = root.querySelector('#sheetScrim');
    if (s) s.hidden = true;
    document.body.classList.remove('no-scroll');
  }
  // 往下滑關閉
  let touchY = null;
  root.addEventListener('touchstart', (e) => {
    const d = e.target.closest('#detail.sheet-open');
    touchY = d && d.scrollTop <= 0 ? e.touches[0].clientY : null;
  }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (touchY != null && e.changedTouches[0].clientY - touchY > 80) closeSheet();
    touchY = null;
  });
  const onKey = (e) => {
    if (e.key === 'Escape') closeSheet();
  };
  document.addEventListener('keydown', onKey);
  phone.addEventListener('change', closeSheet);

  root.addEventListener('click', (e) => {
    const seg = e.target.closest('[data-script]');
    if (seg) {
      script = seg.dataset.script;
      closeSheet();
      if (selected) {
        selected = { k: script === 'kata' ? toKatakana(selected.k) : toHiragana(selected.k), r: selected.r };
      }
      draw();
      return;
    }
    const c = e.target.closest('.kcell[data-k]');
    if (c) return showDetail(c.dataset.k, c.dataset.r);
    const flip = e.target.closest('#flip');
    if (flip) flip.classList.toggle('flipped');
    if (e.target.closest('#replayStroke')) strokeCtl?.replay();
    if (e.target.closest('#sheetClose') || e.target.closest('#sheetScrim')) closeSheet();
  });

  draw();
  return () => {
    strokeCtl?.stop();
    closeSheet();
    document.removeEventListener('keydown', onKey);
    phone.removeEventListener('change', closeSheet);
  };
}
