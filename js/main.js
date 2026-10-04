// 入口：hash 路由 + 選單（側欄／抽屜／底部分頁）+ 全域設定 + 發音按鈕
import { speak, speechSupported, voiceName } from './speech.js';
import { getSetting, setSetting } from './progress.js';

const ROUTES = {
  '': { name: '首頁', load: () => import('./pages/home.js') },
  start: { name: '新手入門', load: () => import('./pages/start.js') },
  kana: { name: '五十音', load: () => import('./pages/kana.js') },
  quiz: { name: '假名測驗', load: () => import('./pages/quiz.js') },
  rain: { name: '假名雨', load: () => import('./pages/rain.js') },
  phrases: { name: '旅遊會話', load: () => import('./pages/phrases.js') },
  dialogue: { name: '情境對話', load: () => import('./pages/dialogue.js') },
  listen: { name: '聽力練習', load: () => import('./pages/listen.js') },
  numbers: { name: '數字價格', load: () => import('./pages/numbers.js') },
  menu: { name: '看懂菜單', load: () => import('./pages/menu.js') },
  shop: { name: '看懂商店', load: () => import('./pages/shop.js') },
  signs: { name: '街頭招牌', load: () => import('./pages/signs.js') },
  review: { name: '弱點複習', load: () => import('./pages/review.js') },
  speak: { name: '跟讀練習', load: () => import('./pages/speak.js') },
  konbini: { name: '3D 便利商店', load: () => import('./pages/konbini.js') },
  train: { name: '搭電車', load: () => import('./pages/train.js') },
  sushi: { name: '迴轉壽司', load: () => import('./pages/sushi.js') },
  cheat: { name: '旅行小抄', load: () => import('./pages/cheat.js') },
};

const app = document.getElementById('app');
let cleanup = null;
let navToken = 0;

async function route() {
  const raw = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  const name = ROUTES[raw] ? raw : '';
  const r = ROUTES[name];
  const token = ++navToken;

  if (cleanup) {
    try {
      cleanup();
    } catch (e) {
      console.error(e);
    }
    cleanup = null;
  }
  window.speechSynthesis?.cancel();
  closeDrawer();

  document.querySelectorAll('[data-route]').forEach((a) => {
    const on = a.dataset.route === name;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.getElementById('pageName').textContent = name ? r.name : '';
  document.title = name ? `${r.name}｜旅日語 Tabi Nihongo` : '旅日語 Tabi Nihongo';
  app.innerHTML = '<div class="loading">読み込み中…</div>';
  window.scrollTo(0, 0);

  let mod;
  try {
    mod = await r.load();
  } catch (e) {
    console.error(e);
    if (token === navToken) app.innerHTML = '<div class="card center"><h2>載入失敗 😢</h2><p>請檢查網路連線後重新整理頁面。</p></div>';
    return;
  }
  if (token !== navToken) return;
  // 每一頁都給一個全新的容器：頁面掛在 root 上的事件監聽器會跟著舊容器一起丟掉，
  // 不會累積到下一頁（否則在 A 頁點按鈕，B 頁的舊監聽器也會被觸發）
  const view = document.createElement('div');
  view.className = 'view';
  app.replaceChildren(view);
  app.classList.remove('page-enter');
  void app.offsetWidth;
  app.classList.add('page-enter');
  const result = await mod.render(view);
  if (token !== navToken) {
    // 渲染途中又換頁了，立刻清掉
    if (typeof result === 'function') result();
    return;
  }
  cleanup = typeof result === 'function' ? result : null;
  updateBadge();
  fitNav();
  // 換頁後把焦點移到新頁標題，鍵盤／螢幕報讀使用者才知道頁面換了
  const h1 = view.querySelector('h1');
  if (h1 && document.activeElement && (document.activeElement === document.body || !document.activeElement.isConnected || sidebar.contains(document.activeElement))) {
    h1.tabIndex = -1;
    h1.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', route);

// 弱點數量顯示在選單上
async function updateBadge() {
  const { weakIds } = await import('./data/registry.js');
  const n = weakIds().length;
  const b = document.getElementById('weakBadge');
  b.hidden = !n;
  b.textContent = n > 99 ? '99+' : n;
}

// 任何帶 data-say 的元素被點擊就唸出來
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-say]');
  if (!el) return;
  e.stopPropagation();
  el.classList.add('speaking');
  speak(el.dataset.say).then(() => el.classList.remove('speaking'));
});

// ---- 側欄分組收合 ----
// 使用者手動收合過的分組記在 localStorage；沒手動設定時，桌機版螢幕不夠高就自動收合「目前頁面以外」的分組
const NAV_KEY = 'tabi-nihongo-nav';
const navGroups = [...document.querySelectorAll('.nav-group')];
const groupName = (g) => g.querySelector('.nav-title').firstChild.textContent.trim();
function loadNavPref() {
  try {
    return JSON.parse(localStorage.getItem(NAV_KEY));
  } catch {
    return null;
  }
}
let navPref = loadNavPref(); // null = 自動；否則是被收合的分組名稱陣列

function setCollapsed(g, on) {
  g.classList.toggle('collapsed', on);
  g.querySelector('.nav-title').setAttribute('aria-expanded', String(!on));
}
function fitNav() {
  const sidebarEl = document.getElementById('sidebar');
  if (navPref) {
    navGroups.forEach((g) => setCollapsed(g, navPref.includes(groupName(g)) && !g.querySelector('a.active')));
    return;
  }
  navGroups.forEach((g) => setCollapsed(g, false));
  const desktop = window.matchMedia('(min-width: 1101px)').matches;
  if (desktop && sidebarEl.scrollHeight > sidebarEl.clientHeight + 2) {
    navGroups.forEach((g) => setCollapsed(g, !g.querySelector('a.active') && groupName(g) !== '開始'));
  }
}
navGroups.forEach((g) => {
  g.querySelector('.nav-title').addEventListener('click', () => {
    setCollapsed(g, !g.classList.contains('collapsed'));
    navPref = navGroups.filter((x) => x.classList.contains('collapsed')).map(groupName);
    try {
      localStorage.setItem(NAV_KEY, JSON.stringify(navPref));
    } catch {
      /* ignore */
    }
  });
});
let navResizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(navResizeTimer);
  navResizeTimer = setTimeout(fitNav, 150);
});

