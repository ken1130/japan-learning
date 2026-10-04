// Service Worker：讓網站可以離線使用（PWA）
// ⚠ ASSETS 清單由 tools/build-sw.py 自動產生，新增或刪除檔案後請執行：python3 tools/build-sw.py
// <ASSETS>
const VERSION = '805bff1929';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/data/dialogues.js',
  'js/data/food.js',
  'js/data/kana.js',
  'js/data/konbini.js',
  'js/data/numbers.js',
  'js/data/phrases.js',
  'js/data/registry.js',
  'js/data/shopping.js',
  'js/data/signs.js',
  'js/data/sushi.js',
  'js/data/train.js',
  'js/main.js',
  'js/pages/cheat.js',
  'js/pages/dialogue.js',
  'js/pages/home.js',
  'js/pages/kana.js',
  'js/pages/konbini.js',
  'js/pages/listen.js',
  'js/pages/menu.js',
  'js/pages/numbers.js',
  'js/pages/phrases.js',
  'js/pages/quiz.js',
  'js/pages/rain.js',
  'js/pages/review.js',
  'js/pages/shop.js',
  'js/pages/signs.js',
  'js/pages/speak.js',
  'js/pages/start.js',
  'js/pages/sushi.js',
  'js/pages/train.js',
  'js/progress.js',
  'js/speech.js',
  'js/strokes.js',
  'js/three/hero.js',
  'js/three/kanaRain.js',
  'js/three/konbini.js',
  'js/three/signStreet.js',
  'js/three/textTexture.js',
  'js/util.js',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon.svg',
  'assets/icons/maskable-512.png',
  'assets/kanjivg/03041.svg',
  'assets/kanjivg/03042.svg',
  'assets/kanjivg/03043.svg',
  'assets/kanjivg/03044.svg',
  'assets/kanjivg/03045.svg',
  'assets/kanjivg/03046.svg',
  'assets/kanjivg/03047.svg',
  'assets/kanjivg/03048.svg',
  'assets/kanjivg/03049.svg',
  'assets/kanjivg/0304a.svg',
  'assets/kanjivg/0304b.svg',
  'assets/kanjivg/0304c.svg',
  'assets/kanjivg/0304d.svg',
  'assets/kanjivg/0304e.svg',
  'assets/kanjivg/0304f.svg',
  'assets/kanjivg/03050.svg',
  'assets/kanjivg/03051.svg',
  'assets/kanjivg/03052.svg',
  'assets/kanjivg/03053.svg',
  'assets/kanjivg/03054.svg',
  'assets/kanjivg/03055.svg',
  'assets/kanjivg/03056.svg',
  'assets/kanjivg/03057.svg',
  'assets/kanjivg/03058.svg',
  'assets/kanjivg/03059.svg',
  'assets/kanjivg/0305a.svg',
  'assets/kanjivg/0305b.svg',
  'assets/kanjivg/0305c.svg',
  'assets/kanjivg/0305d.svg',
  'assets/kanjivg/0305e.svg',
  'assets/kanjivg/0305f.svg',
  'assets/kanjivg/03060.svg',
  'assets/kanjivg/03061.svg',
  'assets/kanjivg/03062.svg',
  'assets/kanjivg/03063.svg',
  'assets/kanjivg/03064.svg',
  'assets/kanjivg/03065.svg',
  'assets/kanjivg/03066.svg',
  'assets/kanjivg/03067.svg',
  'assets/kanjivg/03068.svg',
  'assets/kanjivg/03069.svg',
  'assets/kanjivg/0306a.svg',
  'assets/kanjivg/0306b.svg',
  'assets/kanjivg/0306c.svg',
  'assets/kanjivg/0306d.svg',
  'assets/kanjivg/0306e.svg',
  'assets/kanjivg/0306f.svg',
  'assets/kanjivg/03070.svg',
  'assets/kanjivg/03071.svg',
  'assets/kanjivg/03072.svg',
  'assets/kanjivg/03073.svg',
  'assets/kanjivg/03074.svg',
  'assets/kanjivg/03075.svg',
  'assets/kanjivg/03076.svg',
  'assets/kanjivg/03077.svg',
  'assets/kanjivg/03078.svg',
  'assets/kanjivg/03079.svg',
  'assets/kanjivg/0307a.svg',
  'assets/kanjivg/0307b.svg',
  'assets/kanjivg/0307c.svg',
  'assets/kanjivg/0307d.svg',
  'assets/kanjivg/0307e.svg',
  'assets/kanjivg/0307f.svg',
  'assets/kanjivg/03080.svg',
  'assets/kanjivg/03081.svg',
  'assets/kanjivg/03082.svg',
  'assets/kanjivg/03083.svg',
  'assets/kanjivg/03084.svg',
  'assets/kanjivg/03085.svg',
  'assets/kanjivg/03086.svg',
  'assets/kanjivg/03087.svg',
  'assets/kanjivg/03088.svg',
  'assets/kanjivg/03089.svg',
  'assets/kanjivg/0308a.svg',
  'assets/kanjivg/0308b.svg',
  'assets/kanjivg/0308c.svg',
  'assets/kanjivg/0308d.svg',
  'assets/kanjivg/0308f.svg',
  'assets/kanjivg/03092.svg',
  'assets/kanjivg/03093.svg',
  'assets/kanjivg/030a1.svg',
  'assets/kanjivg/030a2.svg',
  'assets/kanjivg/030a3.svg',
  'assets/kanjivg/030a4.svg',
  'assets/kanjivg/030a5.svg',
  'assets/kanjivg/030a6.svg',
  'assets/kanjivg/030a7.svg',
  'assets/kanjivg/030a8.svg',
  'assets/kanjivg/030a9.svg',
  'assets/kanjivg/030aa.svg',
  'assets/kanjivg/030ab.svg',
  'assets/kanjivg/030ac.svg',
  'assets/kanjivg/030ad.svg',
  'assets/kanjivg/030ae.svg',
  'assets/kanjivg/030af.svg',
  'assets/kanjivg/030b0.svg',
  'assets/kanjivg/030b1.svg',
  'assets/kanjivg/030b2.svg',
  'assets/kanjivg/030b3.svg',
  'assets/kanjivg/030b4.svg',
  'assets/kanjivg/030b5.svg',
  'assets/kanjivg/030b6.svg',
  'assets/kanjivg/030b7.svg',
  'assets/kanjivg/030b8.svg',
  'assets/kanjivg/030b9.svg',
  'assets/kanjivg/030ba.svg',
  'assets/kanjivg/030bb.svg',
  'assets/kanjivg/030bc.svg',
  'assets/kanjivg/030bd.svg',
  'assets/kanjivg/030be.svg',
  'assets/kanjivg/030bf.svg',
  'assets/kanjivg/030c0.svg',
  'assets/kanjivg/030c1.svg',
  'assets/kanjivg/030c2.svg',
  'assets/kanjivg/030c3.svg',
  'assets/kanjivg/030c4.svg',
  'assets/kanjivg/030c5.svg',
  'assets/kanjivg/030c6.svg',
  'assets/kanjivg/030c7.svg',
  'assets/kanjivg/030c8.svg',
  'assets/kanjivg/030c9.svg',
  'assets/kanjivg/030ca.svg',
  'assets/kanjivg/030cb.svg',
  'assets/kanjivg/030cc.svg',
  'assets/kanjivg/030cd.svg',
  'assets/kanjivg/030ce.svg',
  'assets/kanjivg/030cf.svg',
  'assets/kanjivg/030d0.svg',
  'assets/kanjivg/030d1.svg',
  'assets/kanjivg/030d2.svg',
  'assets/kanjivg/030d3.svg',
  'assets/kanjivg/030d4.svg',
  'assets/kanjivg/030d5.svg',
  'assets/kanjivg/030d6.svg',
  'assets/kanjivg/030d7.svg',
  'assets/kanjivg/030d8.svg',
  'assets/kanjivg/030d9.svg',
  'assets/kanjivg/030da.svg',
  'assets/kanjivg/030db.svg',
  'assets/kanjivg/030dc.svg',
  'assets/kanjivg/030dd.svg',
  'assets/kanjivg/030de.svg',
  'assets/kanjivg/030df.svg',
  'assets/kanjivg/030e0.svg',
  'assets/kanjivg/030e1.svg',
  'assets/kanjivg/030e2.svg',
  'assets/kanjivg/030e3.svg',
  'assets/kanjivg/030e4.svg',
  'assets/kanjivg/030e5.svg',
  'assets/kanjivg/030e6.svg',
  'assets/kanjivg/030e7.svg',
  'assets/kanjivg/030e8.svg',
  'assets/kanjivg/030e9.svg',
  'assets/kanjivg/030ea.svg',
  'assets/kanjivg/030eb.svg',
  'assets/kanjivg/030ec.svg',
  'assets/kanjivg/030ed.svg',
  'assets/kanjivg/030ef.svg',
  'assets/kanjivg/030f2.svg',
  'assets/kanjivg/030f3.svg',
  'assets/kanjivg/030f4.svg',
];
// </ASSETS>

