// 3D 日本街景：兩排建築上掛著招牌。左右拖曳轉頭、按鈕／滾輪前進後退、「下一個招牌」自動導覽，點招牌看意思
// 手機：上下滑動交給瀏覽器捲動頁面（touch-action: pan-y），不會被 3D 畫面卡住
import * as THREE from 'three';
import { textTexture, fontsReady, disposeScene, autoResize, makeRenderer, watchVisible } from './textTexture.js';

export async function createSignStreet(container, { signs, onPick }) {
  await fontsReady(signs.map((s) => s.jp).join(''));

  const renderer = makeRenderer(container);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b2140);
  scene.fog = new THREE.Fog(0x1b2140, 10, 34);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x2a1f2f, 1.2));
  const moon = new THREE.DirectionalLight(0xffe7c4, 0.9);
  moon.position.set(-5, 10, 4);
  scene.add(moon);

  // 地面與道路
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 80), new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -20;
  scene.add(ground);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xe8e2c8 });
  for (let z = 2; z > -50; z -= 3) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.4), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.01, z);
    scene.add(line);
  }

  // 建築
  const palette = [0x8a6f5a, 0x5c6b7a, 0x9a8c7a, 0x6d5a6e, 0x7a8a6d, 0xa08870];
  const windowTex = makeWindowTexture();
  const buildings = [];
  const SPACING = 4.2;
  const count = Math.ceil(signs.length / 2) + 2;
  for (let i = 0; i < count; i++) {
    for (const side of [-1, 1]) {
      const h = 3.5 + ((i * 7 + (side + 1) * 3) % 5) * 0.8;
      const mat = new THREE.MeshStandardMaterial({ color: palette[(i * 2 + side + 2) % palette.length], roughness: 0.85 });
      const winMat = new THREE.MeshStandardMaterial({ map: windowTex, color: 0xffffff, emissive: 0xffd28a, emissiveMap: windowTex, emissiveIntensity: 0.55 });
      // 朝街道的那一面貼窗戶貼圖
      const mats = side < 0 ? [winMat, mat, mat, mat, mat, mat] : [mat, winMat, mat, mat, mat, mat];
      const b = new THREE.Mesh(new THREE.BoxGeometry(3, h, 3.6), mats);
      b.position.set(side * 5, h / 2, -i * SPACING);
      scene.add(b);
      buildings.push(b);
    }
  }

  // 招牌
  const boards = [];
  signs.forEach((s, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    const len = [...s.jp].length;
    const vertical = !!s.vertical;
    const w = vertical ? 0.8 : Math.max(1.4, len * 0.62);
    const h = vertical ? Math.max(1.6, len * 0.7) : 0.85;
    const tex = textTexture(s.jp, {
      w: vertical ? 128 : 128 * Math.ceil(w / 0.7),
      h: vertical ? 128 * Math.ceil(h / 0.7) : 128,
      bg: s.color,
      fg: '#ffffff',
      vertical,
      border: 'rgba(255,255,255,0.65)',
    });
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.35 });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    board.position.set(side * 3.45, vertical ? 2.6 : 2.2 + (row % 2) * 0.5, -row * SPACING - 0.6);
    board.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    board.userData = { sign: s, glow: 0 };
    scene.add(board);
    boards.push(board);
  });

  // 紅燈籠點綴
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xd8382a, emissive: 0xff3b1f, emissiveIntensity: 0.8 });
  for (let i = 0; i < count; i += 2) {
    for (const side of [-1, 1]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), lanternMat);
      l.scale.y = 1.3;
      l.position.set(side * 3.3, 3.6, -i * SPACING - 2.2);
      scene.add(l);
    }
  }

  // ---- 相機控制 ----
  const maxZ = 4;
  const minZ = -(count - 2) * SPACING;
  const PITCH = -0.05;
  const view = { z: maxZ, targetZ: maxZ, yaw: 0, tYaw: 0 };
  let dirty = true; // 需要重畫
  let dragging = false;
  let dragMoved = 0;
  let last = { x: 0, y: 0 };
  let focusIdx = -1;
  const el = renderer.domElement;
  // 只攔截水平拖曳；垂直滑動讓頁面正常捲動
  el.style.touchAction = 'pan-y';

  const ray = new THREE.Raycaster();
  let hovered = null;
  const toNDC = (e) => {
    const r = el.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const hitBoard = (e) => {
    ray.setFromCamera(toNDC(e), camera);
    return ray.intersectObjects(boards)[0]?.object || null;
  };

  function move(dz) {
    view.targetZ = THREE.MathUtils.clamp(view.targetZ + dz, minZ, maxZ);
    dirty = true;
  }
  function turn(d) {
    view.tYaw = THREE.MathUtils.clamp(view.tYaw + d, -1.3, 1.3);
    dirty = true;
  }
  /** 走到第 i 個招牌前面並轉頭看它 */
  function focus(i) {
    focusIdx = (i + boards.length) % boards.length;
    const b = boards[focusIdx];
    const d = 2.6; // 站在招牌前方多遠
    view.targetZ = THREE.MathUtils.clamp(b.position.z + d, minZ, maxZ);
    view.tYaw = Math.atan2(-b.position.x, view.targetZ - b.position.z);
    b.userData.glow = 1;
    dirty = true;
    onPick?.(b.userData.sign);
  }

  const onDown = (e) => {
    dragging = true;
    dragMoved = 0;
    last = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e) => {
    if (dragging) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      turn(dx * 0.005);
      // 滑鼠上下拖曳＝前進後退（手機的上下滑動是捲動頁面）
      if (e.pointerType === 'mouse') move(dy * 0.03);
      last = { x: e.clientX, y: e.clientY };
    }
    if (e.pointerType === 'mouse') {
      const h = hitBoard(e);
      if (h !== hovered) {
        hovered = h;
        dirty = true;
      }
      el.style.cursor = hovered ? 'pointer' : dragging ? 'grabbing' : 'grab';
    }
  };
  const onUp = (e) => {
    if (dragging && dragMoved < 8) {
      const hit = hitBoard(e);
      if (hit) {
        hit.userData.glow = 1;
        focusIdx = boards.indexOf(hit);
        dirty = true;
        onPick?.(hit.userData.sign);
      }
    }
    dragging = false;
  };
  const onCancel = () => {
    // 瀏覽器接手捲動頁面時會送 pointercancel
    dragging = false;
  };
  const onWheel = (e) => {
    // 滾輪＝前進後退；走到街道盡頭時不攔截，讓頁面可以繼續捲動
    const before = view.targetZ;
    move(e.deltaY > 0 ? -1.5 : 1.5);
    if (view.targetZ !== before) e.preventDefault();
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  el.addEventListener('pointerleave', onCancel);
  el.addEventListener('wheel', onWheel, { passive: false });

  const vis = watchVisible(container);
  vis.onChange = (v) => v && (dirty = true);
  const stopResize = autoResize(container, renderer, camera, () => (dirty = true));
  const dir = new THREE.Vector3();
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    const dz = view.targetZ - view.z;
    const dy = view.tYaw - view.yaw;
    if (Math.abs(dz) > 0.001 || Math.abs(dy) > 0.0005) {
      view.z += dz * 0.1;
      view.yaw += dy * 0.15;
      dirty = true;
    }
    for (const b of boards) {
      const d = b.userData;
      if (d.glow > 0) {
        d.glow = Math.max(0, d.glow - 0.02);
        dirty = true;
      }
      b.material.emissiveIntensity = 0.35 + (b === hovered ? 0.35 : 0) + d.glow * 0.6;
    }
    // 沒有任何變化、或捲出畫面時就不重畫（手機上最省電、最順）
    if (!dirty || !vis.visible) return;
    dirty = false;
    camera.position.set(0, 1.7, view.z);
    dir.set(Math.sin(-view.yaw), Math.sin(PITCH), -Math.cos(view.yaw));
    camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);
    renderer.render(scene, camera);
  }
  tick();

  return {
    forward: () => move(-SPACING),
    back: () => move(SPACING),
    turnLeft: () => turn(0.5),
    turnRight: () => turn(-0.5),
    next: () => focus(focusIdx + 1),
    prev: () => focus(focusIdx < 0 ? boards.length - 1 : focusIdx - 1),
    dispose() {
      cancelAnimationFrame(raf);
      stopResize();
      vis.stop();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('pointerleave', onCancel);
      el.removeEventListener('wheel', onWheel);
      disposeScene(scene);
      renderer.dispose();
      el.remove();
    },
  };
}

function makeWindowTexture() {

  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 128, 256);
  for (let y = 16; y < 240; y += 40) {
    for (let x = 14; x < 120; x += 36) {
      g.fillStyle = Math.random() < 0.55 ? '#ffd9a0' : '#20232e';
      g.fillRect(x, y, 22, 24);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
