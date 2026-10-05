// 首頁 3D 場景：富士山、夕陽、飄落的櫻花、漂浮的假名方塊（點擊會發音）
import * as THREE from 'three';
import { textTexture, fontsReady, disposeScene, autoResize, makeRenderer, watchVisible, isTouchDevice } from './textTexture.js';

export async function createHero(container, { kana = [], onPick, reducedMotion = false } = {}) {
  await fontsReady(kana.map((k) => k.k + k.r).join(''));

  const renderer = makeRenderer(container, { alpha: true });
  const vis = watchVisible(container);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3d9c6, 14, 30);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.2, 12);
  const stopResize = autoResize(container, renderer, camera);
  // 寬螢幕時把場景往右移，避開左邊的標題文字
  const ringX = container.clientWidth / Math.max(container.clientHeight, 1) > 1.3 ? 2.6 : 0;

  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x7a5c8a, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(4, 6, 8);
  scene.add(sun);

  // 夕陽
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshBasicMaterial({ color: 0xe8553d, fog: false }));
  sunDisc.position.set(ringX ? 6 : 3.4, 2.4, -14);
  scene.add(sunDisc);

  // 富士山（低多邊形）
  const fuji = new THREE.Group();
  const mountain = new THREE.Mesh(new THREE.ConeGeometry(6, 4.4, 9, 1), new THREE.MeshStandardMaterial({ color: 0x4b5d8a, flatShading: true, roughness: 0.9 }));
  mountain.position.y = 2.2;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(6 * (1.5 / 4.4) * 1.02, 1.5, 9, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true }));
  cap.position.y = 4.4 - 0.75 + 0.01;
  fuji.add(mountain, cap);
  fuji.position.set(ringX ? 2 : -1.5, -3.2, -10);
  scene.add(fuji);

  // 漂浮的假名方塊
  const tiles = [];
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xc8402f, roughness: 0.6 });
  const geo = new THREE.BoxGeometry(1.15, 1.15, 0.18);
  kana.forEach((k, i) => {
    const tex = textTexture(k.k, { sub: k.r, bg: '#fffaf0', fg: '#1d1d1f', subColor: '#c8402f' });
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.35 });
    const mesh = new THREE.Mesh(geo, [sideMat, sideMat, sideMat, sideMat, face, face]);
    const angle = (i / kana.length) * Math.PI * 2;
    const radius = 4.2 + (i % 3) * 0.9;
    mesh.userData = {
      kana: k,
      base: new THREE.Vector3(ringX + Math.cos(angle) * radius * (ringX ? 0.8 : 1), 0.6 + Math.sin(i * 1.7) * 1.6, Math.sin(angle) * 1.6 - 1),
      phase: Math.random() * Math.PI * 2,
      spin: 0,
    };
    mesh.position.copy(mesh.userData.base);
    scene.add(mesh);
    tiles.push(mesh);
  });

  // 櫻花瓣（InstancedMesh）
  const PETALS = reducedMotion ? 40 : isTouchDevice() ? 90 : 160;
  const petalGeo = new THREE.PlaneGeometry(0.14, 0.09);
  const petalMat = new THREE.MeshBasicMaterial({ color: 0xf7b7c8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETALS);
  const pData = Array.from({ length: PETALS }, () => ({
    p: new THREE.Vector3((Math.random() - 0.5) * 22, Math.random() * 12 - 4, (Math.random() - 0.5) * 10),
    r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    v: 0.25 + Math.random() * 0.45,
    sway: Math.random() * Math.PI * 2,
  }));
  scene.add(petals);
  const dummy = new THREE.Object3D();

  // 互動：滑鼠視差 + 點擊方塊發音
  const mouse = new THREE.Vector2(0, 0);
  const ray = new THREE.Raycaster();
  let hovered = null;
  const toNDC = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const onMove = (e) => {
    const p = toNDC(e);
    mouse.copy(p);
    ray.setFromCamera(p, camera);
    hovered = ray.intersectObjects(tiles)[0]?.object || null;
    renderer.domElement.style.cursor = hovered ? 'pointer' : '';
  };
  const onClick = (e) => {
    ray.setFromCamera(toNDC(e), camera);
    const hit = ray.intersectObjects(tiles)[0]?.object;
    if (hit) {
      hit.userData.spin = Math.PI * 2;
      onPick?.(hit.userData.kana);
    }
  };
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('click', onClick);

  const clock = new THREE.Clock();
  let raf = 0;
  const speed = reducedMotion ? 0.25 : 1;
  function tick() {
    raf = requestAnimationFrame(tick);
    // 捲到下面看不到首頁動畫時就暫停，手機捲動才順
    if (!vis.visible) {
      clock.getDelta();
      return;
    }
    const dt = Math.min(clock.getDelta(), 0.05) * speed;
    const t = clock.elapsedTime * speed;

    camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04;
    camera.position.y += (1.2 + mouse.y * 0.8 - camera.position.y) * 0.04;
    // 直式螢幕（手機）把視線往下移，場景就會出現在畫面上半部，不擋到文字
    camera.lookAt(0, camera.aspect < 1 ? -3.2 : 0.8, 0);

    for (const m of tiles) {
      const d = m.userData;
      m.position.y = d.base.y + Math.sin(t * 0.9 + d.phase) * 0.25;
      m.rotation.y = Math.sin(t * 0.5 + d.phase) * 0.35;
      if (d.spin > 0) {
        const step = Math.min(d.spin, dt * 9);
        d.spin -= step;
        m.rotation.y += Math.PI * 2 - d.spin;
      }
      const target = m === hovered ? 1.18 : 1;
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * 0.15);
    }

    pData.forEach((d, i) => {
      d.p.y -= d.v * dt;
      d.p.x += Math.sin(t + d.sway) * 0.006;
      d.r.x += dt * 1.2;
      d.r.y += dt * 0.8;
      if (d.p.y < -5) {
        d.p.y = 7;
        d.p.x = (Math.random() - 0.5) * 22;
      }
      dummy.position.copy(d.p);
      dummy.rotation.copy(d.r);
      dummy.updateMatrix();
      petals.setMatrixAt(i, dummy.matrix);
    });
    petals.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }
  tick();

  return () => {
    cancelAnimationFrame(raf);
    stopResize();
    vis.stop();
    renderer.domElement.removeEventListener('pointermove', onMove);
    renderer.domElement.removeEventListener('click', onClick);
    disposeScene(scene);
    renderer.dispose();
    renderer.domElement.remove();
  };
}
