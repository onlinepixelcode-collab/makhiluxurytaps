/* ==========================================================================
   MAKHI — catalogue3d.js
   A real 3D book on a marble desk: page-curl turning, props, shop-this-spread.
   ========================================================================== */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { metalMaterial, studioEnv } from "./tap3d.js?v=14";

const W = 2.1, H = 2.97, SEG = 36, T = 0.0045;   // page size (A4 ratio) + paper thickness

function boot() {
  const M = window.Makhi, gsap = window.gsap;
  const root = document.getElementById("book3d"); if (!root) return;
  const canvas = root.querySelector("canvas");
  const manifest = JSON.parse(root.dataset.manifest || "[]");
  const pagesUrl = root.dataset.pages;
  const N = manifest.length, LEAVES = N / 2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0c);
  scene.environment = studioEnv(renderer);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // lighting: a warm key from top-left (long soft shadows), cool fill
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x1a1712, 0.45));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.75);
  key.position.set(-5, 9, 4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 1, far: 30 });
  scene.add(key);
  const rim = new THREE.PointLight(0xffd9a0, 6, 14, 2); rim.position.set(4, 3, -3); scene.add(rim);

  // desk: black marble
  const marble = loader.load(root.dataset.marble, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  marble.wrapS = marble.wrapT = THREE.RepeatWrapping; marble.repeat.set(2.2, 2.2); marble.anisotropy = maxAniso;
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), new THREE.MeshPhysicalMaterial({ map: marble, color: 0x8a8a8a, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.35 }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  /* ---------------- book ---------------- */
  const book = new THREE.Group(); scene.add(book);
  const paperSide = new THREE.MeshStandardMaterial({ color: 0xf1ede4, roughness: 0.9 });
  // page blocks (paper edge thickness) for each stack
  const blockR = new THREE.Mesh(new THREE.BoxGeometry(W, 1, H), paperSide); blockR.castShadow = blockR.receiveShadow = true;
  const blockL = blockR.clone(); book.add(blockR, blockL);
  // hard cover boards (onyx with a gold edge) slightly larger than the pages
  const boardMat = new THREE.MeshPhysicalMaterial({ color: 0x0e0e10, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.5 });
  const backBoard = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.028, H + 0.08), boardMat);
  backBoard.castShadow = backBoard.receiveShadow = true; book.add(backBoard);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, H + 0.08), boardMat); book.add(spine);

  const leaves = [];
  const pageTex = [];
  let loaded = 0;
  const prog = root.querySelector(".book3d__load b");
  for (let i = 0; i < N; i++) {
    const t = loader.load(`${pagesUrl}p${String(i).padStart(2, "0")}.webp`, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = maxAniso; loaded++; if (prog) prog.textContent = Math.round(loaded / N * 100); if (loaded === N) root.classList.add("is-ready"); });
    pageTex.push(t);
  }
  for (let l = 0; l < LEAVES; l++) {
    const geo = new THREE.PlaneGeometry(W, H, SEG, 1);
    geo.rotateX(-Math.PI / 2); geo.translate(W / 2, 0, 0);       // spine at x = 0, page lies on +x
    const base = geo.attributes.position.array.slice();            // flat positions
    const front = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: pageTex[l * 2], roughness: 0.92, envMapIntensity: 0.25, side: THREE.FrontSide }));
    const backTex = pageTex[l * 2 + 1].clone ? pageTex[l * 2 + 1] : pageTex[l * 2 + 1];
    const back = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.92, envMapIntensity: 0.25, side: THREE.BackSide }));
    // back face shows the reverse page mirrored correctly
    back.material.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\n#ifdef USE_MAP\n vMapUv.x = 1.0 - vMapUv.x;\n#endif"); };
    front.castShadow = back.castShadow = true; front.receiveShadow = back.receiveShadow = true;
    const g = new THREE.Group(); g.add(front, back); book.add(g);
    if (l === 0 || l === LEAVES - 1) { front.material.roughness = 0.45; back.material.roughness = 0.7; }
    leaves.push({ g, geo, base, r: 0, lift: 0 });
  }

  // curl: walk along the page from the spine accumulating a bending angle
  function shape(leaf) {
    const { geo, r } = leaf;
    const pos = geo.attributes.position;
    const theta = Math.PI * r;
    const bend = Math.sin(Math.PI * Math.min(1, r)) * 0.9;     // most curl mid-turn
    const dir = leaf.dir || 1;                                 // outer edge lags behind the turn
    const ds = W / SEG;
    let x = 0, y = 0;
    for (let j = 0; j <= SEG; j++) {
      pos.setX(j, x); pos.setY(j, y); pos.setX(j + SEG + 1, x); pos.setY(j + SEG + 1, y);
      const u = (j + 0.5) / SEG;
      const a = Math.min(Math.PI, Math.max(0, theta - dir * bend * Math.pow(u, 1.5)));
      x += ds * Math.cos(a); y += ds * Math.sin(a);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
  }

  let current = 0;  // number of leaves turned to the left
  const busy = new Set();
  function layout() {
    // stack heights: turned leaves stack on the left, others on the right
    leaves.forEach((lf, i) => {
      const leftCount = leaves.filter((x) => x.r >= 0.999).length;
      const rightIndex = i - current, leftIndex = current - 1 - i;
      const yR = 0.032 + (LEAVES - 1 - i) * T;      // right stack: first leaf on top
      const yL = 0.032 + i * T;                      // left stack: last turned on top
      lf.g.position.y = THREE.MathUtils.lerp(yR, yL, lf.r) + Math.sin(Math.PI * lf.r) * 0.02;
      void leftCount; void rightIndex; void leftIndex;
    });
    const rightN = LEAVES - current, leftN = current;
    blockR.scale.y = Math.max(0.0001, rightN * T); blockR.position.set(W / 2, 0.03 + rightN * T / 2 - T * 1.8, 0); blockR.visible = rightN > 0;
    blockL.scale.y = Math.max(0.0001, leftN * T); blockL.position.set(-W / 2, 0.03 + leftN * T / 2 - T * 1.8, 0); blockL.visible = leftN > 0;
    // back board under whichever side holds the back cover
    const closedBack = current === LEAVES;
    backBoard.position.set(closedBack ? -W / 2 : W / 2, 0.014, 0);
    spine.position.set(0, 0.05, 0);
  }
  // book group slides so a closed book sits centred, an open book is centred on the spine
  function centreTarget() { return current === 0 ? -W / 2 : current === LEAVES ? W / 2 : 0; }

  leaves.forEach(shape); layout(); book.position.x = centreTarget();

  function turn(dir) {
    if (dir > 0 && current >= LEAVES) return;
    if (dir < 0 && current <= 0) return;
    const idx = dir > 0 ? current : current - 1;
    const lf = leaves[idx];
    lf.dir = dir;
    current += dir;
    busy.add(idx);
    M.sound && M.sound.drip(0.35);
    gsap.to(lf, { r: dir > 0 ? 1 : 0, lift: 0, duration: 1.15, ease: "power2.inOut", onUpdate: () => { shape(lf); layout(); }, onComplete: () => { busy.delete(idx); shape(lf); layout(); } });
    gsap.to(book.position, { x: centreTarget(), duration: 1.1, ease: "power2.inOut" });
    updateUI();
    M.track && M.track("catalogue_turn", { spread: current });
  }

  /* ---------------- props ---------------- */
  const props = new THREE.Group(); scene.add(props);
  // espresso
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf6f3ee, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const saucer = new THREE.Mesh(new THREE.LatheGeometry([0, 0.36, 0.42, 0.46, 0.47].map((r, i) => new THREE.Vector2(r, [0, 0.005, 0.02, 0.045, 0.05][i])), 64), ceramic);
  const cupProf = [[0.0, 0.05], [0.16, 0.05], [0.22, 0.12], [0.25, 0.3], [0.25, 0.34], [0.235, 0.34], [0.232, 0.31], [0.0, 0.31]].map(([r, y]) => new THREE.Vector2(r, y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupProf, 64), ceramic);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 32, Math.PI * 1.25), ceramic); handle.position.set(0.27, 0.22, 0); handle.rotation.z = -Math.PI * 0.62;
  const latte = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, "#c89a6a"); g.addColorStop(0.55, "#8a5a33"); g.addColorStop(1, "#3b2414"); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "rgba(248,236,220,.92)"; x.beginPath(); x.moveTo(128, 196); x.bezierCurveTo(40, 130, 70, 60, 128, 102); x.bezierCurveTo(186, 60, 216, 130, 128, 196); x.fill();
    x.strokeStyle = "rgba(138,90,51,.9)"; x.lineWidth = 6; x.beginPath(); x.moveTo(128, 110); x.lineTo(128, 190); x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.228, 48), new THREE.MeshPhysicalMaterial({ map: latte, roughness: 0.35, clearcoat: 0.6 }));
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.305;
  const espresso = new THREE.Group(); espresso.add(saucer, cup, handle, coffee); espresso.position.set(-3.35, 0, -1.25); espresso.rotation.y = 0.6;
  espresso.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  props.add(espresso);
  // fountain pen: black lacquer barrel, gold cap bands + clip
  const gold = metalMaterial("gold"); gold.roughness = 0.22;
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x08080a, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 });
  const pen = new THREE.Group();
  const barrel = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 1.25, 8, 32), lacquer); barrel.rotation.z = Math.PI / 2; pen.add(barrel);
  [-0.42, -0.2, 0.55].forEach((x, i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, i === 1 ? 0.05 : 0.025, 32), gold); b.rotation.z = Math.PI / 2; b.position.x = x; pen.add(b); });
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 24), gold); nib.rotation.z = Math.PI / 2; nib.position.x = 0.76; pen.add(nib);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.022), gold); clip.position.set(-0.6, 0.065, 0); pen.add(clip);
  pen.position.set(3.0, 0.056, 0.75); pen.rotation.y = 0.5;
  pen.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  props.add(pen);
  // finish chips (the five real Makhi finishes) fanned out
  const chips = new THREE.Group();
  ["gold", "black", "silver", "chrome", "stainless"].forEach((f, i) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.035, 0.95, 4, 0.03), metalMaterial(f));
    m.position.set(i * 0.05, 0.02 + i * 0.036, 0); m.rotation.y = -0.18 * i; m.castShadow = m.receiveShadow = true; chips.add(m);
  });
  chips.position.set(2.95, 0, -1.15); chips.rotation.y = 0.35; props.add(chips);
  // Makhi business card with the logo
  const cardTex = (() => { const c = document.createElement("canvas"); c.width = 700; c.height = 400; const x = c.getContext("2d");
    x.fillStyle = "#0d0d0f"; x.fillRect(0, 0, 700, 400); x.strokeStyle = "rgba(200,164,93,.7)"; x.lineWidth = 2; x.strokeRect(18, 18, 664, 364);
    const p = new Path2D(root.dataset.drop || ""); x.save(); x.translate(230, 130); x.scale(1.2, 1.2); x.fillStyle = "#E2C98A"; x.fill(p, "evenodd"); x.restore();
    x.fillStyle = "#F4F1EA"; x.font = "500 64px Syne, sans-serif"; x.textBaseline = "middle"; x.fillText("MAKHI", 350, 190);
    x.font = "600 15px Syne, sans-serif"; x.fillStyle = "#C8A45D"; x.fillText("LUXURY TAPS", 354, 240);
    x.fillStyle = "#8a8a90"; x.font = "500 16px Manrope, sans-serif"; x.fillText("makhiluxurytaps.co.za  ·  +27 68 146 5775", 160, 330);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; })();
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.012, 0.8), [boardMat, boardMat, new THREE.MeshPhysicalMaterial({ map: cardTex, roughness: 0.6, clearcoat: 0.3 }), boardMat, boardMat, boardMat]);
  card.position.set(-3.45, 0.008, 0.35); card.rotation.y = -0.22; card.castShadow = card.receiveShadow = true; props.add(card);

  /* ---------------- camera, resize, loop ---------------- */
  const look = new THREE.Vector3(0, 0, 0.15);
  let camDist = 9.6;
  function resize() {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // keep the open spread (+ props on wide screens) in frame
    const need = w / h < 1 ? 2 * W * 1.15 : 2 * W * 2.15;
    const fovH = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect);
    camDist = Math.max(w / h < 1 ? 6.2 : 8.4, (need / 2) / Math.tan(fovH / 2));
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  root.addEventListener("pointermove", (e) => { const r = root.getBoundingClientRect(); mouse.x = (e.clientX - r.left) / r.width - 0.5; mouse.y = (e.clientY - r.top) / r.height - 0.5; });
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(root);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop); if (!visible) return;
    const t = clock.getElapsedTime();
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    camera.position.set(mouse.sx * 0.9, camDist * 0.93 - mouse.sy * 0.4, camDist * 0.36 + mouse.sy * 0.6);
    camera.lookAt(look);
    rim.intensity = 6 + Math.sin(t * 0.7) * 0.6;
    renderer.render(scene, camera);
  })();

  /* ---------------- interaction ---------------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 40) { turn(dx < 0 ? 1 : -1); down = null; return; }
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(book.children, true)[0];
    if (hit) { const lx = hit.point.x - book.position.x; turn(lx >= 0 ? 1 : -1); }
    down = null;
  });
  // hover: lift the corner of the next page a little
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(book.children, true)[0];
    const next = leaves[current];
    const want = hit && hit.point.x - book.position.x > W * 0.55 ? 0.035 : 0;
    root.dataset.cursor = hit ? (hit.point.x - book.position.x >= 0 ? "NEXT" : "BACK") : "DRAG";
    if (next && !busy.has(current) && next.r !== want) { next.dir = 1; gsap.to(next, { r: want, duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: () => shape(next) }); }
  });
  root.querySelector("[data-book=next]").addEventListener("click", () => turn(1));
  root.querySelector("[data-book=prev]").addEventListener("click", () => turn(-1));
  root.querySelector("[data-book=first]").addEventListener("click", () => { const go = () => { if (current > 0) { turn(-1); setTimeout(go, 130); } }; go(); });
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") turn(1); if (e.key === "ArrowLeft") turn(-1); });

  // UI: counter + shop this spread
  const counter = root.querySelector(".book3d__count"), shopList = document.querySelector(".spread__list"), shopWrap = document.querySelector(".spread");
  function updateUI() {
    const l = current * 2 - 1, r = current * 2;
    counter.textContent = current === 0 ? "Cover" : current === LEAVES ? "Back cover" : `${String(l + 1).padStart(2, "0")}–${String(r + 1).padStart(2, "0")} / ${N}`;
    const slugs = [...(manifest[l]?.slugs || []), ...(manifest[r]?.slugs || [])];
    const ps = slugs.map((s) => M.bySlug.get(s)).filter(Boolean);
    if (shopWrap) shopWrap.classList.toggle("is-on", ps.length > 0);
    if (shopList) shopList.innerHTML = ps.map((p) => `<a class="spread__item" href="${M.purl(p)}"><span class="tile"><img src="${M.pimg(p)}" alt=""></span><span><b>${M.esc(p.type === "combo" ? p.title : p.name)}</b>${M.fmt(p.price)}</span>${p.stock ? `<button data-add="${p.id}" aria-label="Add ${M.esc(p.name)} to cart">+</button>` : ""}</a>`).join("");
    root.querySelector("[data-book=prev]").disabled = current === 0;
    root.querySelector("[data-book=next]").disabled = current === LEAVES;
  }
  updateUI();
  // open the cover after load for drama
  const opened = () => setTimeout(() => { if (current === 0) turn(1); }, 900);
  if (root.classList.contains("is-ready")) opened(); else new MutationObserver((m, o) => { if (root.classList.contains("is-ready")) { o.disconnect(); opened(); } }).observe(root, { attributes: true });
  M.track && M.track("catalogue_open");
}

const wait = () => (window.Makhi && window.Makhi.ready && window.gsap ? window.Makhi.ready.then(boot) : setTimeout(wait, 50));
wait();
