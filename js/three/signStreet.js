// 3D 日本街景：兩排建築上掛著招牌，拖曳轉頭、滾輪/按鈕前進後退，點招牌看意思
import * as THREE from 'three';
import { textTexture, fontsReady, disposeScene, autoResize } from './textTexture.js';

export async function createSignStreet(container, { signs, onPick }) {
  await fontsReady();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b2140);
  scene.fog = new THREE.Fog(0x1b2140, 10, 34);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  const stopResize = autoResize(container, renderer, camera);

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
  const view = { z: maxZ, targetZ: maxZ, yaw: 0, pitch: -0.05 };
  let dragging = false;
  let dragMoved = 0;
  let last = { x: 0, y: 0 };
  const el = renderer.domElement;
  el.style.touchAction = 'none';

  const ray = new THREE.Raycaster();
  let hovered = null;
  const toNDC = (e) => {
    const r = el.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };

  const onDown = (e) => {
    dragging = true;
    dragMoved = 0;
    last = { x: e.clientX, y: e.clientY };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (dragging) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      view.yaw = THREE.MathUtils.clamp(view.yaw + dx * 0.005, -1.2, 1.2);
      view.pitch = THREE.MathUtils.clamp(view.pitch + dy * 0.003, -0.4, 0.4);
      last = { x: e.clientX, y: e.clientY };
    }
    ray.setFromCamera(toNDC(e), camera);
    hovered = ray.intersectObjects(boards)[0]?.object || null;
    el.style.cursor = hovered ? 'pointer' : dragging ? 'grabbing' : 'grab';
  };
  const onUp = (e) => {
    dragging = false;
    if (dragMoved < 6) {
      ray.setFromCamera(toNDC(e), camera);
      const hit = ray.intersectObjects(boards)[0]?.object;
      if (hit) {
        hit.userData.glow = 1;
        onPick?.(hit.userData.sign);
      }
    }
  };
  const onWheel = (e) => {
    e.preventDefault();
    move(e.deltaY > 0 ? -1.5 : 1.5);
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('wheel', onWheel, { passive: false });

  function move(dz) {
    view.targetZ = THREE.MathUtils.clamp(view.targetZ + dz, minZ, maxZ);
  }

  const clock = new THREE.Clock();
  let raf = 0;
  function tick() {
    const t = clock.getElapsedTime();
    view.z += (view.targetZ - view.z) * 0.08;
    camera.position.set(0, 1.7 + Math.sin(t * 2) * 0.01, view.z);
    const dir = new THREE.Vector3(Math.sin(-view.yaw), Math.sin(view.pitch), -Math.cos(view.yaw));
    camera.lookAt(camera.position.clone().add(dir));

    for (const b of boards) {
      const d = b.userData;
      d.glow = Math.max(0, d.glow - 0.02);
      b.material.emissiveIntensity = 0.35 + (b === hovered ? 0.35 : 0) + d.glow * 0.6;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  return {
    forward: () => move(-SPACING),
    back: () => move(SPACING),
    dispose() {
      cancelAnimationFrame(raf);
      stopResize();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
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