// ---- 手機抽屜選單 ----
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const menuBtn = document.getElementById('menuBtn');

// 抽屜模式（≤1100px）時，關著的側欄要設 inert，鍵盤 Tab 才不會跑進看不到的連結
const drawerMQ = window.matchMedia('(max-width: 1100px)');
function syncInert() {
  sidebar.inert = drawerMQ.matches && !document.body.classList.contains('drawer-open');
}
drawerMQ.addEventListener('change', syncInert);
syncInert();

function openDrawer() {
  document.body.classList.add('drawer-open');
  syncInert();
  scrim.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  document.getElementById('tabMore').setAttribute('aria-expanded', 'true');
  sidebar.querySelector('a.active, a')?.focus({ preventScroll: true });
}
function closeDrawer({ returnFocus = false } = {}) {
  if (!document.body.classList.contains('drawer-open')) return;
  const hadFocus = sidebar.contains(document.activeElement);
  document.body.classList.remove('drawer-open');
  syncInert();
  scrim.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
  document.getElementById('tabMore').setAttribute('aria-expanded', 'false');
  if (returnFocus && hadFocus) menuBtn.focus();
}
menuBtn.addEventListener('click', () => (document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer()));
document.getElementById('tabMore').addEventListener('click', openDrawer);
scrim.addEventListener('click', () => closeDrawer({ returnFocus: true }));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer({ returnFocus: true });
    pop.hidden = true;
  }
});

// ---- 設定面板 ----
const pop = document.getElementById('settingsPop');
const rateInput = document.getElementById('rateInput');
const rateOut = document.getElementById('rateOut');
const romajiInput = document.getElementById('romajiInput');
const themeInput = document.getElementById('themeInput');

function applyTheme() {
  const t = getSetting('theme');
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
}

function applyRomaji() {
  document.body.classList.toggle('hide-romaji', !getSetting('romaji'));
}

rateInput.value = getSetting('rate');
rateOut.textContent = Number(getSetting('rate')).toFixed(1);
romajiInput.checked = getSetting('romaji');
themeInput.value = getSetting('theme');
applyTheme();
applyRomaji();

document.getElementById('settingsBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  pop.hidden = !pop.hidden;
  const info = document.getElementById('voiceInfo');
  if (!speechSupported()) info.textContent = '⚠ 這個瀏覽器不支援語音，建議用 Edge 或 Chrome。';
  else info.textContent = voiceName() ? `目前語音：${voiceName()}` : '⚠ 找不到日文語音。Windows 可到「設定 → 時間與語言 → 語音」新增日文語音，或改用 Edge。';
});
document.addEventListener('click', (e) => {
  if (!pop.hidden && !pop.contains(e.target)) pop.hidden = true;
});
rateInput.addEventListener('input', () => {
  const v = Number(rateInput.value);
  rateOut.textContent = v.toFixed(1);
  setSetting('rate', v);
});
romajiInput.addEventListener('change', () => {
  setSetting('romaji', romajiInput.checked);
  applyRomaji();
});
themeInput.addEventListener('change', () => {
  setSetting('theme', themeInput.value);
  applyTheme();
});
document.getElementById('testVoice').addEventListener('click', () => speak('こんにちは'));

// ---- PWA：離線版與安裝 ----
const offlineInfo = document.getElementById('offlineInfo');
const installBtn = document.getElementById('installBtn');
const installHint = document.getElementById('installHint');
let installEvent = null;

function updateOfflineInfo() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') {
    offlineInfo.textContent = '📴 離線版：這個瀏覽器不支援';
    return;
  }
  const ctrl = navigator.serviceWorker.controller;
  if (!ctrl) {
    offlineInfo.textContent = '📴 離線版：下載中，重新整理一次後即可離線使用';
    return;
  }
  ctrl.postMessage('status');
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW 註冊失敗', e));
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type !== 'status') return;
    const ready = e.data.cached >= e.data.total;
    offlineInfo.textContent = ready ? `✅ 已可離線使用（${e.data.total} 個檔案）` : `📥 離線資料下載中…（${e.data.cached}/${e.data.total}）`;
  });
  navigator.serviceWorker.addEventListener('controllerchange', updateOfflineInfo);
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent = null;
  installBtn.hidden = true;
});
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
installHint.textContent = standalone
  ? '已經是安裝版了 👍'
  : isIOS
    ? 'iPhone：用 Safari 開啟 → 分享按鈕 → 「加入主畫面」。'
    : '安裝後可以像 App 一樣從桌面打開，沒網路也能查句子（語音要看裝置是否內建日文語音）。';
document.getElementById('settingsBtn').addEventListener('click', updateOfflineInfo);

route();
