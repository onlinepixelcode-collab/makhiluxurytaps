/* ==========================================================================
   MAKHI — tap3d.js
   Procedural Swan basin mixer (Three.js) + water.
   - initDrop(): "The Drop" scroll-driven hero
   - initFinishStage(): live finish switcher
   ========================================================================== */
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";

export const FINISH_MAT = {
  gold:      { color: 0xDDB672, metalness: 1, roughness: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.3, env: 1.45, aniso: 0.55 },
  black:     { color: 0x151516, metalness: 0.55, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.5, env: 0.9, aniso: 0 },
  silver:    { color: 0xCDD1D6, metalness: 1, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.25, env: 1.0, aniso: 0 },
  chrome:    { color: 0xE6EAEE, metalness: 1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, env: 1.15, aniso: 0 },
  stainless: { color: 0xBCC0C5, metalness: 1, roughness: 0.36, clearcoat: 0, clearcoatRoughness: 0.4, env: 1.0, aniso: 0.75 }
};

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- metal material ---------- */
export function metalMaterial(finish = "gold") {
  const f = FINISH_MAT[finish];
  const m = new THREE.MeshPhysicalMaterial({
    color: f.color, metalness: f.metalness, roughness: f.roughness,
    clearcoat: f.clearcoat, clearcoatRoughness: f.clearcoatRoughness, envMapIntensity: f.env
  });
  if ("anisotropy" in m) m.anisotropy = f.aniso;
  return m;
}
export function tweenFinish(mat, finish, gsap, dur = 1.1) {
  const f = FINISH_MAT[finish]; const c = new THREE.Color(f.color);
  const o = { r: mat.color.r, g: mat.color.g, b: mat.color.b, m: mat.metalness, ro: mat.roughness, cc: mat.clearcoat, e: mat.envMapIntensity, a: mat.anisotropy || 0 };
  // brief "liquid" overshoot: shine up then settle
  const tl = gsap.timeline();
  tl.to(o, { ro: 0.02, e: 2.2, duration: dur * 0.35, ease: "power2.out", onUpdate: apply })
    .to(o, { r: c.r, g: c.g, b: c.b, m: f.metalness, cc: f.clearcoat, a: f.aniso, duration: dur * 0.6, ease: "power2.inOut", onUpdate: apply }, dur * 0.15)
    .to(o, { ro: f.roughness, e: f.env, duration: dur * 0.65, ease: "power3.out", onUpdate: apply }, dur * 0.4);
  function apply() { mat.color.setRGB(o.r, o.g, o.b); mat.metalness = o.m; mat.roughness = o.ro; mat.clearcoat = o.cc; mat.envMapIntensity = o.e; if ("anisotropy" in mat) mat.anisotropy = o.a; }
  return tl;
}

