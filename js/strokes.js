// 筆順動畫：讀取 assets/kanjivg/ 裡的 KanjiVG 筆畫資料，一筆一筆畫出來
// KanjiVG © Ulrich Apel, CC BY-SA 3.0 — https://kanjivg.tagaini.net
const SVG_NS = 'http://www.w3.org/2000/svg';
const cache = new Map();

/** 讀取一個字的筆畫：{ paths: [d...], nums: [{x, y, n}] } */
export async function loadStrokes(ch) {
  if (cache.has(ch)) return cache.get(ch);
  const hex = ch.codePointAt(0).toString(16).padStart(5, '0');
  const p = fetch(`assets/kanjivg/${hex}.svg`)
    .then((r) => {
      if (!r.ok) throw new Error('no stroke data');
      return r.text();
    })
    .then((txt) => {
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const paths = [...doc.querySelectorAll('path')].map((el) => el.getAttribute('d')).filter(Boolean);
      const nums = [...doc.querySelectorAll('text')].map((t) => {
        const m = (t.getAttribute('transform') || '').match(/matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)/);
        return m ? { x: Number(m[1]), y: Number(m[2]), n: t.textContent } : null;
      }).filter(Boolean);
      return { paths, nums };
    });
  cache.set(ch, p);
  p.catch(() => cache.delete(ch));
  return p;
}

function el(name, attrs = {}) {
  const e = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/**
 * 在 container 裡畫出 text 每個字的筆順動畫。
 * 回傳 { replay(), stop() }
 */
export async function mountStrokes(container, text, { speed = 1 } = {}) {
  container.innerHTML = '';
  const chars = [...text];
  const data = await Promise.all(chars.map((c) => loadStrokes(c).catch(() => null)));
  if (data.every((d) => !d)) {
    container.innerHTML = '<p class="muted small">這個字沒有筆順資料</p>';
    return { replay() {}, stop() {} };
  }

  const strokes = []; // { path, num }
  chars.forEach((c, ci) => {
    const d = data[ci];
    if (!d) return;
    const svg = el('svg', { viewBox: '0 0 109 109', class: 'stroke-svg', role: 'img', 'aria-label': `「${c}」的筆順，共 ${d.paths.length} 畫` });
    // 田字格
    svg.append(
      el('rect', { x: 1, y: 1, width: 107, height: 107, class: 'sg-frame' }),
      el('line', { x1: 54.5, y1: 1, x2: 54.5, y2: 108, class: 'sg-guide' }),
      el('line', { x1: 1, y1: 54.5, x2: 108, y2: 54.5, class: 'sg-guide' }),
    );
    const ghost = el('g', { class: 'sg-ghost' });
    d.paths.forEach((pd) => ghost.append(el('path', { d: pd })));
    svg.append(ghost);
    const ink = el('g', { class: 'sg-ink' });
    const nums = el('g', { class: 'sg-nums' });
    d.paths.forEach((pd, i) => {
      const path = el('path', { d: pd });
      ink.append(path);
      const nm = d.nums[i];
      let num = null;
      if (nm) {
        num = el('text', { x: nm.x, y: nm.y });
        num.textContent = nm.n;
        nums.append(num);
      }
      strokes.push({ path, num });
    });
    svg.append(ink, nums);
    container.append(svg);
  });

  let token = 0;
  let anims = [];

  function reset() {
    anims.forEach((a) => a.cancel());
    anims = [];
    for (const s of strokes) {
      const len = s.path.getTotalLength();
      s.len = len;
      s.path.style.strokeDasharray = `${len} ${len}`;
      s.path.style.strokeDashoffset = `${len}`;
      if (s.num) s.num.style.opacity = '0';
    }
  }

  async function play() {
    const my = ++token;
    reset();
    for (const s of strokes) {
      if (my !== token || !container.isConnected) return;
      if (s.num) s.num.style.opacity = '1';
      const a = s.path.animate([{ strokeDashoffset: s.len }, { strokeDashoffset: 0 }], {
        duration: Math.max(280, s.len * 9) / speed,
        easing: 'ease-in-out',
        fill: 'forwards',
      });
      anims.push(a);
      try {
        await a.finished;
      } catch {
        return; // 被取消
      }
      await new Promise((r) => setTimeout(r, 120 / speed));
    }
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // 不播動畫，直接顯示全部筆畫和編號
    strokes.forEach((s) => s.num && (s.num.style.opacity = '1'));
  } else play();

  return {
    replay: play,
    stop() {
      token++;
      anims.forEach((a) => a.cancel());
    },
  };
}
