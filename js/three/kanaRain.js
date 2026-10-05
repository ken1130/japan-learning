// 假名雨小遊戲：假名從天空落下，輸入羅馬拼音把它打散；落到鳥居下就扣一條命
import * as THREE from 'three';
import { textTexture, fontsReady, disposeScene, autoResize, makeRenderer } from './textTexture.js';

const GROUND_Y = -3.6;

export async function createKanaRain(container, { onHit, onMiss, onOver } = {}) {
  // 遊戲中會出現所有假名
  await fontsReady([...Array(0x30f6 - 0x3041)].map((_, i) => String.fromCharCode(0x3041 + i)).join(''));

  const renderer = makeRenderer(container);

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  const stopResize = autoResize(container, renderer, camera);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const dl = new THREE.DirectionalLight(0xffffff, 1);
  dl.position.set(2, 4, 6);
  scene.add(dl);

  // 星星
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 40;
    starPos[i * 3 + 1] = Math.random() * 14 - 2;
    starPos[i * 3 + 2] = -10 - Math.random() * 10;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06 })));

  // 鳥居
  const torii = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xd03a26, roughness: 0.6 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const pillarGeo = new THREE.CylinderGeometry(0.18, 0.2, 3.2, 16);
  for (const x of [-1.6, 1.6]) {
    const p = new THREE.Mesh(pillarGeo, red);
    p.position.set(x, -1.6, 0);
    torii.add(p);
  }
  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.28, 0.4), black);
  kasagi.position.y = 0.2;
  const kasagi2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.25, 0.36), red);
  kasagi2.position.y = -0.05;
  const nuki = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.18, 0.25), red);
  nuki.position.y = -0.7;
  torii.add(kasagi, kasagi2, nuki);
  torii.scale.setScalar(1.3);
  // 柱子底部（local y = -3.2）剛好貼地
  torii.position.set(0, GROUND_Y - 0.4 + 3.2 * 1.3, -4);
  scene.add(torii);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshStandardMaterial({ color: 0x223322 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = GROUND_Y - 0.4;
  scene.add(ground);

  // 爆炸粒子
  const bursts = [];
  function burst(pos, color) {
    const n = 40;
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(n * 3);
    const vel = [];
    for (let i = 0; i < n; i++) {
      arr.set([pos.x, pos.y, pos.z], i * 3);
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.2) * 6, (Math.random() - 0.5) * 3));
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size: 0.16, transparent: true }));
    scene.add(pts);
    bursts.push({ pts, vel, life: 1 });
  }

  const texCache = new Map();
  const getTex = (k) => {
    if (!texCache.has(k)) texCache.set(k, textTexture(k, { w: 192, h: 192, bg: null, fg: '#ffffff' }));
    return texCache.get(k);
  };

  let drops = [];
  let pool = [];
  let running = false;
  let spawnTimer = 0;
  let elapsed = 0;
  let lives = 3;

  function spawn() {
    const item = pool[Math.floor(Math.random() * pool.length)];
    const mat = new THREE.SpriteMaterial({ map: getTex(item.k), transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    const s = item.k.length > 1 ? 1.5 : 1.15;
    sprite.scale.set(s, s, 1);
    // 光暈底
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshBasicMaterial({ color: 0xc8402f, transparent: true, opacity: 0.75 }));
    halo.position.z = -0.01;
    const group = new THREE.Group();
    group.add(halo, sprite);
    const halfW = camera.aspect * 4.2;
    group.position.set((Math.random() * 2 - 1) * Math.min(halfW - 0.8, 6), 5.5, 0);
    scene.add(group);
    drops.push({ group, item, speed: 0.6 + Math.min(elapsed / 60, 1.6) + Math.random() * 0.3, dying: 0 });
  }

  function removeDrop(d) {
    scene.remove(d.group);
    d.group.children.forEach((c) => {
      if (c.isMesh) c.geometry.dispose();
      c.material.dispose();
    });
  }

  const clock = new THREE.Clock();
  let raf = 0;
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (running) {
      elapsed += dt;
      spawnTimer -= dt;
      const interval = Math.max(0.9, 2.4 - elapsed / 30);
      if (spawnTimer <= 0 && drops.filter((d) => !d.dying).length < 8) {
        spawn();
        spawnTimer = interval;
      }
    }
    for (const d of drops) {
      if (d.dying) {
        d.dying += dt * 4;
        d.group.scale.setScalar(1 + d.dying);
        d.group.children.forEach((c) => (c.material.opacity = Math.max(0, 1 - d.dying)));
        continue;
      }
      if (!running) continue;
      d.group.position.y -= d.speed * dt;
      d.group.rotation.z = Math.sin(elapsed * 2 + d.group.position.x) * 0.08;
      if (d.group.position.y < GROUND_Y) {
        d.dying = 0.01;
        d.missed = true;
        burst(d.group.position, 0x777777);
        lives--;
        onMiss?.(d.item, lives);
        if (lives <= 0) {
          running = false;
          onOver?.();
        }
      }
    }
    drops = drops.filter((d) => {
      if (d.dying >= 1) {
        removeDrop(d);
        return false;
      }
      return true;
    });
    for (const b of bursts) {
      b.life -= dt * 1.4;
      const arr = b.pts.geometry.attributes.position.array;
      b.vel.forEach((v, i) => {
        v.y -= 9 * dt;
        arr[i * 3] += v.x * dt;
        arr[i * 3 + 1] += v.y * dt;
        arr[i * 3 + 2] += v.z * dt;
      });
      b.pts.geometry.attributes.position.needsUpdate = true;
      b.pts.material.opacity = Math.max(0, b.life);
    }
    for (const b of bursts.filter((b) => b.life <= 0)) {
      scene.remove(b.pts);
      b.pts.geometry.dispose();
      b.pts.material.dispose();
    }
    for (let i = bursts.length - 1; i >= 0; i--) if (bursts[i].life <= 0) bursts.splice(i, 1);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  return {
    start(items) {
      drops.forEach(removeDrop);
      drops = [];
      pool = items;
      lives = 3;
      elapsed = 0;
      spawnTimer = 0;
      running = true;
    },
    stop() {
      running = false;
    },
    /** 輸入答案；打中最低（最危險）的那個。回傳打中的 item 或 null */
    tryAnswer(text) {
      const ans = text.trim().toLowerCase();
      if (!ans) return null;
      const target = drops
        .filter((d) => !d.dying && d.item.answers.includes(ans))
        .sort((a, b) => a.group.position.y - b.group.position.y)[0];
      if (!target) return null;
      target.dying = 0.01;
      burst(target.group.position, 0xffc2d1);
      onHit?.(target.item);
      return target.item;
    },
    dispose() {
      cancelAnimationFrame(raf);
      stopResize();
      drops.forEach(removeDrop);
      texCache.forEach((t) => t.dispose());
      disposeScene(scene);
      scene.background?.dispose?.();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#0d1033');
  grad.addColorStop(0.6, '#3b2a5c');
  grad.addColorStop(1, '#c8604a');
  g.fillStyle = grad;
  g.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
