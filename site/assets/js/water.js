/* MAKHI — water.js : slow WebGL water caustics (no video weight). */
(() => {
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uWarm; uniform float uLight;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float caustic(vec2 uv, float t){
  vec2 p = mod(uv*6.2831, 6.2831) - 250.0; vec2 i = p; float c = 1.0; float inten = .005;
  for (int n = 0; n < 5; n++){ float tt = t * (1.0 - (3.5 / float(n+1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0/length(vec2(p.x / (sin(i.x+tt)/inten), p.y / (cos(i.y+tt)/inten))); }
  c /= 5.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; vec2 p = uv; p.x *= uRes.x / uRes.y;
  float t = uTime * 0.12;
  vec2 m = (uMouse - 0.5) * 0.08;
  float n = noise(p*2.0 + t) * 0.15;
  float c = caustic(p*0.55 + m + n, t*3.0);
  float c2 = caustic(p*0.9 - m + 0.3, t*2.2 + 1.3);
  vec3 deep = mix(vec3(0.02,0.02,0.025), vec3(0.93,0.91,0.87), uLight);
  vec3 warm = vec3(0.86, 0.68, 0.38);
  vec3 cool = vec3(0.55, 0.72, 0.82);
  vec3 tint = mix(cool, warm, uWarm);
  vec3 col = deep + tint * (c * 0.55 + c2 * 0.25) * mix(1.0, 0.55, uLight);
  float vig = smoothstep(1.25, 0.25, length(uv - vec2(0.5, 0.55)));
  col *= mix(0.55, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }";
  function mount(canvas, opts = {}) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(pr, "uRes"), uTime = gl.getUniformLocation(pr, "uTime"), uMouse = gl.getUniformLocation(pr, "uMouse"), uWarm = gl.getUniformLocation(pr, "uWarm"), uLight = gl.getUniformLocation(pr, "uLight");
    const scale = opts.scale || 0.5; let vis = true, mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
    const size = () => { canvas.width = Math.max(2, canvas.clientWidth * scale); canvas.height = Math.max(2, canvas.clientHeight * scale); gl.viewport(0, 0, canvas.width, canvas.height); };
    size(); addEventListener("resize", size);
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; }, { passive: true });
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(canvas);
    const t0 = performance.now(); const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function loop() {
      requestAnimationFrame(loop); if (!vis) return;
      smx += (mx - smx) * 0.03; smy += (my - smy) * 0.03;
      gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uTime, still ? 12 : (performance.now() - t0) / 1000);
      gl.uniform2f(uMouse, smx, smy); gl.uniform1f(uWarm, opts.warm ?? 0.75); gl.uniform1f(uLight, opts.light ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    loop();
    return { size };
  }
  window.MakhiWater = { mount };
  document.addEventListener("DOMContentLoaded", () => document.querySelectorAll("canvas[data-water]").forEach((c) => mount(c, { warm: Number(c.dataset.warm || 0.75) })));
})();
