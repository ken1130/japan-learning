import { CATEGORIES, PHRASES } from '../data/phrases.js';
import { isFav, toggleFav, record, strength } from '../progress.js';
import { speak } from '../speech.js';
import { esc, toast } from '../util.js';

export function render(root) {
  let cat = 'basic';
  let practice = false;

  function list() {
    if (cat === 'fav') return PHRASES.filter((p) => isFav('phrase:' + p.id));
    if (cat === 'hear') return PHRASES.filter((p) => p.hear);
    return PHRASES.filter((p) => p.cat === cat);
  }

  function card(p) {
    const id = 'phrase:' + p.id;
    const s = strength(id);
    return `
      <article class="phrase ${p.hear ? 'is-hear' : ''}" data-id="${p.id}">
        <div class="phrase-main">
          ${p.hear ? '<span class="badge hear">👂 你會聽到</span>' : ''}
          <div class="phrase-jp jp" data-say="${esc(p.jp)}">${esc(p.jp)}</div>
          ${p.kana !== p.jp ? `<div class="phrase-kana jp">${esc(p.kana)}</div>` : ''}
          <div class="romaji">${esc(p.ro)}</div>
          <div class="phrase-zh ${practice ? 'concealed' : ''}" ${practice ? 'tabindex="0" role="button" aria-label="顯示中文"' : ''}>${esc(p.zh)}</div>
          ${p.note ? `<div class="phrase-note ${practice ? 'concealed' : ''}">💡 ${esc(p.note)}</div>` : ''}
        </div>
        <div class="phrase-actions">
          <button class="say" data-say="${esc(p.jp)}" title="播放">🔊</button>
          <button class="say slow" data-slow="${esc(p.jp)}" title="慢速播放">🐢</button>
          <button class="fav ${isFav(id) ? 'on' : ''}" data-fav="${id}" title="收藏">${isFav(id) ? '★' : '☆'}</button>
          <span class="dots" title="熟練度">${'●'.repeat(s)}${'○'.repeat(5 - s)}</span>
        </div>
        ${practice ? `<div class="self-check"><button class="btn small ghost" data-check="0">還不熟</button><button class="btn small primary" data-check="1">我會了 ✓</button></div>` : ''}
      </article>`;
  }

  function draw() {
    const items = list();
    const catInfo = CATEGORIES.find((c) => c.id === cat);
    root.innerHTML = `
      <header class="page-head">
        <h1>旅遊會話</h1>
        <p class="lead">點日文或 🔊 聽發音，🐢 是慢速。標著「👂 你會聽到」的句子是店員、廣播會對你說的，重點是聽懂。</p>
      </header>
      <div class="tabs">
        ${CATEGORIES.map((c) => `<button data-cat="${c.id}" class="${cat === c.id ? 'on' : ''}">${c.icon} ${c.name}</button>`).join('')}
        <button data-cat="hear" class="${cat === 'hear' ? 'on' : ''}">👂 聽力句</button>
        <button data-cat="fav" class="${cat === 'fav' ? 'on' : ''}">★ 收藏</button>
      </div>
      <div class="toolbar">
        <span class="muted">${catInfo ? catInfo.desc : cat === 'fav' ? '你收藏的句子' : '所有「你會聽到」的句子'}・${items.length} 句</span>
        <label class="switch"><input type="checkbox" id="practice" ${practice ? 'checked' : ''}/> 練習模式（先遮住中文）</label>
        <button class="btn small ghost" id="playAll">▶ 全部播放</button>
        ${catInfo ? `<a class="btn small ghost" href="#/speak?cat=${cat}">🎤 跟讀這組</a>` : ''}
      </div>
      ${catInfo?.intro ? `<div class="callout cat-intro">${catInfo.intro}</div>` : ''}
      <div class="phrase-list">
        ${items.length ? items.map(card).join('') : '<p class="muted">還沒有收藏，點句子旁邊的 ☆ 就能收藏。</p>'}
      </div>`;
  }

  let playing = false;
  let run = 0; // 每次播放有自己的編號，舊的迴圈發現編號變了就停
  async function playAll() {
    if (playing) {
      playing = false;
      run++;
      window.speechSynthesis?.cancel();
      return;
    }
    playing = true;
    const my = ++run;
    for (const p of list()) {
      if (my !== run || !root.isConnected) break;
      const el = root.querySelector(`[data-id="${p.id}"]`);
      el?.classList.add('playing');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await speak(p.jp);
      el?.classList.remove('playing');
      await new Promise((r) => setTimeout(r, 600));
    }
    if (my === run) playing = false;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const c = t.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      playing = false;
      run++;
      return draw();
    }
    const f = t.closest('[data-fav]');
    if (f) {
      const on = toggleFav(f.dataset.fav);
      toast(on ? '已收藏 ★' : '已取消收藏');
      return draw();
    }
    const slow = t.closest('[data-slow]');
    if (slow) return speak(slow.dataset.slow, { rate: 0.6 });
    if (t.closest('.concealed')) return t.closest('.concealed').classList.remove('concealed');
    const chk = t.closest('[data-check]');
    if (chk) {
      const art = chk.closest('.phrase');
      record('phrase:' + art.dataset.id, chk.dataset.check === '1');
      art.querySelectorAll('.concealed').forEach((x) => x.classList.remove('concealed'));
      const s = strength('phrase:' + art.dataset.id);
      art.querySelector('.dots').textContent = '●'.repeat(s) + '○'.repeat(5 - s);
      art.classList.add(chk.dataset.check === '1' ? 'ok' : 'notyet');
      return;
    }
    if (t.closest('#playAll')) playAll();
  });
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.concealed')) {
      e.preventDefault();
      e.target.classList.remove('concealed');
    }
  });
  root.addEventListener('change', (e) => {
    if (e.target.id === 'practice') {
      practice = e.target.checked;
      draw();
    }
  });

  draw();
  return () => {
    playing = false;
    run++;
  };
}