/* ---------- Swan mixer geometry ---------- */
export function buildSwan(mat) {
  const g = new THREE.Group();
  const seg = 96;
  // Proportions measured from the Makhi Swan Tall product photography (1 unit ≈ 279 px of the 920 px photo height)
  const r = 0.183;          // body radius
  const Ht = 1.48;          // body height (flat top, no base flange)
  const nx = -0.115;        // neck rises from the BACK edge of the top face
  const neckR = 0.039;      // neck tube radius
  const cy = 2.655;         // where the vertical neck turns into the arc
  const R = 0.656;          // semicircular arc radius
  // body: plain cylinder, crisp micro-bevels, fine groove just below the top
  const bodyProf = [
    new THREE.Vector2(0, 0), new THREE.Vector2(r - 0.004, 0), new THREE.Vector2(r, 0.004),
    new THREE.Vector2(r, Ht - 0.096), new THREE.Vector2(r - 0.0035, Ht - 0.092), new THREE.Vector2(r, Ht - 0.088),
    new THREE.Vector2(r, Ht - 0.004), new THREE.Vector2(r - 0.004, Ht), new THREE.Vector2(0, Ht)
  ];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(bodyProf, seg), mat));
  // gooseneck: straight riser + true semicircle (dense samples → smooth tube)
  const pts = [];
  for (let i = 0; i <= 24; i++) pts.push(new THREE.Vector3(nx, (Ht - 0.03) + (cy - (Ht - 0.03)) * (i / 24), 0));
  for (let i = 1; i <= 140; i++) { const th = Math.PI - Math.PI * (i / 140); pts.push(new THREE.Vector3(nx + R + R * Math.cos(th), cy + R * Math.sin(th), 0)); }
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 320, neckR, 40, false), mat));
  // teardrop spout: tube tapers, then swells into the drop with a near-hemispherical tip
  const L = 0.545, ex = nx + 2 * R;
  const dropProf = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    let rr;
    if (t < 0.28) { const u = t / 0.28; rr = neckR + (0.029 - neckR) * (u * u * (3 - 2 * u)); }
    else if (t < 0.82) { const u = (t - 0.28) / 0.54; const sm = u * u * (3 - 2 * u); rr = 0.029 + 0.073 * Math.pow(sm, 0.85); }
    else { const u = (t - 0.82) / 0.18; rr = 0.102 * Math.sqrt(Math.max(0, 1 - u * u)); }
    dropProf.push(new THREE.Vector2(Math.max(0.0001, rr), -t * L));
  }
  dropProf.reverse();
  const head = new THREE.Mesh(new THREE.LatheGeometry(dropProf, seg), mat);
  head.position.set(ex, cy, 0); head.rotation.z = 0.07;
  g.add(head);
  const tip = new THREE.Vector3(ex + Math.sin(0.07) * L, cy - Math.cos(0.07) * L, 0);
  // lever: short vertical stub from the top face (spout side), then a slim rod rising ~40° toward the spout
  const leverBase = new THREE.Group(); leverBase.position.set(0.07, Ht, 0); g.add(leverBase);
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.022, 0.06, 32), mat); stub.position.y = 0.03; leverBase.add(stub);
  const pivot = new THREE.Group(); pivot.position.y = 0.055; leverBase.add(pivot);
  const knee = new THREE.Mesh(new THREE.SphereGeometry(0.019, 24, 16), mat); pivot.add(knee);
  const ang = THREE.MathUtils.degToRad(40), len = 0.53;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.016, len, 32), mat);
  rod.position.set(Math.cos(ang) * len / 2, Math.sin(ang) * len / 2, 0); rod.rotation.z = -(Math.PI / 2 - ang);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.021, 24, 16), mat); cap.position.set(Math.cos(ang) * len, Math.sin(ang) * len, 0);
  pivot.add(rod, cap);
  g.userData = { lever: pivot, tip, height: cy + R };
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}