const PRECACHE = `tabi-precache-${VERSION}`;
const RUNTIME = 'tabi-runtime-v1';
// 外部資源：three.js、Google 字型
const CDN = [
  'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Sans+TC:wght@400;700&family=Noto+Serif+JP:wght@700&display=swap',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await cache.addAll(ASSETS);
      const rt = await caches.open(RUNTIME);
      await Promise.all(CDN.map((u) => fetch(u, { mode: 'cors' }).then((r) => r.ok && rt.put(u, r)).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('tabi-precache-') && k !== PRECACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// 先回快取（快），同時在背景更新快取（下次就是新版）
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = (await cache.match(request, { ignoreSearch: true })) || (await caches.match(request, { ignoreSearch: true }));
  const network = fetch(request)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 頁面導覽：離線時回傳快取的 index.html（hash 路由，所有頁面都是同一個 HTML）
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(PRECACHE).then((c) => c.put('./index.html', res.clone()));
          return res;
        })
        .catch(async () => (await caches.match('./index.html')) || (await caches.match('./')) || Response.error()),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, PRECACHE));
    return;
  }
  if (/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME));
  }
});

// 頁面可以詢問離線資料是否準備好
self.addEventListener('message', async (event) => {
  if (event.data === 'status') {
    const cache = await caches.open(PRECACHE);
    const keys = await cache.keys();
    event.source?.postMessage({ type: 'status', cached: keys.length, total: ASSETS.length, version: VERSION });
  }
});
