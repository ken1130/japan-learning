// 3D 便利商店：站在店中間，左右拖曳轉頭看貨架，點商品看名稱、讀音和價格
// 手機：上下滑動交給瀏覽器捲動頁面（touch-action: pan-y），不會把視角往下拉
import * as THREE from 'three';
import { textTexture, fontsReady, disposeScene, autoResize, JP_FONT, makeRenderer, watchVisible } from './textTexture.js';

// 每個貨架的位置：x/z 是中心，ry 是面向，w 是寬度，levels 是層數
const UNITS = {
  back: { x: 0, z: -3.6, ry: 0, w: 6.4, levels: 3, label: 'お弁当・パン・お菓子', color: '#c8402f' },
  fridge: { x: 4.1, z: -0.6, ry: -Math.PI / 2, w: 4.4, levels: 3, label: '飲み物・アイス', color: '#2b6cb0', glass: true },
  goods: { x: -4.1, z: -1.6, ry: Math.PI / 2, w: 3.2, levels: 2, label: '日用品', color: '#3a8a4f' },
  counter: { x: -3.2, z: 1.9, ry: Math.PI / 2, w: 2.2, levels: 1, label: 'レジ・ホットスナック', color: '#e0a100', counter: true },
};

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** 商品包裝正面：底色＋emoji＋商品名＋價格標籤 */
function productTexture(item) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const g = c.getContext('2d');
  g.fillStyle = item.color;
  g.fillRect(0, 0, 256, 320);
  const dark = luminance(item.color) < 0.45;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  g.fillText(item.emoji, 128, 105);
  g.fillStyle = dark ? '#ffffff' : '#1d1d1f';
  const name = item.jp.replace(/（.*?）/g, '');
  const size = Math.min(42, 230 / [...name].length);
  g.font = `900 ${size}px ${JP_FONT}`;
  g.fillText(name, 128, 205);
  // 價格標籤
  g.fillStyle = '#ffe14d';
  g.fillRect(0, 252, 256, 68);
  g.fillStyle = '#c8102e';
  g.font = `900 44px ${JP_FONT}`;
  g.fillText(`¥${item.price.toLocaleString()}`, 128, 288);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#e9e6df';
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#d9d5cc';
  g.fillRect(0, 0, 64, 64);
  g.fillRect(64, 64, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export async function createKonbini(container, { items, onPick, reducedMotion = false }) {
  await fontsReady(Object.values(UNITS).map((u) => u.label).join('') + items.map((it) => it.jp).join(''));

  const renderer = makeRenderer(container);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f2ee);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 50);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c6, 1.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(1, 4, 3);
  scene.add(dl);

  // 房間
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfbfaf7, roughness: 1 });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), wallMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 3.2;
  scene.add(ceiling);
  for (const [x, z, ry, w] of [[0, -4.2, 0, 10], [-4.7, 0, Math.PI / 2, 10], [4.7, 0, -Math.PI / 2, 10]]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, 3.2), wallMat);
    wall.position.set(x, 1.6, z);
    wall.rotation.y = ry;
    scene.add(wall);
  }
  // 牆上的品牌色條（便利商店的經典配色）
  for (const [y, col] of [[2.75, 0x2e9e5b], [2.6, 0xf28c28], [2.45, 0xd7263d]]) {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.12), new THREE.MeshBasicMaterial({ color: col }));
    band.position.set(0, y, -4.19);
    scene.add(band);
  }
  // 天花板燈
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let x = -3; x <= 3; x += 3) {
    for (let z = -3; z <= 1; z += 2) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.25), lightMat);
      l.rotation.x = Math.PI / 2;
      l.position.set(x, 3.19, z);
      scene.add(l);
    }
  }

  // 貨架與商品
  const products = [];
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xbfc3c9, metalness: 0.2, roughness: 0.6 });
  const productGeo = new THREE.BoxGeometry(0.46, 0.58, 0.32);

  for (const [shelfId, u] of Object.entries(UNITS)) {
    const unit = new THREE.Group();
    unit.position.set(u.x, 0, u.z);
    unit.rotation.y = u.ry;
    scene.add(unit);

    const shelfItems = items.filter((it) => it.shelf === shelfId);
    if (u.counter) {
      const counter = new THREE.Mesh(new THREE.BoxGeometry(u.w + 0.4, 1, 0.8), new THREE.MeshStandardMaterial({ color: 0x8a6f5a }));
      counter.position.set(0, 0.5, 0);
      unit.add(counter);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(u.w, 0.7, 0.6), new THREE.MeshStandardMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.25 }));
      glass.position.set(0, 1.35, 0);
      unit.add(glass);
    } else {
      const back = new THREE.Mesh(new THREE.BoxGeometry(u.w, 2.3, 0.05), new THREE.MeshStandardMaterial({ color: u.glass ? 0xdfe8f2 : 0xe2e4e8 }));
      back.position.set(0, 1.15, -0.28);
      unit.add(back);
      for (let i = 0; i < u.levels; i++) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(u.w, 0.05, 0.6), boardMat);
        board.position.set(0, 0.3 + i * 0.72, 0);
        unit.add(board);
      }
      if (u.glass) {
        const door = new THREE.Mesh(new THREE.PlaneGeometry(u.w, 2.3), new THREE.MeshStandardMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.18, depthWrite: false }));
        door.position.set(0, 1.15, 0.36);
        unit.add(door);
      }
    }

    // 掛牌
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(u.w, 3.2), 0.42),
      new THREE.MeshBasicMaterial({ map: textTexture(u.label, { w: 768, h: 100, bg: u.color, fg: '#ffffff' }) }),
    );
    label.position.set(0, u.counter ? 2.25 : 2.6, 0.05);
    unit.add(label);

    // 商品排列：每層平均分配
    const perLevel = Math.ceil(shelfItems.length / u.levels);
    shelfItems.forEach((it, i) => {
      const level = Math.floor(i / perLevel);
      const idx = i % perLevel;
      const count = Math.min(perLevel, shelfItems.length - level * perLevel);
      const spacing = Math.min(1, (u.w - 0.4) / Math.max(count, 1));
      const x = (idx - (count - 1) / 2) * spacing;
      const y = u.counter ? 1.3 : 0.3 + level * 0.72 + 0.32;
      const face = new THREE.MeshStandardMaterial({ map: productTexture(it), roughness: 0.55, emissive: 0x000000 });
      const side = new THREE.MeshStandardMaterial({ color: it.color, roughness: 0.6 });
      const mesh = new THREE.Mesh(productGeo, [side, side, side, side, face, side]);
      mesh.position.set(x, y, 0.05);
      mesh.userData = { item: it, pop: 0, baseY: y };
      unit.add(mesh);
      products.push(mesh);
    });
  }

  // ---- 相機控制：站在店中間轉頭 ----
  const PITCH = -0.12;
  const view = { yaw: 0, tYaw: 0 };
  let dirty = true;
  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  let dragging = false;
  let moved = 0;
  let lastX = 0;
  const ray = new THREE.Raycaster();
  let hovered = null;
  const toNDC = (e) => {
    const r = el.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const hit = (e) => {
    ray.setFromCamera(toNDC(e), camera);
    return ray.intersectObjects(products)[0]?.object || null;
  };
  const turnTo = (y) => {
    view.tYaw = THREE.MathUtils.clamp(y, -1.7, 1.7);
    dirty = true;
  };
  const onDown = (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
  };
  const onMove = (e) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      turnTo(view.tYaw + dx * 0.006);
      lastX = e.clientX;
    }
    if (e.pointerType === 'mouse') {
      const h = hit(e);
      if (h !== hovered) {
        hovered = h;
        dirty = true;
      }
      el.style.cursor = hovered ? 'pointer' : dragging ? 'grabbing' : 'grab';
    }
  };
  const onUp = (e) => {
    if (dragging && moved < 8) {
      const h = hit(e);
      if (h) {
        h.userData.pop = 1;
        dirty = true;
        onPick?.(h.userData.item);
      }
    }
    dragging = false;
  };
  const onCancel = () => {
    dragging = false;
    if (hovered) {
      hovered = null;
      dirty = true;
    }
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  el.addEventListener('pointerleave', onCancel);

  const vis = watchVisible(container);
  vis.onChange = (v) => v && (dirty = true);
  const stopResize = autoResize(container, renderer, camera, () => (dirty = true));
  camera.position.set(0, 1.55, 2.2);
  const dir = new THREE.Vector3();
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    const dy = view.tYaw - view.yaw;
    if (Math.abs(dy) > 0.0005) {
      view.yaw += reducedMotion ? dy : dy * 0.15;
      dirty = true;
    }
    for (const p of products) {
      const d = p.userData;
      const target = (p === hovered ? 1.12 : 1) + d.pop * 0.25;
      if (d.pop > 0 || Math.abs(p.scale.x - target) > 0.002) {
        d.pop = Math.max(0, d.pop - 0.04);
        p.scale.setScalar(p.scale.x + (target - p.scale.x) * 0.2);
        p.position.y = d.baseY + d.pop * 0.12;
        dirty = true;
      }
      p.material[4].emissive.setHex(p === hovered ? 0x222222 : 0x000000);
    }
    // 沒變化或不在畫面上時不重畫
    if (!dirty || !vis.visible) return;
    dirty = false;
    dir.set(Math.sin(-view.yaw), Math.sin(PITCH), -Math.cos(view.yaw));
    camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);
    renderer.render(scene, camera);
  }
  tick();

  return {
    /** 轉向某個貨架 */
    look(shelfId) {
      turnTo({ back: 0, fridge: -1.35, goods: 1.35, counter: 1.7 }[shelfId] ?? 0);
    },
    turn(delta) {
      turnTo(view.tYaw + delta);
    },
    dispose() {
      cancelAnimationFrame(raf);
      stopResize();
      vis.stop();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('pointerleave', onCancel);
      disposeScene(scene);
      renderer.dispose();
      el.remove();
    },
  };
}