/* ---------- Andy pull-out kitchen faucet (measured from the Makhi product photo) ---------- */
export function buildAndy(mat) {
  const g = new THREE.Group();
  const seg = 72;
  const hoseMat = new THREE.MeshPhysicalMaterial({ color: 0x0d0d0e, roughness: 0.58, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.6, sheen: 0.4, sheenRoughness: 0.6, envMapIntensity: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.45, metalness: 0.3 });
  // body: chrome cylinder, slight foot bevel
  const rb = 0.141, hb = 0.636;
  const bodyProf = [new THREE.Vector2(0, 0), new THREE.Vector2(rb - 0.012, 0), new THREE.Vector2(rb, 0.012), new THREE.Vector2(rb, hb), new THREE.Vector2(rb - 0.006, hb + 0.006), new THREE.Vector2(0, hb + 0.006)];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(bodyProf, seg), mat));
  // neck: tapers from body to hose collar (slightly offset)
  const neckProf = [new THREE.Vector2(0, 0), new THREE.Vector2(0.118, 0), new THREE.Vector2(0.112, 0.18), new THREE.Vector2(0.098, 0.38), new THREE.Vector2(0.094, 0.45), new THREE.Vector2(0, 0.45)];
  const neck = new THREE.Mesh(new THREE.LatheGeometry(neckProf, seg), mat); neck.position.set(0.04, hb, 0); g.add(neck);
  // black silicone hose: rises then arcs over to the spray head
  const hosePts = [[0.047, 1.03], [0.07, 1.6], [0.094, 2.26], [0.07, 2.75], [-0.1, 3.12], [-0.52, 3.3], [-0.9, 3.13], [-1.1, 2.82], [-1.155, 2.54]].map(([x, y]) => new THREE.Vector3(x, y, 0));
  const hoseCurve = new THREE.CatmullRomCurve3(hosePts, false, "centripetal");
  g.add(new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 260, 0.085, 36, false), hoseMat));
  // rigid holder arm (tapers) from the neck to the spray-head dock
  const armPts = [[-0.06, 0.82], [-0.198, 1.32], [-0.401, 1.74], [-0.707, 2.07], [-1.02, 2.24]].map(([x, y]) => new THREE.Vector3(x, y, 0));
  const armCurve = new THREE.CatmullRomCurve3(armPts, false, "centripetal");
  const armGeo = new THREE.TubeGeometry(armCurve, 160, 0.045, 24, false);
  { // taper radius toward the dock
    const pos = armGeo.attributes.position, tmp = new THREE.Vector3(), c = new THREE.Vector3();
    const rings = 161, per = 25;
    for (let i = 0; i < rings; i++) { const t = i / (rings - 1); armCurve.getPointAt(Math.min(1, t), c); const k = 1 - 0.3 * t;
      for (let j = 0; j < per; j++) { const idx = i * per + j; tmp.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c); pos.setXYZ(idx, tmp.x, tmp.y, tmp.z); } }
    pos.needsUpdate = true; armGeo.computeVertexNormals();
  }
  g.add(new THREE.Mesh(armGeo, mat));
  // spray head: tilted tapered cylinder with black collar band and dark aerator face
  const head = new THREE.Group();
  const L = 1.21;
  const headProf = [new THREE.Vector2(0.0001, 0), new THREE.Vector2(0.15, 0), new THREE.Vector2(0.158, 0.02), new THREE.Vector2(0.165, L * 0.62), new THREE.Vector2(0.168, L * 0.8), new THREE.Vector2(0.165, L - 0.02), new THREE.Vector2(0.12, L), new THREE.Vector2(0.0001, L)];
  head.add(new THREE.Mesh(new THREE.LatheGeometry(headProf, seg), mat));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.171, 0.171, 0.07, seg, 1, true), darkMat); band.position.y = L * 0.83; head.add(band);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.12, 48), darkMat); face.rotation.x = Math.PI / 2; face.position.y = -0.001; head.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.008, 8, 60), mat); ring.rotation.x = Math.PI / 2; head.add(ring);
  const btn = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.09), darkMat); btn.position.set(-0.165, L * 0.45, 0); head.add(btn);
  const tilt = Math.atan2(0.132, 1.204);
  head.position.set(-1.296, 1.296, 0); head.rotation.z = -tilt;
  g.add(head);
  // side handle: large cylinder on the body, slim vertical lever
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, seg), mat);
  hub.rotation.z = Math.PI / 2; hub.position.set(0.33, 0.354, 0); g.add(hub);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.18, seg), mat); cap.rotation.y = Math.PI / 2; cap.position.set(0.531, 0.354, 0); g.add(cap);
  const pivot = new THREE.Group(); pivot.position.set(0.41, 0.354, 0); g.add(pivot);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.62, 24), mat); rod.position.y = 0.17 + 0.31; pivot.add(rod);
  const rodCap = new THREE.Mesh(new THREE.SphereGeometry(0.026, 20, 14), mat); rodCap.position.y = 0.17 + 0.62; pivot.add(rodCap);
  g.userData = { lever: pivot, leverAxis: "x", tip: new THREE.Vector3(-1.296, 1.296, 0), height: 3.38 };
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

