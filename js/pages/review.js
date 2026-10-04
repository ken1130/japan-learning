import { TYPES, getItem, allItems, groups, weakIds, dueIds } from '../data/registry.js';
import {
  record, itemStats, practicedIds, strength, isWeak, mastery, accuracy, dailyLog,
  streak, totalDays, exportData, importData, resetProgress,
} from '../progress.js';
import { speak } from '../speech.js';
import { esc, shuffle, choices, toast } from '../util.js';

const DRILL_SIZE = 10;
const pctText = (r) => (r == null ? '—' : Math.round(r * 100) + '%');

export function render(root) {
  let filter = 'all';
  let drill = null;
  let alive = true;

  // 情境對話的步驟沒辦法單獨出題，到對話頁重玩
  const drillable = (id) => getItem(id) && getItem(id).type !== 'dlg';


  function chartHtml() {
    const days = dailyLog(14);
    const max = Math.max(1, ...days.map((d) => d.c + d.w));
    const total = days.reduce((s, d) => s + d.c + d.w, 0);
    return `
      <div class="chart" role="img" aria-label="最近 14 天每天作答數，共 ${total} 題">
        <div class="chart-bars">
          ${days.map((d) => {
            const n = d.c + d.w;
            return `<div class="chart-col" tabindex="0" aria-label="${d.label}：${n} 題，答對 ${d.c}">
              <div class="chart-bar" style="height:${(n / max) * 100}%"></div>
              <div class="chart-tip">${d.label}<br/><b>${n}</b> 題・答對 ${d.c}</div>
              <span class="chart-x">${d.label}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <p class="muted small">最近 14 天共作答 <b>${total}</b> 題。把滑鼠移到（或點）長條上看詳細數字。</p>`;
  }

  function overview() {
    const practiced = practicedIds().filter((id) => getItem(id));
    const acc = accuracy(practiced);
    const weak = weakIds();
    const due = dueIds();
    const gs = groups();

    root.innerHTML = `
      <header class="page-head">
        <h1>弱點複習 <small>📊 我的學習報告</small></h1>
        <p class="lead">你在網站上每次作答（測驗、遊戲、聽力、情境對話）都會自動記錄在這台電腦的瀏覽器裡。這裡幫你找出<b>最常錯、最不熟</b>的地方，集中反覆練習。</p>
      </header>

      ${practiced.length === 0 ? `
        <div class="card empty-state">
          <div class="empty-emoji">🌱</div>
          <h2>還沒有學習紀錄</h2>
          <p>先去做幾個測驗，這裡就會出現你的弱點分析。建議從這裡開始：</p>
          <div class="row-actions">
            <a class="btn primary" href="#/start">📖 新手入門</a>
            <a class="btn ghost" href="#/quiz">📝 假名測驗</a>
          </div>
        </div>` : ''}

      <section class="stats-row">
        <div class="stat"><b>${practiced.length}</b><span>練習過的項目</span></div>
        <div class="stat"><b>${pctText(acc.rate)}</b><span>整體答對率（${acc.c} 對 / ${acc.w} 錯）</span></div>
        <div class="stat warn-stat"><b>${weak.length}</b><span>弱點項目 🎯</span></div>
        <div class="stat"><b>${due.length}</b><span>今天該複習 ⏰</span></div>
        <div class="stat"><b>${streak()}</b><span>連續學習天數 🔥（累計 ${totalDays()} 天）</span></div>
      </section>

      <section class="card drill-start">
        <h2>開始練習</h2>
        <div class="drill-modes">
          <button class="mode-card" data-mode="weak" ${weak.filter(drillable).length ? '' : 'disabled'}>
            <span class="mode-icon">🎯</span><b>弱點特訓</b>
            <small>只練你最常錯的 ${Math.min(DRILL_SIZE, weak.filter(drillable).length)} 題</small>
          </button>
          <button class="mode-card" data-mode="due" ${due.length ? '' : 'disabled'}>
            <span class="mode-icon">⏰</span><b>到期複習</b>
            <small>間隔複習：越熟的隔越久才出現（${due.length} 題到期）</small>
          </button>
          <button class="mode-card" data-mode="mixed" ${practiced.filter(drillable).length ? '' : 'disabled'}>
            <span class="mode-icon">🎲</span><b>綜合複習</b>
            <small>從所有學過的內容隨機出題</small>
          </button>
        </div>
        <p class="muted small">熟練度規則：每個項目 0～5 顆星，答對 +1、答錯 −2。低於 3 顆星、或答錯比答對多，就算「弱點」。</p>
      </section>

      <section class="card">
        <h2>最近 14 天</h2>
        ${chartHtml()}
      </section>

      <section class="card">
        <h2>各單元熟練度</h2>
        <div class="table-scroll">
          <table class="report-table">
            <thead><tr><th>單元</th><th>熟練度</th><th>答對率</th><th>練習過</th><th>弱點</th><th></th></tr></thead>
            <tbody>
              ${gs.map((g) => {
                const tried = g.ids.filter((id) => itemStats(id)).length;
                const a = accuracy(g.ids);
                const m = Math.round(mastery(g.ids) * 100);
                const w = g.ids.filter(isWeak).length;
                return `<tr>
                  <td><span class="g-icon">${g.icon}</span> ${g.name}</td>
                  <td><span class="bar inline-bar"><i style="width:${m}%"></i></span> ${m}%</td>
                  <td>${pctText(a.rate)}</td>
                  <td>${tried} / ${g.ids.length}</td>
                  <td>${w ? `<b class="bad">${w}</b>` : '0'}</td>
                  <td><a class="btn small ghost" href="${g.href}">去學習</a></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>弱點清單 <small class="muted">${weak.length} 項，最需要加強的排前面</small></h2>
        <div class="tabs small">
          <button data-filter="all" class="${filter === 'all' ? 'on' : ''}">全部</button>
          ${Object.entries(TYPES).map(([k, t]) => `<button data-filter="${k}" class="${filter === k ? 'on' : ''}">${t.icon} ${t.name}</button>`).join('')}
        </div>
        <div class="weak-list">${weakListHtml(weak)}</div>
      </section>

      <section class="card">
        <h2>備份與重設</h2>
        <p class="muted small">進度只存在這個瀏覽器。換電腦、換瀏覽器或清除瀏覽資料前，先下載備份檔，之後可以匯入還原。</p>
        <div class="row-actions left">
          <button class="btn" id="export">⬇ 下載備份</button>
          <label class="btn">⬆ 匯入備份<input type="file" id="import" accept="application/json,.json" hidden /></label>
          <button class="btn ghost danger" id="reset">清除所有進度</button>
        </div>
      </section>`;
  }

  function weakListHtml(weak) {
    const items = weak.map(getItem).filter((x) => x && (filter === 'all' || x.type === filter));
    if (!items.length) return `<p class="muted">${weak.length ? '這個分類沒有弱點 👍' : '目前沒有弱點，太棒了！繼續保持 🎉'}</p>`;
    return items.slice(0, 60).map((x) => {
      const st = itemStats(x.id);
      const t = TYPES[x.type];
      return `
        <div class="weak-row">
          <span class="type-badge" title="${t.name}">${t.icon}<small>${t.name}</small></span>
          <div class="weak-main">
            <div class="jp weak-show">${esc(x.show)}</div>
            <div class="muted small">${x.type === 'kana' ? esc(x.sub) : `${esc(x.sub)}・${esc(x.zh)}`}</div>
          </div>
          <div class="weak-stats">
            <span class="dots" title="熟練度">${'●'.repeat(strength(x.id))}${'○'.repeat(5 - strength(x.id))}</span>
            <small>錯 ${esc(st.w)}・對 ${esc(st.c)}</small>
          </div>
          ${x.type === 'dlg' ? `<a class="btn small ghost" href="${x.href}">重玩</a>` : `<button class="say" data-say="${esc(x.say)}" aria-label="播放">🔊</button>`}
        </div>`;
    }).join('') + (items.length > 60 ? `<p class="muted small">…還有 ${items.length - 60} 項</p>` : '');
  }

  // ---- 特訓 ----
  function startDrill(mode) {
    let ids;
    if (mode === 'weak') ids = weakIds().filter(drillable).slice(0, DRILL_SIZE);
    else if (mode === 'due') ids = dueIds().slice(0, DRILL_SIZE);
    else ids = shuffle(practicedIds().filter(drillable)).slice(0, DRILL_SIZE);
    if (!ids.length) return;
    drill = { mode, queue: shuffle(ids), i: 0, ok: 0, wrong: [], cur: null };
    nextQ();
  }

  function makeQ(item) {
    const pool = allItems().filter((x) => x.type === item.type && (item.type !== 'kana' || x.script === item.script));
    if (item.type === 'kana') {
      return { item, kind: 'kana', prompt: `<div class="q-big jp">${esc(item.show)}</div><p class="q-label">這個假名怎麼唸？</p>`, opts: choices(item, pool, 4, (x) => x.zh), label: (o) => esc(o.zh), same: (o) => o.zh === item.zh };
    }
    if (item.type === 'phrase') {
      return { item, kind: 'phrase', prompt: `<div class="q-zh">「${esc(item.zh)}」</div><p class="q-label">日文要怎麼說？</p>`, opts: choices(item, pool, 4, (x) => x.show), label: (o) => `<span class="jp">${esc(o.show)}</span>`, same: (o) => o.show === item.show };
    }
    return { item, kind: 'word', prompt: `<div class="q-big jp">${esc(item.show)}</div><p class="q-label">這是什麼意思？</p>`, opts: choices(item, pool, 4, (x) => x.zh), label: (o) => esc(o.zh), same: (o) => o.zh === item.zh };
  }

  function nextQ() {
    const item = getItem(drill.queue[drill.i]);
    drill.cur = { ...makeQ(item), done: false };
    const q = drill.cur;
    const title = { weak: '🎯 弱點特訓', due: '⏰ 到期複習', mixed: '🎲 綜合複習' }[drill.mode];
    root.innerHTML = `
      <div class="quiz">
        <div class="quiz-top">
          <button class="btn small ghost" id="quitDrill">← 離開</button>
          <span>${title}</span>
          <span class="bar"><i style="width:${(drill.i / drill.queue.length) * 100}%"></i></span>
          <span>${drill.i + 1}/${drill.queue.length}</span>
        </div>
        <div class="q-prompt column">${TYPES[item.type].icon} ${prompt(q)}</div>
        <div class="opts ${q.kind === 'phrase' ? 'phrase-opts' : ''}">
          ${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd>${q.label(o)}</button>`).join('')}
        </div>
        <div class="q-feedback" id="fb"></div>
      </div>`;
    if (q.kind !== 'phrase') speak(item.say);
  }
  const prompt = (q) => q.prompt;

  function answer(i) {
    const q = drill?.cur;
    if (!q || q.done) return;
    q.done = true;
    const ok = q.same(q.opts[i]);
    record(q.item.id, ok);
    if (ok) drill.ok++;
    else drill.wrong.push(q.item);
    root.querySelectorAll('.opt').forEach((b, j) => {
      if (q.same(q.opts[j])) b.classList.add('right');
      else if (j === i) b.classList.add('wrong');
      b.disabled = true;
    });
    root.querySelector('#fb').innerHTML = `
      <div class="${ok ? 'good' : 'bad'}">${ok ? '正解！' : '答錯了，再記一次：'}</div>
      <div class="jp reveal" data-say="${esc(q.item.say)}">🔊 ${esc(q.item.show)}</div>
      <div class="muted">${esc(q.item.sub)}・${esc(q.item.zh)}</div>
      <button class="btn primary" id="nextQ">${drill.i + 1 >= drill.queue.length ? '看結果' : '下一題 →'}</button>`;
    speak(q.item.say);
    root.querySelector('#nextQ').focus({ preventScroll: true });
  }

  function drillSummary() {
    const n = drill.queue.length;
    const pct = Math.round((drill.ok / n) * 100);
    const left = weakIds().length;
    root.innerHTML = `
      <div class="card summary">
        <div class="score-ring" style="--p:${pct}"><span>${drill.ok}/${n}</span></div>
        <h2>${pct === 100 ? '全對！弱點正在消失中 ✨' : pct >= 70 ? '進步了！再練一輪更穩 💪' : '多練幾輪就會記住，加油！'}</h2>
        ${drill.wrong.length ? `<p>這次答錯的：</p><div class="missed">${drill.wrong.map((x) => `<button class="chip jp" data-say="${esc(x.say)}">${esc(x.show)} <small>${esc(x.type === 'kana' ? x.sub : x.zh)}</small></button>`).join('')}</div>` : ''}
        <p class="muted">目前還有 <b>${left}</b> 個弱點項目</p>
        <div class="row-actions">
          <button class="btn primary" data-mode="${drill.mode}">再練一輪</button>
          <button class="btn ghost" id="toOverview">回學習報告</button>
        </div>
      </div>`;
    drill = null;
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const m = t.closest('[data-mode]');
    if (m && !m.disabled) return startDrill(m.dataset.mode);
    const f = t.closest('[data-filter]');
    if (f) {
      filter = f.dataset.filter;
      root.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('on', b === f));
      root.querySelector('.weak-list').innerHTML = weakListHtml(weakIds());
      return;
    }
    const o = t.closest('.opt');
    if (o) return answer(Number(o.dataset.i));
    if (t.closest('#nextQ')) {
      drill.i++;
      return drill.i >= drill.queue.length ? drillSummary() : nextQ();
    }
    if (t.closest('#quitDrill') || t.closest('#toOverview')) {
      drill = null;
      return overview();
    }
    if (t.closest('#export')) {
      const blob = new Blob([exportData()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tabi-nihongo-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return toast('已下載備份檔');
    }
    if (t.closest('#reset')) {
      if (confirm('確定要清除所有學習進度嗎？建議先下載備份。（設定會保留）')) {
        resetProgress();
        toast('已清除進度');
        overview();
      }
    }
  });

  root.addEventListener('change', async (e) => {
    if (e.target.id !== 'import') return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (importData(await file.text())) {
        toast('已匯入備份 ✅');
        if (alive) overview();
      } else toast('這不是旅日語的備份檔');
    } catch {
      toast('檔案格式錯誤，無法匯入');
    }
  });

  const onKey = (e) => {
    if (!drill?.cur || e.target.matches('input, textarea')) return;
    if (/^[1-4]$/.test(e.key)) answer(Number(e.key) - 1);
  };
  document.addEventListener('keydown', onKey);

  overview();
  return () => {
    alive = false;
    document.removeEventListener('keydown', onKey);
  };
}