/* ---------- water reflector shader ---------- */
const RippleShader = {
  name: "RippleReflector",
  uniforms: {
    color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
    uT: { value: 0 }, uFlow: { value: 0 }, uTime: { value: 0 }, uC: { value: new THREE.Vector2() }, uCam: { value: new THREE.Vector3() }, uFade: { value: 9.0 }
  },
  vertexShader: /* glsl */`
    uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vUv = textureMatrix * vec4(position,1.0); vW = (modelMatrix*vec4(position,1.0)).xyz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 color; uniform sampler2D tDiffuse; varying vec4 vUv; varying vec3 vW;
    uniform float uT, uFlow, uTime, uFade; uniform vec2 uC; uniform vec3 uCam;
    #include <logdepthbuf_pars_fragment>
    float H(vec2 p){
      float d = distance(p, uC); float h = 0.0;
      for (int i = 0; i < 4; i++){
        float fi = float(i);
        float R = uT*1.25 - fi*0.28;
        if (R > 0.0){ float x = d - R; h += sin(x*24.0) * exp(-x*x*22.0) * exp(-uT*0.42) * 0.055 * (1.0 - fi*0.2); }
      }
      h += sin(d*30.0 - uTime*8.0) * exp(-d*1.4) * 0.011 * uFlow;
      h += sin(p.x*2.3 + uTime*0.55) * sin(p.y*2.9 - uTime*0.45) * 0.0035;
      return h;
    }
    void main(){
      #include <logdepthbuf_fragment>
      vec2 p = vW.xz; float e = 0.012;
      vec3 n = normalize(vec3(H(p-vec2(e,0.0))-H(p+vec2(e,0.0)), 2.0*e, H(p-vec2(0.0,e))-H(p+vec2(0.0,e))));
      vec3 v = normalize(uCam - vW);
      float fr = pow(1.0 - max(dot(n, v), 0.0), 4.0);
      vec4 uv = vUv; uv.xy += n.xz * 0.9 * uv.w;
      vec3 refl = texture2DProj(tDiffuse, uv).rgb;
      vec3 deep = vec3(0.006, 0.006, 0.008);
      vec3 l = normalize(vec3(-0.5, 1.0, 0.7)); vec3 hv = normalize(l + v);
      float spec = pow(max(dot(n, hv), 0.0), 260.0) * 1.6;
      vec3 l2 = normalize(vec3(0.8, 0.6, -0.4)); float spec2 = pow(max(dot(n, normalize(l2+v)), 0.0), 120.0) * 0.5;
      vec3 col = mix(deep, refl * 0.82, 0.62 + 0.38 * fr) + vec3(1.0, 0.86, 0.62) * spec + vec3(0.8,0.85,1.0)*spec2;
      float fade = 1.0 - smoothstep(uFade*0.45, uFade, length(p));
      gl_FragColor = vec4(col, fade);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
};

function makeRenderer(canvas, alpha = true) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1.5 : 2));
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}
export function studioEnv(renderer) {
  // custom product-photography studio: dark room + strip softboxes → crisp light/dark bands on metal
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x0c0c0d);
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x141416, side: THREE.BackSide }));
  env.add(room);
  const panel = (w, h, color, intensity, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); env.add(m); return m;
  };
  panel(1.4, 9, 0xffffff, 5.5, [-6.5, 1, 2], [0, Math.PI / 2, 0]);        // left strip
  panel(1.0, 9, 0xffffff, 4.0, [6.5, 1, -1.5], [0, -Math.PI / 2, 0]);     // right strip
  panel(8, 3, 0xfff4e2, 3.2, [0, 5.8, 0], [Math.PI / 2, 0, 0]);           // top softbox
  panel(2.2, 6, 0xffd9a0, 2.4, [3.5, 0.5, 6.5], [0, Math.PI, 0]);         // warm front-right kicker
  panel(0.6, 7, 0xffffff, 6.0, [-2.5, 1, -6.5], [0, 0, 0]);               // thin back rim strip
  panel(20, 4, 0x2a2622, 1.0, [0, -5.5, 0], [-Math.PI / 2, 0, 0]);        // warm dark floor bounce
  const tex = pm.fromScene(env, 0.02).texture;
  pm.dispose();
  return tex;
}
export function webglOK() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; }
}

/* ==========================================================================
   THE DROP — hero
   ========================================================================== */
export function initDrop(root, { gsap, ScrollTrigger, reduce, mobile, onProgress }) {
  const canvas = root.querySelector("canvas");
  const renderer = makeRenderer(canvas, true);
  const scene = new THREE.Scene();
  scene.environment = studioEnv(renderer);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

  // lights — soft spotlights like a gallery
  const key = new THREE.SpotLight(0xffe6b8, 60, 20, Math.PI / 7, 0.8, 1.6);
  key.position.set(-2.5, 6, 3); key.target.position.set(0.4, 1.4, 0); scene.add(key, key.target);
  const rim = new THREE.SpotLight(0xffffff, 40, 20, Math.PI / 8, 0.9, 1.6);
  rim.position.set(3.5, 4, -3); rim.target.position.set(0.4, 1.6, 0); scene.add(rim, rim.target);
  scene.add(new THREE.AmbientLight(0xffffff, 0.08));

  // tap on a dark stone plinth rising from still water
  const mat = metalMaterial("chrome");
  const tap = buildAndy(mat);
  const plinthH = 0.42;
  tap.position.set(0.62, plinthH, 0);
  scene.add(tap);
  const stone = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0d, roughness: 0.28, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.18, envMapIntensity: 0.55 });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, plinthH + 0.6, 96), stone);
  plinth.position.set(0.66, (plinthH - 0.6) / 2, 0);
  scene.add(plinth);
  // gold hairline ring on plinth top
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.421, 0.0035, 8, 160), new THREE.MeshStandardMaterial({ color: 0xC8A45D, metalness: 1, roughness: 0.25 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(0.66, plinthH - 0.002, 0); scene.add(ring);

  // water (planar reflection with ripple distortion)
  const W = window.innerWidth < 900 ? 512 : 1024;
  const water = new Reflector(new THREE.CircleGeometry(14, 96), { shader: RippleShader, textureWidth: W, textureHeight: W, clipBias: 0.002, color: 0xffffff });
  water.rotation.x = -Math.PI / 2;
  water.material.transparent = true;
  scene.add(water);
  const U = water.material.uniforms;
  const tipW = new THREE.Vector3(); tap.updateMatrixWorld(true); tipW.copy(tap.userData.tip).applyMatrix4(tap.matrixWorld);
  U.uC.value.set(tipW.x, tipW.z);

  // the drop
  const dropMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, thickness: 0.25, ior: 1.33, envMapIntensity: 1.8, clearcoat: 1, transparent: true });
  const dropGeo = (() => {
    const pts = [];
    for (let i = 0; i <= 32; i++) { const t = i / 32; const a = t * Math.PI; const rr = Math.sin(a) * (0.5 + 0.5 * Math.pow(t, 0.8)) * 0.5; pts.push(new THREE.Vector2(Math.max(0.0001, rr), -Math.cos(a) * 0.62)); }
    return new THREE.LatheGeometry(pts, 48);
  })();
  const drop = new THREE.Mesh(dropGeo, dropMat);
  drop.scale.setScalar(0.0001);
  scene.add(drop);

  // splash droplets
  const splash = new THREE.Group(); scene.add(splash);
  const sGeo = new THREE.SphereGeometry(1, 16, 12);
  const sparks = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.Mesh(sGeo, dropMat); const a = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
    m.userData = { a, v: 0.5 + Math.random() * 0.6, up: 0.6 + Math.random() * 0.7, s: 0.008 + Math.random() * 0.012 };
    m.visible = false; splash.add(m); return m;
  });
  // crown ring
  const crown = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 10, 64), dropMat);
  crown.rotation.x = Math.PI / 2; crown.visible = false; scene.add(crown);

  // stream (top anchored)
  const streamLen = tipW.y;
  const sg = new THREE.CylinderGeometry(0.03, 0.036, 1, 32, 24, true); sg.translate(0, -0.5, 0);
  const stream = new THREE.Mesh(sg, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: 0.08, ior: 1.33, envMapIntensity: 2.0, clearcoat: 1, transparent: true }));
  stream.position.copy(tipW); stream.scale.set(1, 0.0001, 1); stream.visible = false;
  scene.add(stream);
  // subtle wobble on stream via onBeforeCompile
  stream.material.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = { value: 0 }; stream.userData.sh = sh;
    sh.vertexShader = "uniform float uTime;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      float k = -position.y; transformed.x += sin(k*18.0 - uTime*14.0)*0.004*k; transformed.z += cos(k*15.0 - uTime*11.0)*0.003*k;
      transformed.xz *= 1.0 + sin(k*40.0 - uTime*30.0)*0.06;`);
  };

  // camera keyframes
  const CAM = [
    { p: 0.0, pos: new THREE.Vector3(2.2, 2.8, 7.8), look: new THREE.Vector3(-0.1, 2.3, 0) },
    { p: 0.2, pos: new THREE.Vector3(0.6, 2.2, 4.4), look: new THREE.Vector3(-0.6, 1.75, 0) },
    { p: 0.38, pos: new THREE.Vector3(1.4, 1.2, 5.6), look: new THREE.Vector3(-0.5, 0.75, 0) },
    { p: 0.6, pos: new THREE.Vector3(2.0, 1.8, 8.6), look: new THREE.Vector3(-0.15, 1.55, 0) }
  ];
  const tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
  function camAt(p) {
    if (p <= 0.6) {
      let a = CAM[0], b = CAM[1];
      for (let i = 0; i < CAM.length - 1; i++) if (p >= CAM[i].p && p <= CAM[i + 1].p) { a = CAM[i]; b = CAM[i + 1]; }
      const t = smooth(0, 1, (p - a.p) / (b.p - a.p));
      tmpP.lerpVectors(a.pos, b.pos, t); tmpL.lerpVectors(a.look, b.look, t);
    } else {
      const t = smooth(0.6, 1, p);
      const start = Math.atan2(CAM[3].pos.x, CAM[3].pos.z);
      const ang = start - t * 1.35;
      const rad = lerp(8.7, 8.0, t);
      tmpP.set(Math.sin(ang) * rad, lerp(1.8, 2.3, t), Math.cos(ang) * rad);
      tmpL.set(lerp(-0.15, -0.3, t), lerp(1.55, 1.45, t), 0);
    }
    // portrait screens: pull back so the whole tap stays in frame
    const k = camera.aspect < 0.8 ? 1.75 : camera.aspect < 1.1 ? 1.3 : 1;
    if (k !== 1) tmpP.sub(tmpL).multiplyScalar(k).add(tmpL);
    camera.position.copy(tmpP); camera.lookAt(tmpL);
  }

  // DOM hooks
  const title = root.querySelector(".drop__title");
  const kicker = root.querySelector(".drop__kicker");
  const intro = root.querySelector(".drop__intro");
  const scrollCue = root.querySelector(".drop__scroll");
  const cta = root.querySelector(".drop__cta");
  const ticks = Array.from(root.querySelectorAll(".drop__progress b"));
  const disp = document.querySelector("#rippleText feDisplacementMap");
  const turb = document.querySelector("#rippleText feTurbulence");

  let target = 0, prog = 0, visible = true, running = true;
  const clock = new THREE.Clock();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  function resize() {
    const w = root.clientWidth, h = root.querySelector(".drop__stage").clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 40 : 28; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);

  function update(p, t) {
    // handle turns
    if (tap.userData.leverAxis === "x") { tap.userData.lever.rotation.x = -smooth(0.02, 0.14, p) * 0.55; } else { tap.userData.lever.rotation.y = -smooth(0.02, 0.14, p) * 0.75; tap.userData.lever.rotation.z = smooth(0.02, 0.14, p) * 0.12; }
    // drop forms & falls
    const grow = smooth(0.1, 0.22, p), fall = smooth(0.22, 0.36, p);
    const fallE = fall * fall;
    if (p < 0.36) {
      const s = 0.055 * grow;
      drop.visible = grow > 0.001;
      drop.scale.set(s * (1 - fall * 0.15), s * (1 + grow * 0.25 + fall * 0.6), s * (1 - fall * 0.15));
      drop.position.set(tipW.x, tipW.y - 0.034 * grow - fallE * (tipW.y - 0.01), tipW.z);
    } else drop.visible = false;
    // impact
    const imp = Math.max(0, p - 0.36);
    U.uT.value = imp * 11.5;
    const sp = smooth(0.36, 0.47, p);
    sparks.forEach((m) => {
      const d = m.userData; m.visible = sp > 0 && sp < 1;
      const tt = sp * 1.0;
      m.position.set(tipW.x + Math.cos(d.a) * d.v * tt * 0.45, Math.max(0, d.up * tt * (1 - tt) * 0.9), tipW.z + Math.sin(d.a) * d.v * tt * 0.45);
      m.scale.setScalar(d.s * (1 - tt * 0.7));
    });
    const cr = smooth(0.36, 0.44, p);
    crown.visible = cr > 0 && cr < 1;
    crown.position.set(tipW.x, 0.01 + Math.sin(cr * Math.PI) * 0.05, tipW.z);
    crown.scale.set(0.02 + cr * 0.16, 0.02 + cr * 0.16, 0.5 * (1 - cr) + 0.05);
    // flow
    const flow = smooth(0.62, 0.76, p);
    stream.visible = flow > 0.001;
    stream.scale.y = Math.max(0.0001, flow * streamLen);
    U.uFlow.value = flow;
    if (stream.userData.sh) stream.userData.sh.uniforms.uTime.value = t;
    // camera
    camAt(p);
    camera.position.x += mouse.sx * 0.25; camera.position.y -= mouse.sy * 0.15;
    U.uCam.value.copy(camera.position);
    U.uTime.value = t;
    // DOM
    const fadeIntro = 1 - smooth(0.03, 0.12, p);
    if (kicker) kicker.style.opacity = fadeIntro;
    if (intro) intro.style.opacity = fadeIntro;
    if (scrollCue) scrollCue.style.opacity = 1 - smooth(0.02, 0.08, p);
    const tIn = smooth(0.4, 0.58, p);
    const tUp = smooth(0.7, 0.9, p);
    if (title) {
      title.style.opacity = tIn;
      title.style.transform = `translate3d(0, ${-tUp * 22}vh, 0) scale(${1 - tUp * 0.38})`;
      if (disp) disp.setAttribute("scale", ((1 - tIn) * 110).toFixed(1));
      if (turb) turb.setAttribute("baseFrequency", `${(0.004 + (1 - tIn) * 0.02).toFixed(4)} ${(0.012 + (1 - tIn) * 0.05 + Math.sin(t) * 0.002).toFixed(4)}`);
      if (tIn >= 0.999 && title.style.filter !== "none") title.style.filter = "none";
      else if (tIn < 0.999 && title.style.filter === "none") title.style.filter = "";
    }
    const c = smooth(0.86, 0.95, p);
    if (cta) { cta.style.opacity = c; cta.style.transform = `translateY(${(1 - c) * 24}px)`; cta.classList.toggle("is-on", c > 0.5); }
    ticks.forEach((b, i) => { b.style.transform = `scaleX(${smooth(i * 0.25, (i + 1) * 0.25, p)})`; });
    onProgress && onProgress(p);
  }

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    prog += (target - prog) * 0.085;
    mouse.sx += (mouse.x - mouse.sx) * 0.04; mouse.sy += (mouse.y - mouse.sy) * 0.04;
    tap.position.y = plinthH + Math.sin(t * 0.8) * 0.0;
    update(prog, t);
    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(root);

  if (reduce) {
    root.classList.add("is-static");
    target = prog = 1; update(1, 0); renderer.render(scene, camera);
    resize(); update(1, 0); renderer.render(scene, camera);
    return { setFinish: () => {} };
  }
  if (mobile) {
    // shorter autoplay version
    root.classList.add("is-static");
    resize();
    const o = { p: 0 };
    gsap.to(o, { p: 1, duration: 7.5, ease: "power1.inOut", delay: 0.6, onUpdate: () => { target = o.p; } });
  } else {
    ScrollTrigger.create({ trigger: root, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => { target = s.progress; } });
  }
  frame();
  return { setFinish: (f) => tweenFinish(mat, f, gsap), renderer };
}

/* ==========================================================================
   FINISH STAGE — interactive switcher
   ========================================================================== */
export function initFinishStage(root, { gsap, finish = "chrome" }) {
  const canvas = root.querySelector("canvas");
  const renderer = makeRenderer(canvas, true);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.environment = studioEnv(renderer);
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 1.9, 8.2);
  const mat = metalMaterial(finish);
  const tap = buildAndy(mat);
  const pivot = new THREE.Group(); scene.add(pivot);
  tap.position.set(0.45, 0, 0); pivot.add(tap);
  pivot.position.y = -1.62;
  // spot light & shadow catcher
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.position.set(-2, 6, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 8;
  sun.shadow.camera.left = -3; sun.shadow.camera.right = 3; sun.shadow.camera.top = 3; sun.shadow.camera.bottom = -3;
  scene.add(sun);
  const sweep = new THREE.PointLight(0xfff6e0, 0, 6, 1.5); scene.add(sweep);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.62; ground.receiveShadow = true; scene.add(ground);
  // plinth disc
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.72, 0.06, 96), new THREE.MeshPhysicalMaterial({ color: 0x0f0f10, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2 }));
  disc.position.set(0.45, -0.03, 0); disc.receiveShadow = true; pivot.add(disc);

  let rotY = -0.5, vel = 0.0025, drag = false, lx = 0, visible = true;
  const onDown = (e) => { drag = true; lx = e.clientX; root.setPointerCapture?.(e.pointerId); };
  const onMove = (e) => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; vel = dx * 0.0009; rotY += dx * 0.008; };
  const onUp = () => { drag = false; };
  root.addEventListener("pointerdown", onDown); root.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);

  function resize() { const w = root.clientWidth, h = root.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = w / h < 0.9 ? 11.5 : 9.0; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!drag) { vel += (0.0028 - vel) * 0.02; rotY += vel; }
    pivot.rotation.y = rotY;
    pivot.position.y = -1.62 + Math.sin(t * 0.9) * 0.04;
    camera.lookAt(0, -0.32, 0);
    renderer.render(scene, camera);
  })();
  return {
    setFinish(f) {
      tweenFinish(mat, f, gsap, 1.2);
      const o = { x: -3, i: 0 };
      gsap.timeline().to(o, { i: 14, duration: 0.25, onUpdate: () => { sweep.intensity = o.i; } })
        .to(o, { x: 3, duration: 1.1, ease: "power2.inOut", onUpdate: () => { sweep.position.set(o.x, 0.6, 1.6); } }, 0)
        .to(o, { i: 0, duration: 0.5 }, 0.8);
      gsap.timeline().to(o, { duration: 0.4 });
      // give it a little spin for drama
      gsap.to({ v: 0 }, { v: 1, duration: 1.2, ease: "power3.out", onUpdate() { rotY += 0.012 * (1 - this.progress()); } });
    }
  };
}
