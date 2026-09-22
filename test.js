
(() => {
'use strict';

/* ------------------------------------------------------------------ helpers */
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const $ = id => document.getElementById(id);
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd = mulberry((typeof window.__seed === 'number') ? window.__seed : ((Math.random() * 1e9) | 0));
const R = (a, b) => a + (b - a) * rnd();
const pick = arr => arr[(rnd() * arr.length) | 0];
const V3 = THREE.Vector3, Q4 = THREE.Quaternion, C3 = THREE.Color;

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = { view: 'eye', gust: 1, limp: 0.55, freedom: 0.5, comfort: reduceMotion ? 0.9 : 0.65, sound: false, started: false, hidden: false };

/* -------------------------------------------------------- perception shader */
const PerceptionShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2() },
    uDesat: { value: 0 },
    uInvert: { value: 0 },
    uDots: { value: 0 },
    uThermal: { value: 0 },
    uEdge: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uDesat;
    uniform float uInvert;
    uniform float uDots;
    uniform float uThermal;
    uniform float uEdge;
    varying vec2 vUv;
    
    vec3 thermalMap(float t) {
        vec3 c1 = vec3(0.0, 0.0, 0.0);
        vec3 c2 = vec3(0.1, 0.0, 0.5);
        vec3 c3 = vec3(0.8, 0.1, 0.0);
        vec3 c4 = vec3(1.0, 0.8, 0.0);
        vec3 c5 = vec3(1.0, 1.0, 1.0);
        if(t < 0.25) return mix(c1, c2, t/0.25);
        if(t < 0.50) return mix(c2, c3, (t-0.25)/0.25);
        if(t < 0.75) return mix(c3, c4, (t-0.50)/0.25);
        return mix(c4, c5, (t-0.75)/0.25);
    }
    
    void main() {
        vec4 tex = texture2D(tDiffuse, vUv);
        vec3 col = tex.rgb;
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        
        // 1. Desaturate
        col = mix(col, vec3(lum), uDesat);
        
        // 2. Thermal
        vec3 therm = thermalMap(lum);
        col = mix(col, therm, uThermal);
        
        // 3. Dots (Stippling/Pointillism)
        if (uDots > 0.0) {
            vec2 rotUV = vUv * uResolution / 6.0;
            vec2 grid = floor(rotUV);
            vec2 local = fract(rotUV) - 0.5;
            vec3 sampleColor = texture2D(tDiffuse, (grid + 0.5) * 6.0 / uResolution).rgb;
            float sLum = dot(sampleColor, vec3(0.299, 0.587, 0.114));
            float radius = sLum * 0.75;
            float inDot = step(length(local), radius);
            vec3 dotColor = mix(vec3(0.0), sampleColor * 1.5, inDot);
            col = mix(col, dotColor, uDots);
        }
        
        // 4. Edge (Abstract / X-ray-ish)
        if (uEdge > 0.0) {
            vec2 texel = 1.0 / uResolution;
            float lRight = dot(texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
            float lUp = dot(texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb, vec3(0.299, 0.587, 0.114));
            float edge = abs(lum - lRight) + abs(lum - lUp);
            edge = smoothstep(0.03, 0.12, edge);
            vec3 edgeColor = mix(vec3(0.0), vec3(0.2, 0.8, 0.9), edge); // Glowing edge
            col = mix(col, edgeColor, uEdge);
        }
        
        // 5. Invert
        col = mix(col, 1.0 - col, uInvert);
        
        gl_FragColor = vec4(col, tex.a);
    }
  `
};

let perceptionPasses = [];
let passedFloorD = 0;

/* ---------------------------------------------------------------- renderer */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
} catch (e) { $('fail').style.display = 'flex'; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.autoClear = false;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x101030, 20, 330);
const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.9);
const sun = new THREE.DirectionalLight(0xffffff, 1);
scene.add(hemi, sun);

const eyeCam = new THREE.PerspectiveCamera(80, 1, 0.08, 4000);
const obsCam = new THREE.PerspectiveCamera(62, 1, 0.1, 4000);
obsCam.layers.enable(1);              // layer 1 holds the head, which the eyes must not see

const world = new THREE.Group();      // everything that scrolls upward past the body
scene.add(world);

/* ------------------------------------------------------------------ palettes */
const PAL_SRC = {
  dusk:  { top:'#241a55', hor:'#f58b5e', low:'#6a3364', fog:'#94587f', sun:'#ffb07a', sunDir:[.55,.10,-.6], sunI:1.25, hemiS:'#8a7ee0', hemiG:'#5e2f55', hemiI:.85, stars:.35, win:['#ffc36a','#ff8f5a'], tower:'#2b2346' },
  night: { top:'#03050d', hor:'#1c2d63', low:'#080b1a', fog:'#0c1232', sun:'#9fbfff', sunDir:[-.3,.75,-.5], sunI:.7,  hemiS:'#2c4390', hemiG:'#0a0e22', hemiI:.95, stars:1,  win:['#ffd27a','#7fe3ff'], tower:'#1a2142' },
  dawn:  { top:'#2a5b78', hor:'#f1f4d8', low:'#8db4b2', fog:'#a2c1bc', sun:'#fff0c6', sunDir:[-.6,.22,-.5], sunI:1.35, hemiS:'#cfe8ee', hemiG:'#6e8e90', hemiI:1.0, stars:0,  win:['#fff0c8','#ffe1a0'], tower:'#48666f' },
  ember: { top:'#160a20', hor:'#ff5f36', low:'#3d1026', fog:'#602030', sun:'#ff7d48', sunDir:[.2,.08,-.9], sunI:1.1,  hemiS:'#7a3a70', hemiG:'#3a1220', hemiI:.85, stars:.2, win:['#ffb347','#ff6a3d'], tower:'#3a1a30' },
  neon:  { top:'#050014', hor:'#ff0055', low:'#0a0026', fog:'#3a0088', sun:'#00ffff', sunDir:[0,1,0], sunI:2.0, hemiS:'#ff00aa', hemiG:'#000000', hemiI:1.5, stars:1, win:['#00ffff','#ff00ff'], tower:'#110022' }
};
const PALC = {};
for (const k in PAL_SRC) {
  const p = PAL_SRC[k], o = {};
  for (const f of ['top','hor','low','fog','sun','hemiS','hemiG','tower']) o[f] = new C3(p[f]);
  o.win = p.win.map(c => new C3(c));
  o.sunDir = new V3(...p.sunDir).normalize();
  o.sunI = p.sunI; o.hemiI = p.hemiI; o.stars = p.stars;
  PALC[k] = o;
}
const cur = { top:new C3(), hor:new C3(), low:new C3(), fog:new C3(), sun:new C3(), hemiS:new C3(), hemiG:new C3(),
              sunDir:new V3(), sunI:1, hemiI:1, stars:0 };
function blendPal(a, b, t) {
  for (const f of ['top','hor','low','fog','sun','hemiS','hemiG']) cur[f].copy(a[f]).lerp(b[f], t);
  cur.sunDir.copy(a.sunDir).lerp(b.sunDir, t).normalize();
  cur.sunI = lerp(a.sunI, b.sunI, t); cur.hemiI = lerp(a.hemiI, b.hemiI, t); cur.stars = lerp(a.stars, b.stars, t);
}
const FOG_BASE = { sky:[26,400], canyon:[12,300], shaft:[8,250], debris:[20,360] };

/* -------------------------------------------------------- shared uniforms */
const G = {
  keep:  { value: 3.6 },     // radius of the empty tube around the falling body; geometry is pushed out of it
  dmod:  { value: 0 },       // fall distance mod window-row height, keeps window patterns glued to the buildings
  didx:  { value: 0 },
  time:  { value: 0 },
  fogColor: { value: new C3() }, fogNear: { value: 20 }, fogFar: { value: 330 }
};
const ROW = 3.2;

/* --------------------------------------------------------------- sky dome */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
  uniforms: { uTop:{value:cur.top}, uHor:{value:cur.hor}, uLow:{value:cur.low}, uSun:{value:cur.sun}, uSunDir:{value:cur.sunDir}, uStars:{value:0} },
  vertexShader: `varying vec3 vDir;
    void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec3 vDir;
    uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uLow; uniform vec3 uSun; uniform vec3 uSunDir; uniform float uStars;
    float h31(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
    void main(){
      vec3 d = normalize(vDir);
      float h = d.y;
      vec3 col = mix(uLow, uHor, smoothstep(-0.55, 0.02, h));
      col = mix(col, uLow * 0.55, 1.0 - smoothstep(-1.0, -0.25, h));
      col = mix(col, uTop, smoothstep(0.0, 0.8, h));
      col += uHor * 0.30 * exp(-abs(h) * 8.0);
      float sd = max(dot(d, normalize(uSunDir)), 0.0);
      col += uSun * (pow(sd, 900.0) * 4.0 + pow(sd, 28.0) * 0.30);
      float st = step(0.9968, h31(floor(d * 240.0))) * smoothstep(0.02, 0.35, h) * uStars;
      col += vec3(0.85, 0.9, 1.0) * st;
      gl_FragColor = vec4(col, 1.0);
    }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 24), skyMat);
sky.frustumCulled = false; sky.renderOrder = -10;
scene.add(sky);

/* -------------------------------------------- world material (Lambert + patch)
   Two things are patched in: (1) any vertex that falls inside the tube around the falling body is pushed
   out to the tube wall, so nothing solid can ever occupy the body's space; (2) an optional procedural
   window pattern lit from the emissive colour. */
function wm(color, o = {}) {
  const m = new THREE.MeshLambertMaterial({ color, emissive: o.emissive !== undefined ? o.emissive : 0x000000 });
  const win = o.win ? 1 : 0, on = o.on !== undefined ? o.on : 0.55, winB = new C3(o.winB !== undefined ? o.winB : 0xffffff);
  m.customProgramCacheKey = () => 'fall-world';
  m.onBeforeCompile = sh => {
    sh.uniforms.uDmod = G.dmod; sh.uniforms.uDidx = G.didx;
    sh.uniforms.uWin = { value: win }; sh.uniforms.uOn = { value: on }; sh.uniforms.uWinB = { value: winB };
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'varying vec3 vWP; varying vec3 vWN;\nvoid main() {')
      .replace('#include <project_vertex>', `
        vec4 wp = modelMatrix * vec4( transformed, 1.0 );
        vWP = wp.xyz;
        vWN = normalize( mat3( modelMatrix ) * objectNormal );
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', `varying vec3 vWP; varying vec3 vWN;
        uniform float uDmod; uniform float uDidx; uniform float uWin; uniform float uOn; uniform vec3 uWinB;
        float h21w(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() {`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        if ( uWin > 0.5 ) {
          vec3 wn = normalize( vWN );
          float side = 1.0 - smoothstep( 0.35, 0.65, abs( wn.y ) );
          float hz = ( abs( wn.x ) > abs( wn.z ) ) ? vWP.z : vWP.x;
          float rowf = ( uDmod - vWP.y ) / ${ROW.toFixed(1)};
          float colf = hz / 2.7;
          vec2 fw = vec2( fract( colf ), fract( rowf ) );
          vec2 cell = vec2( floor( colf ), mod( floor( rowf ) + uDidx, 997.0 ) );
          float pane = step( 0.2, fw.x ) * step( fw.x, 0.8 ) * step( 0.25, fw.y ) * step( fw.y, 0.75 );
          float lit = step( uOn, h21w( cell + abs( wn.x ) * 31.0 ) );
          vec3 wc = mix( emissive, uWinB, step( 0.5, h21w( cell * 1.7 + 3.0 ) ) );
          float farF = 1.0 - smoothstep( 150.0, 380.0, distance( vWP, cameraPosition ) );
          vec3 sharp = wc * pane * lit * ( 0.65 + 0.7 * h21w( cell * 2.3 ) );
          vec3 blurred = wc * 0.20 * ( 1.0 - uOn );
          totalEmissiveRadiance = mix( blurred, sharp, farF ) * side;
        }`);
  };
  return m;
}

/* ---------------------------------------------------------------- geometry */
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 10, 1),
  sph: new THREE.SphereGeometry(1, 16, 12),
  ring: new THREE.TorusGeometry(1, 0.028, 8, 80)
};
function cloudTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < 9; i++) {
    const x = 64 + (Math.random() - .5) * 46, y = 64 + (Math.random() - .5) * 30, r = 30 + Math.random() * 24;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(c); return t;
}
const cloudTex = cloudTexture();

/* ============================================================ THE DIRECTOR
   Depth is measured in metres fallen. The body never moves: the world scrolls up past it. The plan is a
   list of acts laid end to end in depth. Every few acts an act ends in a floor: a big plane that rises
   from the haze. It thins to nothing before it can arrive, and the next act starts on the other side. */
const SL = 30;                 // slab length (m)
const GEN0 = -210;
const GEN_DIST = 340;          // how far below the body content is generated
const KEEP_UP = 260;           // how far above the body passed content is kept
const plan = [];
const slabs = [];
let D = 0;                     // fall distance (double precision on purpose)
let genDepth = GEN0;
let actId = 0, sinceGround = 1, floorsEscaped = 0;
const GROUND_PAL = { city: 'night', sea: 'dawn', fields: 'dusk' };
const PAL_FOR = { sky:['dusk','dawn','ember','night','neon'], canyon:['night','dusk','dawn','neon'], shaft:['ember','night','dusk','neon'], debris:['dawn','dusk','night','ember','neon'] };

function planNext() {
  const prev = plan[plan.length - 1];
  const start = prev ? prev.end : GEN0;
  let type, pal, len;
  if (!prev) { type = 'sky'; pal = 'dusk'; len = 850; }
  else {
    let opts = ['sky', 'canyon', 'shaft', 'debris'].filter(t => t !== prev.type);
    
    // Responsive environment logic (Dream Logic)
    if (U > 65 && rnd() < 0.4) {
      opts = ['debris']; // Fast falling triggers chaotic debris
    } else if (torsoW > 1.5) {
      opts = ['debris', 'canyon']; // High rotation -> more chaos
    } else if (frame.up.y < -0.2) {
      opts = ['shaft', 'sky'];     // Upside down -> open or confined spaces
    }
    opts = opts.filter(t => t !== prev.type);
    if (opts.length === 0) opts = ['sky', 'canyon', 'shaft', 'debris'].filter(t => t !== prev.type);

    type = pick(opts);
    
    if (U > 65 && rnd() < 0.5) {
      pal = 'neon'; // High speed triggers surreal neon palette
    } else {
      pal = prev.ground ? GROUND_PAL[prev.ground.type] : pick(PAL_FOR[type].filter(p => p !== prev.pal));
    }
    
    len = type === 'sky' ? R(600, 900) : type === 'canyon' ? R(800, 1200) : R(600, 900);
  }
  const a = { id: actId++, type, pal, start, end: start + len, ground: null, M: null, towers: null, shaftW: R(11, 15.5), slabN: 0, inverted: frame.up.y < -0.2 };
  if (!prev) a.ground = { type: 'sea', mesh: null, created: false, done: false };
  else {
    sinceGround++;
    if (type !== 'shaft' && sinceGround >= 2 && (sinceGround >= 3 || rnd() < 0.6)) {
      a.ground = { type: pick(['city', 'sea', 'fields']), mesh: null, created: false, done: false };
      sinceGround = 0;
    }
  }
  plan.push(a);
  return a;
}
function ensurePlan(toDepth) { while (!plan.length || plan[plan.length - 1].end < toDepth) planNext(); }
function actAt(d) { for (let i = 0; i < plan.length; i++) if (d < plan[i].end) return plan[i]; return plan[plan.length - 1]; }

/* ---- per-act materials, baked from the act's palette */
function mats(act) {
  if (act.M) return act.M;
  const pc = PALC[act.pal], w0 = pc.win[0], w1 = pc.win[1] || pc.win[0];
  const M = {};
  M.tower = [0, 1, 2].map(i => wm(pc.tower.clone().offsetHSL(0, 0, (i - 1) * 0.025), { emissive: w0, winB: w1, win: true, on: 0.5 + i * 0.07 }));
  M.mono = wm(pc.tower.clone().offsetHSL(0, 0, -0.01), { emissive: w0, winB: w1, win: true, on: 0.88 });
  M.wall = wm(pc.tower.clone().offsetHSL(0, 0, 0.05), { emissive: w0, winB: w1, win: true, on: 0.8 });
  M.floor = wm(pc.tower.clone().offsetHSL(0, 0, 0.11));
  M.ledge = wm(pc.tower.clone().offsetHSL(0, 0, 0.08));
  M.cable = wm(0x08080e);
  M.neonA = wm(0x000000, { emissive: w0 });
  M.neonB = wm(0x000000, { emissive: w1 });
  M.ring = wm(0x000000, { emissive: w1.clone().lerp(w0, .4) });
  M.tint = pc.hor.clone().lerp(pc.fog, 0.35);
  const dbg = (c) => wm(c, { emissive: new C3(c).multiplyScalar(0.24) });
  M.wood = dbg(0x6f4d38); M.paper = dbg(0xe6dccb); M.brick = dbg(0x9a4a3f); M.blue = dbg(0x3f5f8f); M.brass = dbg(0xc9a25a);
  act.M = M; return M;
}

/* ---- slab helpers */
function newSlab(depth, act) {
  const g = new THREE.Group(); g.position.set(worldX, -depth, worldZ); world.add(g);
  const s = { depth, g, act, spin: [], sprites: [], dodgeables: [], colliders: [], ground: false };
  slabs.push(s); return s;
}
function addWall(s, M, x, dy, z, w, h, d, rx=0, ry=0, rz=0) {
  const m = add(s, GEO.box, M, x, dy, z, w, h, d, rx, ry, rz);
  // Ensure matrixWorld is populated immediately for colliders
  m.updateMatrixWorld(true);
  const hw = w/2, hh = h/2, hd = d/2;
  s.colliders.push({ type: 'box', m, hw, hh, hd });
  return m;
}

function addCable(s, M, ax, ay, az, bx, by, bz, r) {
  const m = cylBetween(s, M, ax, ay, az, bx, by, bz, r);
  s.colliders.push({ type: 'cable', m, a: new V3(ax, -ay, az), b: new V3(bx, -by, bz), r });
  return m;
}

function add(s, geo, mat, x, dy, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, still = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, -dy, z); m.scale.set(sx, sy, sz);
  if (rx || ry || rz) m.rotation.set(rx, ry, rz);
  
  // Save base properties so the dodger can push off from them and spring back
  m.userData = { baseX: x, baseY: -dy, baseZ: z, baseQ: m.quaternion.clone() };
  
  if (still) { m.matrixAutoUpdate = false; m.updateMatrix(); }
  s.g.add(m); return m;
}
function cloud(s, x, dy, z, size, op, tint) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: tint, opacity: op, transparent: true, depthWrite: false }));
  sp.position.set(x, -dy, z); sp.scale.set(size, size * 0.55, 1); sp.material.rotation = R(-.3, .3);
  s.g.add(sp); s.sprites.push(sp);
}
const polar = (r0, r1) => { const a = rnd() * TAU, r = R(r0, r1); return [Math.cos(a) * r, Math.sin(a) * r]; };
function hoop(s, M, dy, rmin, rmax) {
  const r = R(rmin, rmax);
  add(s, GEO.ring, M.ring, R(-1.2, 1.2), dy, R(-1.2, 1.2), r, r, r, Math.PI / 2, 0, 0);
}
function cylBetween(s, mat, ax, ay, az, bx, by, bz, r) {
  const m = new THREE.Mesh(GEO.cyl, mat);
  const a = new V3(ax, -ay, az), b = new V3(bx, -by, bz), d = b.clone().sub(a), L = d.length();
  m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(r, L, r);
  m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize());
  m.userData = { baseX: m.position.x, baseY: m.position.y, baseZ: m.position.z, baseQ: m.quaternion.clone() };
  m.matrixAutoUpdate = false; m.updateMatrix(); s.g.add(m);
  return m;
}
function segDist(ax, az, bx, bz) {          // distance from the fall axis to a segment
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-6;
  const t = clamp(-(ax * dx + az * dz) / L2, 0, 1);
  return Math.hypot(ax + dx * t, az + dz * t);
}
const SOLID_MIN = 8.2;         // no solid thing is ever placed nearer than this to the fall axis

/* ---- act builders. Each fills one 30 m slab. */
function buildSky(s, act) {
  const M = mats(act);
  const n = 4 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) { const [x, z] = polar(20, 230); cloud(s, x, R(0, SL), z, R(45, 160), R(.16, .5), M.tint); }
  for (let i = 0; i < 3; i++) { const [x, z] = polar(3, 30); cloud(s, x, R(0, SL), z, R(6, 15), R(.10, .26), M.tint); }
  if (rnd() < 0.35) {
    const [x, z] = polar(SOLID_MIN + 6, 70), h = R(28, 80), w = R(2.5, 6);
    addWall(s, M.mono, x, R(0, SL), z, w, h, w * R(.7, 1.3));
  }
  if (rnd() < 0.22) hoop(s, M, R(4, SL - 4), 9, 16);
}
function makeTowers() {
  const t = []; let tries = 0;
  while (t.length < 16 && tries++ < 300) {
    const a = rnd() * TAU, r = R(10, 58), w = R(8, 20), d = R(8, 20);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(Math.max(Math.abs(x) - w / 2, 0), Math.max(Math.abs(z) - d / 2, 0)) < SOLID_MIN) continue;
    t.push({ x, z, w, d, wf: 1 });
  }
  return t;
}
function buildCanyon(s, act) {
  const M = mats(act);
  if (!act.towers) act.towers = makeTowers();
  const chaos = clamp(torsoW / 12, 0, 1);
  act.towers.forEach((t, i) => {
    if (rnd() < 0.10) t.wf = clamp(t.wf + (rnd() < .5 ? -1 : 1) * R(.04, .09), .78, 1.08);
    const w = t.w * t.wf, d = t.d * t.wf;
    const rx = chaos * R(-0.2, 0.2) + (act.inverted ? Math.PI : 0), ry = chaos * R(-0.5, 0.5), rz = chaos * R(-0.2, 0.2);
    addWall(s, M.tower[i % 3], t.x, SL / 2, t.z, w, SL + 0.08, d, rx, ry, rz);
    if (rnd() < 0.22) {                           // ledge
      const lw = w + 1.6, ld = d + 1.6;
      if (Math.hypot(Math.max(Math.abs(t.x) - lw / 2, 0), Math.max(Math.abs(t.z) - ld / 2, 0)) >= SOLID_MIN - 0.4) {
        const m = add(s, GEO.box, M.ledge, t.x, R(2, SL - 2), t.z, lw, 0.4, ld, rx, ry, rz);
        s.dodgeables.push({ m, radius: Math.max(lw, ld) * 0.8 });
      }
    }
    if (rnd() < 0.13) {                           // neon plate on the face that looks at the axis
      const gx = Math.abs(t.x) - w / 2, gz = Math.abs(t.z) - d / 2;
      const mat = rnd() < .5 ? M.neonA : M.neonB, hgt = R(2, 5), wid = R(2, 6);
      if (gx >= gz && gx >= SOLID_MIN) add(s, GEO.box, mat, t.x - Math.sign(t.x) * (w / 2 + 0.12), R(3, SL - 3), t.z + R(-d / 3, d / 3), 0.24, hgt, wid, rx, ry, rz);
      else if (gz > gx && gz >= SOLID_MIN) add(s, GEO.box, mat, t.x + R(-w / 3, w / 3), R(3, SL - 3), t.z - Math.sign(t.z) * (d / 2 + 0.12), wid, hgt, 0.24, rx, ry, rz);
    }
  });
  if (rnd() < 0.6 && act.towers.length > 3) {     // cable, sometimes a bridge, across the gap
    const A = pick(act.towers), B = pick(act.towers);
    if (A !== B && segDist(A.x, A.z, B.x, B.z) >= 10) {
      const y1 = R(2, SL - 2), y2 = y1 + R(-2, 2);
      if (rnd() < 0.7) {
        const m = addCable(s, M.cable, A.x, y1, A.z, B.x, y2, B.z, 0.07);
      } else {
        const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz);
        const b1 = add(s, GEO.box, M.ledge, (A.x + B.x) / 2, y1, (A.z + B.z) / 2, L, 0.5, 3.2, 0, Math.atan2(-dz, dx), 0);
        const b2 = add(s, GEO.box, M.neonA, (A.x + B.x) / 2, y1 + 0.35, (A.z + B.z) / 2, L, 0.08, 3.4, 0, Math.atan2(-dz, dx), 0);
        s.dodgeables.push({ m: b1, radius: L * 0.6 }); s.dodgeables.push({ m: b2, radius: L * 0.6 });
      }
    }
  }
  if (rnd() < 0.5) { const [x, z] = polar(3, 30); cloud(s, x, R(0, SL), z, R(8, 20), R(.08, .2), M.tint); }
  if (rnd() < 0.2) hoop(s, M, R(4, SL - 4), 9, 14);
}
function buildShaft(s, act) {
  const M = mats(act), W = act.shaftW, H = 7.4, T = 1.4;      // half-width, half-hole, wall thickness
  addWall(s, M.wall, 0, SL / 2, -(W + T / 2), 2 * W + 2 * T, SL + .08, T);
  addWall(s, M.wall, 0, SL / 2,  (W + T / 2), 2 * W + 2 * T, SL + .08, T);
  addWall(s, M.wall, -(W + T / 2), SL / 2, 0, T, SL + .08, 2 * W);
  addWall(s, M.wall,  (W + T / 2), SL / 2, 0, T, SL + .08, 2 * W);
  const strip = W - H;
  const landing = dy => {
    const l1 = add(s, GEO.box, M.floor, 0, dy, -(W + H) / 2, 2 * W, 0.5, strip);
    const l2 = add(s, GEO.box, M.floor, 0, dy,  (W + H) / 2, 2 * W, 0.5, strip);
    const l3 = add(s, GEO.box, M.floor, -(W + H) / 2, dy, 0, strip, 0.5, 2 * H);
    const l4 = add(s, GEO.box, M.floor,  (W + H) / 2, dy, 0, strip, 0.5, 2 * H);
    s.dodgeables.push({ m: l1, radius: W }); s.dodgeables.push({ m: l2, radius: W });
    s.dodgeables.push({ m: l3, radius: H }); s.dodgeables.push({ m: l4, radius: H });
    // a lit rail around the hole
    add(s, GEO.box, M.neonA, 0, dy - 1, -H, 2 * H, 0.07, 0.07); add(s, GEO.box, M.neonA, 0, dy - 1, H, 2 * H, 0.07, 0.07);
    add(s, GEO.box, M.neonA, -H, dy - 1, 0, 0.07, 0.07, 2 * H); add(s, GEO.box, M.neonA, H, dy - 1, 0, 0.07, 0.07, 2 * H);
  };
  landing(3); landing(18);
  // a flight of stairs down the side strip, from one landing to the next
  const side = act.slabN % 2 ? 1 : -1, N = 14, run = 8, rise = 15, sw = Math.max(strip - 0.6, 1.5);
  for (let i = 0; i < N; i++) {
    const rx = act.inverted ? Math.PI : 0;
    add(s, GEO.box, M.ledge, side * (W + H) / 2, 3 + (i + .5) * rise / N, -run / 2 + (i + .5) * run / N, sw, 0.36, run / N + 0.08, rx, 0, 0);
  }
  // a door glowing on a wall, and a pendant lamp
  if (rnd() < .8) {
    const wall = (rnd() * 4) | 0, u = R(-W + 3, W - 3), dy = R(6, SL - 4);
    const nx = wall < 2 ? u : (wall === 2 ? -(W - .05) : (W - .05)), nz = wall < 2 ? (wall === 0 ? -(W - .05) : (W - .05)) : u;
    const rx = act.inverted ? Math.PI : 0;
    add(s, GEO.box, rnd() < .5 ? M.neonA : M.neonB, nx, dy, nz, wall < 2 ? 2 : 0.15, 3.2, wall < 2 ? 0.15 : 2, rx, 0, 0);
  }
  const [lx, lz] = polar(H + 0.8, W - 1.2), ly = R(6, SL - 6);
  addCable(s, M.cable, lx, ly - 3, lz, lx, ly + 3, lz, 0.03);
  add(s, GEO.sph, M.neonA, lx, ly, lz, 0.45, 0.45, 0.45);
  if (rnd() < 0.15) { const [x, z] = polar(2, 6); cloud(s, x, R(0, SL), z, R(5, 9), R(.06, .14), M.tint); }
}
function objDoor(s, M, x, dy, z, k, spin) {
  const g = new THREE.Group(); g.position.set(x, -dy, z); g.scale.setScalar(k);
  const a = new THREE.Mesh(GEO.box, M.wood); a.scale.set(1, 2.1, 0.08); g.add(a);
  const b = new THREE.Mesh(GEO.box, M.neonA); b.scale.set(1.08, 0.05, 0.1); b.position.y = 1.075; g.add(b);
  const c = new THREE.Mesh(GEO.sph, M.brass); c.scale.setScalar(0.06); c.position.set(0.36, 0, 0.07); g.add(c);
  return g;
}
function objWindow(s, M, x, dy, z, k) {
  const g = new THREE.Group(); g.position.set(x, -dy, z); g.scale.setScalar(k);
  const f = new THREE.Mesh(GEO.box, M.paper); f.scale.set(1.2, 1.6, 0.1); g.add(f);
  const p = new THREE.Mesh(GEO.box, rnd() < .5 ? M.neonA : M.neonB); p.scale.set(1.0, 1.4, 0.12); g.add(p);
  return g;
}
function objChair(s, M, x, dy, z, k) {
  const g = new THREE.Group(); g.position.set(x, -dy, z); g.scale.setScalar(k);
  const seat = new THREE.Mesh(GEO.box, M.brick); seat.scale.set(.5, .06, .5); g.add(seat);
  const back = new THREE.Mesh(GEO.box, M.brick); back.scale.set(.5, .6, .06); back.position.set(0, .33, -.22); g.add(back);
  for (const [lx, lz] of [[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]]) { const l = new THREE.Mesh(GEO.box, M.wood); l.scale.set(.05, .45, .05); l.position.set(lx, -.25, lz); g.add(l); }
  return g;
}
function objBed(s, M, x, dy, z, k) {
  const g = new THREE.Group(); g.position.set(x, -dy, z); g.scale.setScalar(k);
  const m = new THREE.Mesh(GEO.box, M.blue); m.scale.set(1.0, .3, 2.0); g.add(m);
  const p = new THREE.Mesh(GEO.box, M.paper); p.scale.set(.6, .14, .4); p.position.set(0, .22, -.7); g.add(p);
  const h = new THREE.Mesh(GEO.box, M.wood); h.scale.set(1.05, .7, .08); h.position.set(0, .2, -1.02); g.add(h);
  return g;
}
function objClock(s, M, x, dy, z, k) {
  const g = new THREE.Group(); g.position.set(x, -dy, z); g.scale.setScalar(k);
  const f = new THREE.Mesh(GEO.cyl, M.neonB); f.scale.set(1, .1, 1); f.rotation.x = Math.PI / 2; g.add(f);
  const h1 = new THREE.Mesh(GEO.box, M.cable); h1.scale.set(.07, .7, .05); h1.position.set(0, .3, .1); g.add(h1);
  const h2 = new THREE.Mesh(GEO.box, M.cable); h2.scale.set(.05, .5, .05); h2.position.set(.2, 0, .1); h2.rotation.z = -1.2; g.add(h2);
  return g;
}
function buildDebris(s, act) {
  const M = mats(act);
  const n = 4 + ((rnd() * 3) | 0);
  const chaos = 1 + clamp(torsoW / 6, 0, 2);
  for (let i = 0; i < n; i++) {
    const k = R(1.2, 5), rmin = SOLID_MIN + k * 1.4, [x, z] = polar(rmin, rmin + R(8, 60)), dy = R(0, SL);
    const g = pick([objDoor, objWindow, objChair, objBed, objClock])(s, M, x, dy, z, k);
    g.rotation.set(R(0, TAU), R(0, TAU), R(0, TAU));
    s.g.add(g); s.spin.push({ o: g, w: new V3(R(-.5, .5)*chaos, R(-.5, .5)*chaos, R(-.4, .4)*chaos) });
  }
  for (let i = 0; i < 5; i++) { const [x, z] = polar(18, 200); cloud(s, x, R(0, SL), z, R(40, 130), R(.1, .32), M.tint); }
  for (let i = 0; i < 2; i++) { const [x, z] = polar(3, 26); cloud(s, x, R(0, SL), z, R(6, 14), R(.08, .2), M.tint); }
  if (rnd() < 0.18) hoop(s, M, R(4, SL - 4), 9, 15);
}
const BUILD = { sky: buildSky, canyon: buildCanyon, shaft: buildShaft, debris: buildDebris };

function buildSlab(act, depth) {
  const s = newSlab(depth, act);
  BUILD[act.type](s, act); act.slabN++;
}
function removeSlab(s) {
  world.remove(s.g);
  s.sprites.forEach(sp => sp.material.dispose());
}

/* ------------------------------------------------------------ the floors
   A floor is one polar-gridded plane with a procedural night-lit surface (a city, a sea, or fields). It rises
   out of the haze, then dissolves: it goes to mist and tears open in patches well before it reaches the body. */
function polarGrid(nr, ns, r0, growth) {
  const pos = new Float32Array((nr + 1) * ns * 3); let k = 0;
  for (let i = 0; i <= nr; i++) { const r = r0 * Math.pow(growth, i); for (let j = 0; j < ns; j++) { const a = j / ns * TAU; pos[k++] = Math.cos(a) * r; pos[k++] = 0; pos[k++] = Math.sin(a) * r; } }
  const idx = [];
  for (let i = 0; i < nr; i++) for (let j = 0; j < ns; j++) {
    const a = i * ns + j, b = i * ns + (j + 1) % ns, c = (i + 1) * ns + j, d = (i + 1) * ns + (j + 1) % ns;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new V3(), 1e5);
  return g;
}
const GROUND_LOOK = {
  city:   { a: new C3('#ffb45a'), b: new C3('#7fd8ff'), t: 0 },
  sea:    { a: new C3('#3d7f95'), b: new C3('#eaf6ff'), t: 1 },
  fields: { a: new C3('#7b8a3a'), b: new C3('#c9803a'), t: 2 }
};
function makeGround(kind) {
  const look = GROUND_LOOK[kind];
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
    uniforms: { uType: { value: look.t }, uFade: { value: 1 }, uTime: G.time, uKeep: G.keep,
                uCA: { value: look.a }, uCB: { value: look.b }, uFogColor: G.fogColor, uFogNear: G.fogNear, uFogFar: G.fogFar,
                uPred: { value: new THREE.Vector2() }, 
                uWarpDepth: { value: 500.0 }, uWarpTwist: { value: 0.0 }, 
                uWarpNoise: { value: 0.0 }, uWarpTear: { value: 0.0 },
                uAnticipation: { value: 0.0 } },
    vertexShader: `varying vec3 vW; uniform float uKeep; uniform float uFade;
      uniform vec2 uPred; uniform float uWarpDepth; uniform float uWarpTwist;
      uniform float uWarpNoise; uniform float uWarpTear; uniform float uAnticipation;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        if (length(wp.xz) < uKeep) wp.xz = normalize(wp.xz + vec2(0.0001, 0.0)) * uKeep;
        
        vec2 target = uPred;
        float dist = length(wp.xz - target);
        
        float radius = mix(50.0, 350.0, uAnticipation);
        float hole = smoothstep(radius, 0.0, dist) * uAnticipation;
        
        if (uWarpTear > 0.0) {
          vec2 dir = length(target) > 0.1 ? normalize(target) : vec2(1.0, 0.0);
          vec2 perp = vec2(-dir.y, dir.x);
          float sideDist = abs(dot(wp.xz - target, perp));
          float tearHole = smoothstep(150.0, 0.0, sideDist) * hole;
          wp.xz += sign(dot(wp.xz - target, perp)) * perp * tearHole * uWarpTear;
        }
        
        if (uWarpTwist > 0.0) {
          float twist = hole * uWarpTwist;
          float c = cos(twist); float s = sin(twist);
          wp.xz = target + vec2((wp.x-target.x) * c - (wp.z-target.y) * s, (wp.x-target.x) * s + (wp.z-target.y) * c);
        }
        
        if (uWarpNoise > 0.0) {
          float n1 = hash(wp.xz);
          float n2 = hash(wp.xz + vec2(13.3, 17.7));
          wp.y += (n1 - 0.5) * hole * uWarpNoise;
          wp.xz += (vec2(n1, n2) - 0.5) * hole * (uWarpNoise * 0.4);
        }
        
        wp.y -= hole * uWarpDepth;
        
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `varying vec3 vW;
      uniform float uType; uniform float uFade; uniform float uTime;
      uniform vec3 uCA; uniform vec3 uCB; uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      vec3 city(vec2 p, float det){
        vec2 g = p / 26.0; vec2 f = fract(g); vec2 id = floor(g);
        float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
        float street = 1.0 - smoothstep(0.02, 0.07, edge);
        float inb = smoothstep(0.09, 0.15, edge);
        vec2 q = floor(p / 2.6);
        float lit = step(0.70, h21(q)) * inb;
        vec3 lc = mix(uCA, uCB, h21(q + 9.0));
        float bh = h21(id + 4.0);
        vec3 base = vec3(0.012, 0.014, 0.03);
        vec3 c = base + uCA * street * (0.35 + 0.65 * h21(floor(p / 7.0))) * 0.9 + lc * lit * (0.5 + 1.2 * bh);
        vec3 avg = base + uCA * 0.16 + uCB * 0.05;
        float river = 1.0 - smoothstep(0.0, 0.05, abs(sin(p.x * 0.0021 + sin(p.y * 0.0013) * 1.7)));
        c = mix(c, vec3(0.01, 0.02, 0.05) + uCB * 0.05 * n2(p * 0.04 + uTime), river * det);
        return mix(avg, c, det);
      }
      vec3 sea(vec2 p, float det){
        float w = 0.6 * n2(p * 0.05 + uTime * 0.25) + 0.4 * n2(p * 0.17 - uTime * 0.35);
        vec3 c = mix(vec3(0.01, 0.025, 0.06), uCA * 0.30, w);
        float gl = step(0.986, h21(floor(p * 0.55) + floor(uTime * 1.5)));
        c += uCB * gl * 1.4 * det;
        c += uCB * exp(-abs(p.x) * 0.006) * (0.4 + 0.6 * w) * 0.28;
        return c;
      }
      vec3 fields(vec2 p, float det){
        vec2 g = p / 90.0; vec2 id = floor(g); float h = h21(id);
        vec3 c = mix(uCA, uCB, h) * 0.30;
        float stripe = 0.85 + 0.15 * sin(dot(p, vec2(0.6, 0.8)) * 0.9 + h * 30.0);
        c *= mix(1.0, stripe, det);
        vec2 f = fract(g); float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
        c = mix(c, vec3(0.05, 0.04, 0.03), (1.0 - smoothstep(0.0, 0.012, edge)) * det);
        c += vec3(1.0, 0.75, 0.4) * step(0.995, h21(floor(p / 9.0))) * det;
        return c;
      }
      void main(){
        float dist = distance(cameraPosition, vW);
        float det = 1.0 - smoothstep(120.0, 700.0, dist);
        vec2 p = vW.xz;
        vec3 c;
        if (uType < 0.5) c = city(p, det); else if (uType < 1.5) c = sea(p, det); else c = fields(p, det);
        float a = smoothstep(0.0, 0.25, uFade * 1.35 - n2(p * 0.018) * 0.55);
        c = mix(uFogColor, c, smoothstep(0.0, 0.55, uFade));
        c = mix(c, uFogColor, smoothstep(uFogNear, uFogFar, dist));
        gl_FragColor = vec4(c, a);
      }`
  });
  const m = new THREE.Mesh(polarGrid(100, 80, 2, 1.076), mat);
  m.frustumCulled = false; m.renderOrder = 5;
  return m;
}

let impactState = 0; // > 0 means we hit the floor and are tumbling through it

function serviceGrounds() {
  for (const a of plan) {
    const g = a.ground; if (!g || g.done) continue;
    const gd = a.end - D;                                   // metres between the body and this floor
    if (!g.created && gd < 1200) { 
      g.mesh = makeGround(g.type); 
      g.mesh.position.set(worldX, -a.end, worldZ); 
      world.add(g.mesh); 
      g.created = true; 
      // 25% chance of real solid impact, 35% chance of extremely late opening, 40% chance of standard escape
      g.outcome = rnd() < 0.25 ? 'impact' : (rnd() < 0.55 ? 'late' : 'escape');
    }
    if (g.created) {
      g.mesh.material.uniforms.uFade.value = smooth(22, 190, gd);
      
      const t = gd > 0 ? gd / Math.max(U, 1) : 0;
      g.mesh.material.uniforms.uPred.value.set(Ux * t, Uz * t);
      
      const escalation = clamp(floorsEscaped / 8.0, 0, 1);
      
      let triggerDist;
      if (g.outcome === 'impact') triggerDist = -100; // never warp visually until hit
      else if (g.outcome === 'late') triggerDist = 90; // extremely late opening
      else triggerDist = lerp(900, 250, escalation);
      
      let anticipation = smooth(triggerDist, -50, gd);
      
      // If we are currently experiencing an impact state on this floor, blow it up
      if (impactState > 0 && g.impacted) {
         anticipation = 1.0;
         g.mesh.material.uniforms.uWarpDepth.value = 3000;
         g.mesh.material.uniforms.uWarpTear.value = 200;
         g.mesh.material.uniforms.uWarpNoise.value = 5000;
      } else {
         g.mesh.material.uniforms.uWarpDepth.value = 500 + 400 * escalation;
         const speedExcess = Math.max(0, U - 60);
         g.mesh.material.uniforms.uWarpNoise.value = (speedExcess * 20.0) + (escalation * 500.0);
         const driftSpeed = Math.hypot(Ux, Uz);
         g.mesh.material.uniforms.uWarpTear.value = driftSpeed * 15.0;
      }
      
      g.mesh.material.uniforms.uAnticipation.value = anticipation;
      g.mesh.material.uniforms.uWarpTwist.value = torsoW * 4.0;

      g.mesh.visible = gd > 8 || anticipation > 0.01;
      
      // Check for physical hit
      if (gd < 0.5 && !g.impacted && g.outcome === 'impact') {
         g.impacted = true;
         impactState = 1.2; // 1.2 seconds of tumbling through the shattered floor
         U = -U * 0.4; // Bounce up
         Ux += R(-30, 30); Uz += R(-30, 30); // Violent tumble
         fireKick(15);
         floorsEscaped++;
      }
      
      // Track passing the floor for abstraction calculation
      if (gd < 0 && !g.passedMark) {
         g.passedMark = true;
         passedFloorD = a.end;
      }
      
      if (gd < -30) { world.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); g.done = true; if (g.outcome !== 'impact') floorsEscaped++; }
    }
  }
}
function nearestFloorGap() {
  let best = Infinity;
  for (const a of plan) if (a.ground && a.ground.created && !a.ground.done) best = Math.min(best, a.end - D);
  return best;
}
function forceFloor() {
  const X = D + 900;
  const idx = plan.findIndex(a => X < a.end);
  if (idx < 0) return;
  const a = plan[idx];
  if (a.ground) return;                                     // a floor is already on its way
  if (a.start > X - 300) return;
  a.end = X; a.ground = { type: pick(['city', 'sea', 'fields']), mesh: null, created: false, done: false };
  plan.length = idx + 1; sinceGround = 0;
}

/* --------------------------------------------------------- streaming + env */
function streamWorld() {
  ensurePlan(D + 1400);
  while (genDepth < D + GEN_DIST) { buildSlab(actAt(genDepth), genDepth); genDepth += SL; }
  while (slabs.length && D - slabs[0].depth > KEEP_UP + SL) removeSlab(slabs.shift());
  serviceGrounds();
  while (plan.length > 3 && plan[1].end < D - KEEP_UP - 400) {
    const oldAct = plan.shift();
    if (oldAct.M) {
      Object.values(oldAct.M).forEach(m => {
        if (Array.isArray(m)) m.forEach(mm => mm.dispose());
        else if (m.dispose) m.dispose();
      });
    }
  }
}
let densTarget = 1, dens = 1, arousal = 0.4;
let timeToImpact = 999;

// --- Perception Glitch System ---
const glitchTypes = ['uDesat', 'uInvert', 'uDots', 'uThermal', 'uEdge'];
let activeGlitches = [];
let nextGlitchTime = 0;

function updateGlitches(dt) {
    let prob = 0.05 * dt; // Base probability of a glitch happening
    if (timeToImpact < 3.0) prob += 0.4 * dt; 
    if (torsoW > 2.0) prob += 0.2 * dt; 
    
    // Impact guarantees an immediate invert flash, bypassing the timer
    if (impactState > 0 && activeGlitches.filter(g => g.type === 'uInvert').length === 0 && rnd() < 0.5) {
        activeGlitches.push({ type: 'uInvert', duration: R(0.05, 0.2), fadeIn: 0.01, fadeOut: 0.1, intensity: 1.0, age: 0 });
    }
    
    if (simT > nextGlitchTime && rnd() < prob) {
        let type = pick(glitchTypes);
        
        let intensity = R(0.2, 1.0);
        if (rnd() < 0.3) intensity *= 0.3; // 30% chance for a very subtle, almost unnoticeable effect
        
        let duration = R(0.5, 4.0);
        let fadeIn = R(0.1, 1.0);
        let fadeOut = R(0.1, 2.0);
        
        if (type === 'uInvert' && rnd() < 0.8) {
            // Inverts are usually aggressive flashes
            duration = R(0.05, 0.2);
            fadeIn = 0.01;
            fadeOut = 0.1;
            intensity = 1.0;
        }

        activeGlitches.push({ type, duration, fadeIn, fadeOut, intensity, age: 0 });
        nextGlitchTime = simT + R(1.0, 5.0); // Minimum cooldown between randomly spawning glitches
    }
    
    let currentVals = { uDesat: 0, uInvert: 0, uDots: 0, uThermal: 0, uEdge: 0 };
    
    for (let i = activeGlitches.length - 1; i >= 0; i--) {
        let g = activeGlitches[i];
        g.age += dt;
        
        let totalLife = g.fadeIn + g.duration + g.fadeOut;
        if (g.age >= totalLife) {
            activeGlitches.splice(i, 1);
            continue;
        }
        
        let env = 1.0;
        if (g.age < g.fadeIn) {
            env = g.age / g.fadeIn;
        } else if (g.age > g.fadeIn + g.duration) {
            env = 1.0 - ((g.age - g.fadeIn - g.duration) / g.fadeOut);
        }
        
        env = smooth(0, 1, env);
        currentVals[g.type] = Math.max(currentVals[g.type], g.intensity * env);
    }
    
    if (perceptionPasses.length > 0) {
        for (const pass of perceptionPasses) {
            pass.uniforms.uDesat.value = currentVals.uDesat;
            pass.uniforms.uInvert.value = currentVals.uInvert;
            pass.uniforms.uDots.value = currentVals.uDots;
            pass.uniforms.uThermal.value = currentVals.uThermal;
            pass.uniforms.uEdge.value = currentVals.uEdge;
        }
    }
}
// --------------------------------

function updateEnv(dt) {
  const a = actAt(D), i = plan.indexOf(a), b = plan[i + 1];
  const bs = a.ground ? a.end - 780 : a.end - 70;
  const t = b ? smooth(bs, a.end + 40, D) : 0;
  blendPal(PALC[a.pal], PALC[(b || a).pal], t);
  const fa = FOG_BASE[a.type], fb = FOG_BASE[(b || a).type];
  let near = lerp(fa[0], fb[0], t), far = lerp(fa[1], fb[1], t);
  const gd = nearestFloorGap();
  timeToImpact = gd < 1e8 ? gd / Math.max(U, 1) : 999;
  
  const approach = smooth(1000, 350, gd < 1e8 ? 1350 - gd : 0) ;            // 0 far away .. 1 close
  const gApp = gd < 1e8 ? 1 - smooth(300, 1000, gd) : 0;
  
  // Dread effects on visibility
  const dread = 1 - smooth(0, 3.0, timeToImpact); // spikes when 3 seconds away
  far = lerp(far, 1150 + 2000 * dread, gApp); // allow seeing the ground starkly when close
  near = lerp(near, near * 0.2, dread);
  
  const db = Math.min(Math.abs(D - a.start), Math.abs(D - a.end));
  const spike = 1 - smooth(0, 70, db);
  far = lerp(far, 85, spike * 0.9); near = lerp(near, 2, spike);
  scene.fog.color.copy(cur.fog); scene.fog.near = near; scene.fog.far = far;
  G.fogColor.value.copy(cur.fog); G.fogNear.value = near; G.fogFar.value = far;
  sun.color.copy(cur.sun); sun.intensity = cur.sunI; sun.position.copy(cur.sunDir).multiplyScalar(100);
  hemi.color.copy(cur.hemiS); hemi.groundColor.copy(cur.hemiG); hemi.intensity = cur.hemiI;
  skyMat.uniforms.uStars.value = cur.stars;
      // air thickness by place: shafts slow the fall, floors approaching speed it up
      const bias = { sky: 0.85, canyon: 1.0, shaft: 1.5, debris: 1.0 };
      densTarget = lerp(bias[a.type], bias[(b || a).type], t) * lerp(1, 0.62, gApp);
      dens += (densTarget - dens) * (1 - Math.exp(-dt * 0.6));
      const introRamp = smooth(0, 10, simT);
      arousal = clamp((0.38 + 0.62 * gApp) * introRamp, 0.05, 1);
      
      // updateGlitches replaces the old direct coupling
      updateGlitches(dt);
    }

/* ========================================================================= BODY */
const NP = 13;
const IX = { HEAD:0, SHL:1, SHR:2, HPL:3, HPR:4, ELL:5, ELR:6, HDL:7, HDR:8, KNL:9, KNR:10, FTL:11, FTR:12 };
const REST = [
  [0,.77,-.02], [-.20,.52,0], [.20,.52,0], [-.10,0,0], [.10,0,0],
  [-.24,.25,0], [.24,.25,0], [-.26,-.01,0], [.26,-.01,0],
  [-.11,-.45,0], [.11,-.45,0], [-.11,-.89,0], [.11,-.89,0]
];
const BASE_M = [5, 6, 6, 7, 7, 1.8, 1.8, .9, .9, 4, 4, 1.6, 1.6];
const MASS = BASE_M.map(m => m * 90 / BASE_M.reduce((a, b) => a + b, 0));
const TOTAL_M = MASS.reduce((a, b) => a + b, 0);
const P = [], O = [], F = [], REL = [];
for (let i = 0; i < NP; i++) { P.push(new V3()); O.push(new V3()); F.push(new V3()); REL.push(new V3()); }
const rv = i => new V3().fromArray(REST[i]);
const CONS = [];
const con = (a, b, lo, hi) => CONS.push({ a, b, lo, hi: hi === undefined ? lo : hi, wa: 1 / MASS[a], wb: 1 / MASS[b] });
const rd = (a, b) => rv(a).distanceTo(rv(b));
{
  const { HEAD, SHL, SHR, HPL, HPR, ELL, ELR, HDL, HDR, KNL, KNR, FTL, FTR } = IX;
  for (const [a, b] of [[SHL,SHR],[HPL,HPR],[SHL,HPL],[SHR,HPR],[SHL,HPR],[SHR,HPL]]) con(a, b, rd(a, b));   // rigid torso
  con(HEAD, SHL, rd(HEAD, SHL)); con(HEAD, SHR, rd(HEAD, SHR));                                              // neck pivot
  con(HEAD, HPL, 0.58, 0.80); con(HEAD, HPR, 0.58, 0.80);                                                     // neck range
  for (const [s, e, h] of [[SHL, ELL, HDL], [SHR, ELR, HDR]]) { con(s, e, rd(s, e)); con(e, h, rd(e, h)); con(s, h, 0.09, rd(s, e) + rd(e, h)); }
  for (const [s, e, h] of [[HPL, KNL, FTL], [HPR, KNR, FTR]]) { con(s, e, rd(s, e)); con(e, h, rd(e, h)); con(s, h, 0.12, rd(s, e) + rd(e, h)); }
  con(KNL, KNR, 0.10, 2); con(HDL, HDR, 0.10, 2);
}
const SEGS = [ [IX.SHL, IX.ELL], [IX.ELL, IX.HDL], [IX.SHR, IX.ELR], [IX.ELR, IX.HDR],
               [IX.HPL, IX.KNL], [IX.KNL, IX.FTL], [IX.HPR, IX.KNR], [IX.KNR, IX.FTR] ];
const SEG_LEN = SEGS.map(([a, b]) => rd(a, b));
// aerodynamics, in kg/m: 0.5 * rho * Cd * area, tuned down to allow tumbling instead of rigid skydiving
const C_HEAD = 0.02, C_PLATE = 0.09, C_SKIN = 0.02, C_SEG = 0.04, C_AX = 0.01;

// pose the arms/legs are nudged towards, in torso-local axes (x right, y toward head, z toward the back)
const nv = (x, y, z) => new V3(x, y, z).normalize();
const CALM = { ua: [nv(-.15,-.99,0), nv(.15,-.99,0)], fa: [nv(-.08,-1,0), nv(.08,-1,0)], th: [nv(-.02,-1,0), nv(.02,-1,0)], sh: [nv(0,-1,0), nv(0,-1,0)] };
const SPREAD = { ua: [nv(-1,.30,.45), nv(1,.30,.45)], fa: [nv(-.45,.95,.6), nv(.45,.95,.6)], th: [nv(-.40,-1,.35), nv(.40,-1,.35)], sh: [nv(-.25,-.45,1), nv(.25,-.45,1)] };
const DIVE = { ua: [nv(-.2,-.95,.2), nv(.2,-.95,.2)], fa: [nv(-.1,-1,0), nv(.1,-1,0)], th: [nv(-.1,-.95,.1), nv(.1,-.95,.1)], sh: [nv(0,-1,0), nv(0,-1,0)] };

let simT = 0, U = 4, Ux = 0, Uz = 0, diveBlend = 0;                     // U = fall speed, m/s
let worldX = 0, worldZ = 0;
let isFlipped = false, neckPitch = 0, neckYaw = 0;
const frame = { right: new V3(1,0,0), up: new V3(0,1,0), back: new V3(0,0,1), q: new Q4(), pelvis: new V3(), shMid: new V3() };
const _a = new V3(), _b = new V3(), _c = new V3(), _d = new V3(), _m4 = new THREE.Matrix4();

function torsoFrame() {
  frame.pelvis.addVectors(P[IX.HPL], P[IX.HPR]).multiplyScalar(.5);
  frame.shMid.addVectors(P[IX.SHL], P[IX.SHR]).multiplyScalar(.5);
  frame.up.subVectors(frame.shMid, frame.pelvis).normalize();
  _a.subVectors(P[IX.SHR], P[IX.SHL]);
  frame.right.copy(_a).addScaledVector(frame.up, -_a.dot(frame.up)).normalize();
  frame.back.crossVectors(frame.right, frame.up);
  _m4.makeBasis(frame.right, frame.up, frame.back);
  frame.q.setFromRotationMatrix(_m4);
}
// initial pose: belly-down, looking at the ground
(function init() {
  const q = new Q4().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const com = new V3();
  for (let i = 0; i < NP; i++) { P[i].copy(rv(i)).applyQuaternion(q); com.addScaledVector(P[i], MASS[i]); }
  com.multiplyScalar(1 / TOTAL_M);
  const w = new V3(0.9, 0.3, 0.4);
  for (let i = 0; i < NP; i++) { P[i].sub(com); O[i].copy(P[i]).addScaledVector(new V3().crossVectors(w, P[i]), -1 / 120); }
  torsoFrame();
})();

/* wind: smooth swirling gusts plus occasional hard shear kicks that throw the body into a tumble */
const kick = { on: false, t: 0, dur: .4, amp: 0, dir: new V3(), axis: new V3() };
let nextKick = 4;
function fireKick(power) {
  kick.on = true; kick.t = 0; kick.dur = R(.3, .6); kick.amp = R(15, 28) * power;
  kick.dir.set(R(-1, 1), R(-.6, .6), R(-1, 1)).normalize(); kick.axis.set(R(-1, 1), R(-1, 1), R(-1, 1)).normalize();
}
function windAt(p, out, gustA) {
  const t = simT;
  out.set(
    gustA * (Math.sin(t * .71 + p.y * 1.1) + .6 * Math.sin(t * 1.93 + p.z * 1.7 + 1.3)),
    gustA * .5 * (Math.sin(t * .53 + p.x * 1.3 + 2.0) + .6 * Math.sin(t * 2.3 + p.z * 1.1)),
    gustA * (Math.sin(t * .61 + p.x * 1.2 + 4.1) + .6 * Math.sin(t * 2.1 + p.y * 1.5 + .5)));
  if (kick.on) {
    const env = Math.sin(Math.PI * clamp(kick.t / kick.dur, 0, 1));
    const g = clamp(.5 + .55 * p.dot(kick.axis) / .8, 0, 1);
    out.addScaledVector(kick.dir, kick.amp * env * g);
  }
}
let torsoW = 0;                     // measured angular speed of the torso, rad/s
const qPrev = new Q4();

/* ---- posture control -------------------------------------------------------
   W/S/A/D no longer push the body with raw forces (that just winds up spin, and nothing stops it).
   They pick a target attitude: pitch (W dives head-first, S flares) and roll (A/D bank). A PD controller
   then applies a torque couple to the torso to move it there and hold it. With no keys held the target is
   belly-to-earth, and the controller's strength follows the Limpness slider, so the body still gets thrown
   about by gusts and shoves but tends to recover to a face-down view of the ground. */
const AIM = { pitch: 0, roll: 0, auth: 0.3 };
const heading = new V3(0, 0, -1), omega = new V3(), qAim = new Q4();
const _tq = new Q4(), _tq2 = new Q4(), _e = new V3(), _al = new V3(), _rc = new V3(), _hh = new V3();
const _ax = new V3(), _ay = new V3(), _az = new V3(), _mm = new THREE.Matrix4(), WORLD_Y = new V3(0, 1, 0);
const TORSO = [IX.SHL, IX.SHR, IX.HPL, IX.HPR];
const KP = 4, KD = 2, A_MAX = 20;
const HEAD_RANGE = 1.15, NECK_LEN = 0.25;               // rad/s^2 per rad of error, per rad/s of spin, and a cap
function steer(dt) {
  const k = (typeof keys !== 'undefined') ? keys : {};
  const diveX = clamp((k.d || 0) - (k.a || 0) + (k.vDiveX || 0), -1, 1);
  const diveZ = clamp((k.s || 0) - (k.w || 0) + (k.vDiveZ || 0), -1, 1);   // W (or drag up) = -1 = dive
  const dx = (k.arrowright || 0) - (k.arrowleft || 0), dz = (k.arrowdown || 0) - (k.arrowup || 0);
  const steering = diveX !== 0 || diveZ !== 0;

  // arrow keys: clumsy sideways drift, eased towards a modest speed instead of a huge force
  let targetPosture = diveBlend;
  if (dx !== 0) Ux += (dx * 18 - Ux) * (1 - Math.exp(-dt * 1.5));
  if (dz !== 0) Uz += (dz * 18 - Uz) * (1 - Math.exp(-dt * 1.5));
  if (dx !== 0 || dz !== 0) targetPosture = 0;
  if (steering) targetPosture = 1;
  diveBlend = lerp(diveBlend, targetPosture, 1 - Math.exp(-dt * 6));

  // where the head points on the horizontal, kept while the body is not near vertical
  _hh.set(frame.up.x, 0, frame.up.z);
  const hl = _hh.length();
  if (hl > 0.4) heading.lerp(_hh.multiplyScalar(1 / hl), 1 - Math.exp(-dt * 1.5)).normalize();

  // target attitude
  const goalPitch = diveZ < 0 ? -diveZ * 1.1 : -diveZ * 0.6, goalRoll = diveX * 0.9;
  AIM.pitch += (goalPitch - AIM.pitch) * (1 - Math.exp(-dt * 5));
  AIM.roll  += (goalRoll  - AIM.roll)  * (1 - Math.exp(-dt * 5));
  const ct = Math.cos(AIM.pitch), st = Math.sin(AIM.pitch), sgn = isFlipped ? -1 : 1;
  _ay.copy(heading).multiplyScalar(ct).addScaledVector(WORLD_Y, -st);                       // head direction
  _az.copy(WORLD_Y).multiplyScalar(ct).addScaledVector(heading, st).multiplyScalar(sgn);    // back direction
  _tq.setFromAxisAngle(_ay, AIM.roll); _az.applyQuaternion(_tq);
  _ax.crossVectors(_ay, _az).normalize();
  _mm.makeBasis(_ax, _ay, _az); qAim.setFromRotationMatrix(_mm);

  // how firmly the controller holds: fully when steering, otherwise extremely weak to allow tumbling
  const idle = 0.2 * (1 - S.limp);
  AIM.auth += ((steering ? 1 : idle) - AIM.auth) * (1 - Math.exp(-dt * 6));
  if (AIM.auth < 0.005) return;

  // rotation error, then angular acceleration = auth * (KP * error - KD * spin)
  _tq.copy(qAim).multiply(_tq2.copy(frame.q).invert());
  if (_tq.w < 0) { _tq.x = -_tq.x; _tq.y = -_tq.y; _tq.z = -_tq.z; _tq.w = -_tq.w; }
  const sh = Math.hypot(_tq.x, _tq.y, _tq.z);
  if (sh > 1e-7) _e.set(_tq.x, _tq.y, _tq.z).multiplyScalar(2 * Math.atan2(sh, _tq.w) / sh); else _e.set(0, 0, 0);
  _al.copy(_e).multiplyScalar(KP).addScaledVector(omega, -KD).multiplyScalar(AIM.auth);
  if (_al.length() > A_MAX) _al.multiplyScalar(A_MAX / _al.length());

  // apply as a force couple on the four torso particles (zero net force about their own centre of mass)
  _rc.set(0, 0, 0); let mt = 0;
  for (const i of TORSO) { _rc.addScaledVector(P[i], MASS[i]); mt += MASS[i]; }
  _rc.multiplyScalar(1 / mt);
  for (const i of TORSO) { _ax.subVectors(P[i], _rc); F[i].addScaledVector(_ay.crossVectors(_al, _ax), MASS[i]); }
}
function physicsStep(dt) {
  simT += dt;
  G.time.value += dt;
  if (simT > nextKick) { fireKick(S.gust * (.5 + .7 * arousal)); nextKick = simT + R(2.2, 5.4) / Math.max(.25, S.gust * (.4 + arousal)); }
  if (kick.on) { kick.t += dt; if (kick.t > kick.dur) kick.on = false; }
  torsoFrame();
  const gustA = 4 * S.gust * (.3 + .7 * arousal);
  const c = dens;
      for (let i = 0; i < NP; i++) {
        F[i].set(0, 0, 0);
        windAt(P[i], _a, gustA);
        REL[i].subVectors(P[i], O[i]).multiplyScalar(1 / dt);
        REL[i].x += Ux;
        REL[i].y -= U;                                        // the body is moving down through still air
        REL[i].z += Uz;
        REL[i].sub(_a);
      }
  // head
  { const r = REL[IX.HEAD], s = r.length(); F[IX.HEAD].addScaledVector(r, -C_HEAD * c * s); }
  // torso: a flat plate, with skin drag on the edges
  const n = _d.copy(frame.back);
  for (const i of [IX.SHL, IX.SHR, IX.HPL, IX.HPR]) {
    const r = REL[i], rn = r.dot(n);
    F[i].addScaledVector(n, -(C_PLATE / 4) * c * rn * Math.abs(rn));
    F[i].addScaledVector(r, -(C_SKIN / 4) * c * r.length());
  }
  // limbs: cylinders in cross-flow
  for (let k = 0; k < SEGS.length; k++) {
    const [a, b] = SEGS[k], L = SEG_LEN[k];
    _b.subVectors(P[b], P[a]).normalize();
    _c.addVectors(REL[a], REL[b]).multiplyScalar(.5);
    const ax = _c.dot(_b);
    const perp = _a.copy(_c).addScaledVector(_b, -ax);
    const fp = -C_SEG * c * L * perp.length() * .5, fa = -C_AX * c * L * Math.abs(ax) * ax * .5;
    F[a].addScaledVector(perp, fp).addScaledVector(_b, fa);
    F[b].addScaledVector(perp, fp).addScaledVector(_b, fa);
  }
  
  // steering asks for a posture; a damped controller turns the torso towards it (see steer())
  steer(dt);

  // the falling frame carries the mean acceleration away; each particle keeps only its difference
  const Ft = _c.set(0, 0, 0);
  for (let i = 0; i < NP; i++) Ft.add(F[i]);
  Ux += (Ft.x / TOTAL_M) * dt;
  Uz += (Ft.z / TOTAL_M) * dt;
  U = clamp(U + (9.81 - Ft.y / TOTAL_M) * dt, 0, 100);
  const dtt = dt * dt, damp = Math.exp(-0.25 * dt);
  
  // Array of active colliders to test against
  const activeCols = [];
  for (const s of slabs) {
    if (s.depth - D > -100 && s.depth - D < 300) {
      activeCols.push(...s.colliders);
    }
  }

  for (let i = 0; i < NP; i++) {
    const p = P[i], o = O[i];
    const ax = F[i].x / MASS[i] - Ft.x / TOTAL_M, ay = F[i].y / MASS[i] - Ft.y / TOTAL_M, az = F[i].z / MASS[i] - Ft.z / TOTAL_M;
    const vx = (p.x - o.x) * damp, vy = (p.y - o.y) * damp, vz = (p.z - o.z) * damp;
    o.copy(p);
    p.x += vx + ax * dtt; p.y += vy + ay * dtt; p.z += vz + az * dtt;
    
    // Collision detection against active colliders
    const pr = 0.25; // particle radius
    const W_POS = new V3(p.x + worldX, p.y - D, p.z + worldZ); // Particle in world local space
    let hit = false;
    let hitN = new V3();
    
    for (const c of activeCols) {
      if (c.type === 'box') {
        // Transform particle to box local space using box's local matrix
        const mInv = new THREE.Matrix4().copy(c.m.matrix).invert();
        const locP = W_POS.clone().applyMatrix4(mInv);
        // AABB distance
        const dx = Math.max(Math.abs(locP.x) - c.hw, 0);
        const dy = Math.max(Math.abs(locP.y) - c.hh, 0);
        const dz = Math.max(Math.abs(locP.z) - c.hd, 0);
        if (dx*dx + dy*dy + dz*dz < pr*pr) {
          // Push out
          let pdx = c.hw - Math.abs(locP.x);
          let pdy = c.hh - Math.abs(locP.y);
          let pdz = c.hd - Math.abs(locP.z);
          let minP = Math.min(pdx, pdy, pdz);
          let nL = new V3();
          if (minP === pdx) nL.x = Math.sign(locP.x) || 1;
          else if (minP === pdy) nL.y = Math.sign(locP.y) || 1;
          else nL.z = Math.sign(locP.z) || 1;
          
          locP.addScaledVector(nL, minP + pr);
          locP.applyMatrix4(c.m.matrix); // back to world local space
          p.x = locP.x - worldX; p.y = locP.y + D; p.z = locP.z - worldZ;
          hit = true;
          // approximate normal in world local space, then it maps 1:1 to global space
          hitN.copy(nL).transformDirection(c.m.matrix).normalize();
        }
      } else if (c.type === 'cable') {
        const ab = c.b.clone().sub(c.a);
        const ap = W_POS.clone().sub(c.a);
        let t = ap.dot(ab) / ab.lengthSq();
        t = Math.max(0, Math.min(1, t));
        const closest = c.a.clone().addScaledVector(ab, t);
        const distSq = W_POS.distanceToSquared(closest);
        const totalR = c.r + pr;
        if (distSq < totalR * totalR && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const n = W_POS.clone().sub(closest).multiplyScalar(1 / dist);
          const push = totalR - dist;
          W_POS.addScaledVector(n, push);
          p.x = W_POS.x - worldX; p.y = W_POS.y + D; p.z = W_POS.z - worldZ;
          hit = true;
          hitN.copy(n);
        }
      }
    }
    
    if (hit) {
      // Apply friction by modifying the old position (which drives velocity)
      // Velocity is (p - o), so moving o closer to p reduces velocity
      // Normal response: cancel velocity into the wall
      let vel = new V3(p.x - o.x, p.y - o.y, p.z - o.z);
      let vN = vel.dot(hitN);
      if (vN < 0) {
        vel.addScaledVector(hitN, -vN * 1.6); // bounce
        // Friction: reduce tangential velocity
        vel.multiplyScalar(0.3); // High friction!
        o.x = p.x - vel.x; o.y = p.y - vel.y; o.z = p.z - vel.z;
        // Fire a heavy gust kick to throw them off balance visually
        fireKick(3.5);
      }
    }
  }
  // muscle: nudge the limbs towards a pose, more firmly the less limp the body is
  const stiff = 1 - S.limp;
  if (stiff > 0.001) {
    const panic = smooth(0.2, 3.2, simT), k = 1 - Math.exp(-14 * stiff * dt);
    const fl = S.freedom * stiff * (0.4 + arousal), t = simT;
    const L = SEG_LEN;
    const dirs = (set, calm, i, ph) => {
      const d = _a.copy(calm[set][i]).lerp(SPREAD[set][i], panic);
      d.lerp(DIVE[set][i], diveBlend);
      if (isFlipped) d.z = -d.z;
      d.x += fl * Math.sin(t * 3.1 + ph); d.y += fl * Math.sin(t * 2.3 + ph * 1.7); d.z += fl * Math.sin(t * 4.2 + ph * .6);
      return d.normalize();
    };
    for (let s = 0; s < 2; s++) {
      const sh = s ? IX.SHR : IX.SHL, el = s ? IX.ELR : IX.ELL, hd = s ? IX.HDR : IX.HDL;
      const hp = s ? IX.HPR : IX.HPL, kn = s ? IX.KNR : IX.KNL, ft = s ? IX.FTR : IX.FTL;
      const fx = frame.right, fy = frame.up, fz = frame.back;
      const loc = (v, len) => _b.set(0, 0, 0).addScaledVector(fx, v.x * len).addScaledVector(fy, v.y * len).addScaledVector(fz, v.z * len);
      let d = dirs('ua', CALM, s, s * 2.1);        const eT = _c.copy(P[sh]).add(loc(d, L[s * 2]));
      P[el].lerp(eT, k);
      d = dirs('fa', CALM, s, s * 2.1 + 1);        const hT = _d.copy(P[el]).add(loc(d, L[s * 2 + 1]));
      P[hd].lerp(hT, k);
      d = dirs('th', CALM, s, s * 1.3 + 4);        const kT = _c.copy(P[hp]).add(loc(d, L[4 + s * 2]));
      P[kn].lerp(kT, k);
      d = dirs('sh', CALM, s, s * 1.3 + 5);        const fT = _d.copy(P[kn]).add(loc(d, L[5 + s * 2]));
      P[ft].lerp(fT, k);
    }
  }
  // neck muscles: hold the head where the gaze wants it, relative to the torso. Without this the wind folds a
  // light head back on its pivot during a head-first dive and the eyes end up looking at the horizon.
  { const hold = 0.25 + 0.75 * (1 - S.limp);
    
    // Fear look mechanic: stare straight down (at the threat) when timeToImpact gets low
    const panicLook = smooth(2.0, 0.4, timeToImpact);
    const lx = lerp(Ux, Ux * 0.1, panicLook) + 15 * Math.sin(simT * 0.7) * (1 - panicLook);
    const lz = lerp(Uz - U * 0.6, Uz * 0.1, panicLook) + 15 * Math.cos(simT * 0.9) * (1 - panicLook);
    const ly = -U * lerp(0.5, 1.2, panicLook);
    
    // bias the gaze slightly forward (so they can see the horizon, instead of staring straight down)
    _lk.set(lx, ly, lz).normalize(); if (isFlipped) _lk.multiplyScalar(-1);
    _lk.applyQuaternion(_tq2.copy(frame.q).invert());            // wanted gaze, in torso axes
    _nq.setFromUnitVectors(FACE, _lk);
    const wa = 2 * Math.acos(clamp(Math.abs(_nq.w), 0, 1));
    if (wa > HEAD_RANGE) _nq.set(0, 0, 0, 1).slerp(_lk_q.setFromUnitVectors(FACE, _lk), HEAD_RANGE / wa);
    _nq.premultiply(frame.q);                                    // head attitude in world axes
    _hh.set(0, NECK_LEN, 0).applyQuaternion(_nq).add(frame.shMid);
    P[IX.HEAD].lerp(_hh, 1 - Math.exp(-14 * hold * dt)); }
  // distance constraints
  for (let it = 0; it < 12; it++) {
    for (let k = 0; k < CONS.length; k++) {
      const c1 = CONS[k], A = P[c1.a], B = P[c1.b];
      _a.subVectors(B, A); const len = _a.length() || 1e-6;
      let target = len; if (len < c1.lo) target = c1.lo; else if (len > c1.hi) target = c1.hi; else continue;
      const diff = (len - target) / len, w = c1.wa + c1.wb;
      A.addScaledVector(_a, diff * c1.wa / w); B.addScaledVector(_a, -diff * c1.wb / w);
    }
  }
  // keep the centre of mass at the origin (positions and previous positions move together)
  _a.set(0, 0, 0);
  for (let i = 0; i < NP; i++) _a.addScaledVector(P[i], MASS[i]);
  _a.multiplyScalar(1 / TOTAL_M);
  for (let i = 0; i < NP; i++) { P[i].sub(_a); O[i].sub(_a); }
  
  if (impactState > 0) {
      impactState -= dt;
      // Ragdoll flails violently while in impact state
      for (let i = 0; i < NP; i++) {
         O[i].x += R(-0.5, 0.5);
         O[i].y += R(-0.5, 0.5);
         O[i].z += R(-0.5, 0.5);
      }
  }

  qPrev.copy(frame.q);
  torsoFrame();
  torsoW = lerp(torsoW, qPrev.angleTo(frame.q) / dt, 1 - Math.exp(-dt * 6));
  _tq.copy(frame.q).multiply(_tq2.copy(qPrev).invert());
  if (_tq.w < 0) { _tq.x = -_tq.x; _tq.y = -_tq.y; _tq.z = -_tq.z; _tq.w = -_tq.w; }
  { const s2 = Math.hypot(_tq.x, _tq.y, _tq.z);
    if (s2 > 1e-9) _al.set(_tq.x, _tq.y, _tq.z).multiplyScalar(2 * Math.atan2(s2, _tq.w) / s2 / dt); else _al.set(0, 0, 0);
    omega.lerp(_al, 0.5); }
}

/* ------------------------------------------------------------ body meshes */
const bodyMats = {
  skin:  new THREE.MeshLambertMaterial({ color: 0xf0e4d2, emissive: 0x2b2418 }),
  shirt: new THREE.MeshLambertMaterial({ color: 0xe2a052, emissive: 0x3a2610 }),
  dark:  new THREE.MeshLambertMaterial({ color: 0x1a1a24, emissive: 0x08080c })
};
const bodyGroup = new THREE.Group(); scene.add(bodyGroup);
function mk(geo, mat, layer = 0) { const m = new THREE.Mesh(geo, mat); m.layers.set(layer); m.frustumCulled = false; bodyGroup.add(m); return m; }
const boneMesh = SEGS.map(([a, b], i) => { const m = mk(GEO.cyl, i % 2 ? bodyMats.skin : bodyMats.shirt); m.userData.r = i % 2 ? 0.042 : 0.052; if (i >= 4) m.userData.r = i % 2 ? 0.05 : 0.065; return m; });
const jointMesh = [IX.ELL, IX.ELR, IX.HDL, IX.HDR, IX.KNL, IX.KNR, IX.FTL, IX.FTR].map(i => { const m = mk(GEO.sph, bodyMats.skin); m.userData.i = i; m.userData.r = 0.05; return m; });
const torsoMesh = mk(GEO.box, bodyMats.shirt);
const neckMesh = mk(GEO.cyl, bodyMats.skin);
const headMesh = mk(GEO.sph, bodyMats.skin, 1);
const visor = mk(GEO.sph, bodyMats.dark, 1);
const _up = new V3(0, 1, 0);
function bone(m, a, b) {
  _a.subVectors(b, a); const len = _a.length() || 1e-6;
  m.position.addVectors(a, b).multiplyScalar(.5); m.scale.set(m.userData.r, len, m.userData.r);
  m.quaternion.setFromUnitVectors(_up, _a.multiplyScalar(1 / len));
}

/* ----------------------------------------------------------- head + cameras */
const headQ = new Q4(), eyeQ = new Q4(), tgtQ = new Q4(), neckQ = new Q4();
const eyePos = new V3(), headFwd = new V3(), headUp = new V3(), headX = new V3(), headZ = new V3();
let camW = 0;
const _lk = new V3(), _hInv = new Q4(), _nq = new Q4(), _lk_q = new Q4(), FACE = new V3(0, 0, -1), NECK_RANGE = 1.35;
function updateBody(dt) {
  torsoFrame();
  const fx = frame.right, fy = frame.up, fz = frame.back;
  for (let i = 0; i < SEGS.length; i++) bone(boneMesh[i], P[SEGS[i][0]], P[SEGS[i][1]]);
  jointMesh.forEach(m => m.position.copy(P[m.userData.i]).addScaledVector(_up, 0) && m.scale.setScalar(m.userData.r));
  torsoMesh.position.addVectors(frame.pelvis, frame.shMid).multiplyScalar(.5);
  torsoMesh.quaternion.copy(frame.q);
  torsoMesh.scale.set(0.42, frame.shMid.distanceTo(frame.pelvis) + 0.12, 0.22);
  // head frame: up is neck-to-head, and the side axis follows the shoulders
  headUp.subVectors(P[IX.HEAD], frame.shMid).normalize();
  headX.copy(fx).addScaledVector(headUp, -fx.dot(headUp)).normalize();
  headZ.crossVectors(headX, headUp);                       // points out of the back of the head
  _m4.makeBasis(headX, headUp, headZ); headQ.setFromRotationMatrix(_m4);
  headFwd.copy(headZ).multiplyScalar(-1);
  headMesh.position.copy(P[IX.HEAD]); headMesh.scale.set(.105, .12, .11); headMesh.quaternion.copy(headQ);
  visor.position.copy(P[IX.HEAD]).addScaledVector(headFwd, .075).addScaledVector(headUp, .015); visor.scale.set(.09, .035, .045); visor.quaternion.copy(headQ);
  bone(neckMesh, frame.shMid, P[IX.HEAD]); neckMesh.scale.x = neckMesh.scale.z = 0.05;
  
  // eye camera: the neck turns the gaze towards the fall direction (or away from it once flipped).
  // This is the shortest rotation from "face forward" to the wanted direction, capped at a neck range,
  // so it has no yaw/pitch singularity when the wanted direction runs along the head's own axis.
  _lk.set(Ux, -U, Uz).normalize();
  if (isFlipped) _lk.multiplyScalar(-1);
  _lk.applyQuaternion(_hInv.copy(headQ).invert());
  _nq.setFromUnitVectors(FACE, _lk);
  const want = 2 * Math.acos(clamp(Math.abs(_nq.w), 0, 1));
  if (want > NECK_RANGE) _nq.set(0, 0, 0, 1).slerp(_lk_q.setFromUnitVectors(FACE, _lk), NECK_RANGE / want);
  neckQ.slerp(_nq, 1 - Math.exp(-dt * 5));
  tgtQ.copy(headQ).multiply(neckQ);
  eyePos.copy(P[IX.HEAD]).addScaledVector(headFwd, 0.085).addScaledVector(headUp, 0.03);
}
function smoothEye(dt) {
  // low-pass and speed cap on the head rotation; comfort 0 is raw, 1 is very calm
  const rate = 60 * Math.pow(3.2 / 60, S.comfort), maxW = 50 * Math.pow(2.6 / 50, S.comfort);
  const ang = eyeQ.angleTo(tgtQ);
  if (ang > 1e-5) {
    let step = ang * (1 - Math.exp(-rate * dt)); const cap = maxW * dt; if (step > cap) step = cap;
    eyeQ.rotateTowards(tgtQ, step);
    camW = lerp(camW, step / dt, 1 - Math.exp(-dt * 8));
  }
  
  // Dread Camera Shake
  const panicShake = (1 - smooth(0, 2.5, timeToImpact)) * 0.15;
  const shakeX = panicShake * Math.sin(simT * 37.0);
  const shakeY = panicShake * Math.cos(simT * 41.0);
  const shakeZ = panicShake * Math.sin(simT * 43.0);
  
  eyePos.x += shakeX; eyePos.y += shakeY; eyePos.z += shakeZ;
  
  eyeCam.position.copy(eyePos); eyeCam.quaternion.copy(eyeQ);
  
  // FOV widens as you go faster, and dramatically warps when close to impact
  const panicFov = 20 * (1 - smooth(0.0, 1.5, timeToImpact));
  eyeCam.fov = 78 + 16 * smooth(30, 90, U) + panicFov;
}
const obs = { az: 0.6, pos: new V3(0, 2, 5.5) };
function updateObserver(dt) {
  const t = simT;
  obs.az += dt * (0.10 + 0.06 * Math.sin(t * 0.21));
  const el = 0.25 + 0.5 * Math.sin(t * 0.11 + 0.7) + 0.1 * Math.sin(t * 0.37);
  const dist = 5.5 + 0.45 * Math.sin(t * 0.16) + 0.3 * Math.sin(t * 0.53 + 1.3);
  _a.set(Math.cos(obs.az) * Math.cos(el), Math.sin(el), Math.sin(obs.az) * Math.cos(el)).multiplyScalar(dist);
  obs.pos.lerp(_a, 1 - Math.exp(-dt * 1.6));
  obsCam.position.copy(obs.pos);
  obsCam.position.x += 0.025 * Math.sin(t * 1.3); obsCam.position.y += 0.025 * Math.sin(t * 1.7 + 1);
  obsCam.lookAt(0, 0.04, 0);
  obsCam.rotateZ(0.05 * Math.sin(t * 0.13));
}

/* --------------------------------------------------------- wind streaks */
const NS = reduceMotion ? 60 : 150;
const stX = new Float32Array(NS), stY = new Float32Array(NS), stZ = new Float32Array(NS), stL = new Float32Array(NS);
const stPos = new Float32Array(NS * 6);
function resetStreak(i, anywhere) { const a = rnd() * TAU, r = R(2.5, 32); stX[i] = Math.cos(a) * r; stZ[i] = Math.sin(a) * r; stY[i] = anywhere ? R(-70, 70) : -70; stL[i] = R(.6, 1.4); }
for (let i = 0; i < NS; i++) resetStreak(i, true);
const streakGeo = new THREE.BufferGeometry();
streakGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3).setUsage(THREE.DynamicDrawUsage));
streakGeo.boundingSphere = new THREE.Sphere(new V3(), 1e4);
const streakMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false, fog: false });
const streaks = new THREE.LineSegments(streakGeo, streakMat); streaks.frustumCulled = false;
scene.add(streaks);
function updateStreaks(dt) {
  const len = clamp(U * 0.035, .2, 3.5);
  for (let i = 0; i < NS; i++) {
    stY[i] += U * dt; 
    stX[i] -= Ux * dt;
    stZ[i] -= Uz * dt;
    if (stY[i] > 70 || stX[i]*stX[i] + stZ[i]*stZ[i] > 1200) resetStreak(i, false);
    const k = i * 6, l = len * stL[i];
    stPos[k] = stX[i]; stPos[k + 1] = stY[i] - l; stPos[k + 2] = stZ[i];
    stPos[k + 3] = stX[i]; stPos[k + 4] = stY[i]; stPos[k + 5] = stZ[i];
  }
  streakGeo.attributes.position.needsUpdate = true;
  streakMat.opacity = 0.34 * smooth(12, 45, U);
  streakMat.color.copy(cur.hor).lerp(new C3(0xffffff), .55);
}

/* ------------------------------------------------------------------ audio */
const audio = { ctx: null, rumble: null, hiss: null, master: null };
function startAudio() {
  if (audio.ctx) { audio.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ctx = audio.ctx = new AC();
  const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const white = ctx.createBuffer(1, len, ctx.sampleRate), w = white.getChannelData(0);
  for (let i = 0; i < len; i++) w[i] = Math.random() * 2 - 1;
  const mkSrc = (b) => { const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; };
  audio.master = ctx.createGain(); audio.master.gain.value = 0; audio.master.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
  const g1 = ctx.createGain(); mkSrc(buf).connect(lp); lp.connect(g1); g1.connect(audio.master);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
  const g2 = ctx.createGain(); mkSrc(white).connect(hp); hp.connect(g2); g2.connect(audio.master);
  audio.rumble = { g: g1, f: lp }; audio.hiss = { g: g2, f: hp };
}
function updateAudio() {
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime, v = clamp(U / 70, 0, 1.3), v2 = v * v;
  audio.master.gain.setTargetAtTime(S.sound ? 0.55 : 0, t, 0.12);
  
  // Audio Dread (wind drowns out everything else as impact nears)
  const dreadAudio = 1 - smooth(0, 2.0, timeToImpact);
  const rumbleTarget = 0.10 + 0.55 * v2 + 1.5 * dreadAudio;
  const hissTarget = 0.008 + 0.06 * v2 * (1 + 0.25 * torsoW) + 0.3 * dreadAudio;
  
  audio.rumble.g.gain.setTargetAtTime(rumbleTarget, t, 0.1);
  audio.rumble.f.frequency.setTargetAtTime(260 + 500 * v + 1000 * dreadAudio, t, 0.1);
  
  audio.hiss.g.gain.setTargetAtTime(hissTarget, t, 0.1);
  audio.hiss.f.frequency.setTargetAtTime(1500 + 1200 * v - 800 * dreadAudio, t, 0.1);
}

/* ------------------------------------------------------------------ views */
let views = [];
const tagA = $('tagA'), tagB = $('tagB'), frameInset = $('frameInset'), divider = $('divider'), vigEl = $('vig'), safeEl = $('safe');
function safeTop() { return parseFloat(getComputedStyle(safeEl).paddingTop) || 0; }
function safeSide() { const cs = getComputedStyle(safeEl); return [parseFloat(cs.paddingLeft) || 0, parseFloat(cs.paddingRight) || 0]; }
let eyeComposer, obsComposer;

function initPostProcessing() {
  const W = window.innerWidth, H = window.innerHeight;
  perceptionPasses = [];
  
  eyeComposer = new THREE.EffectComposer(renderer);
  const eyeRenderPass = new THREE.RenderPass(scene, eyeCam);
  eyeComposer.addPass(eyeRenderPass);
  const eyeBloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(W, H), 1.2, 0.4, 0.85);
  eyeComposer.addPass(eyeBloomPass);
  const eyePerception = new THREE.ShaderPass(PerceptionShader);
  eyeComposer.addPass(eyePerception);
  perceptionPasses.push(eyePerception);

  obsComposer = new THREE.EffectComposer(renderer);
  const obsRenderPass = new THREE.RenderPass(scene, obsCam);
  obsComposer.addPass(obsRenderPass);
  const obsBloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(W, H), 1.2, 0.4, 0.85);
  obsComposer.addPass(obsBloomPass);
  const obsPerception = new THREE.ShaderPass(PerceptionShader);
  obsComposer.addPass(obsPerception);
  perceptionPasses.push(obsPerception);
}

function layout() {
    const W = window.innerWidth, H = window.innerHeight, st = safeTop(), [sl, sr] = safeSide();
    renderer.setSize(W, H, false);
    const cv = $('c'); cv.width = Math.round(W * renderer.getPixelRatio()); cv.height = Math.round(H * renderer.getPixelRatio());
    renderer.setSize(W, H);
    
    if (!eyeComposer) initPostProcessing();

    const setTag = (el, txt, x, y) => { el.textContent = txt; el.style.display = 'block'; el.style.left = x + 'px'; el.style.top = y + 'px'; };
    frameInset.style.display = divider.style.display = tagA.style.display = tagB.style.display = 'none';
    if (S.view === 'split') {
      const side = W >= H * 0.95;
      if (side) {
        const hw = Math.floor(W / 2);
        views = [ { cam: eyeCam, x: 0, y: 0, w: hw, h: H, comp: eyeComposer }, { cam: obsCam, x: hw, y: 0, w: W - hw, h: H, comp: obsComposer } ];
        Object.assign(divider.style, { display: 'block', left: hw + 'px', top: 0, width: '1px', height: '100%' });
        setTag(tagA, 'Eyes', 16 + sl, (W < 560 ? 35 : 14) + st + 74); setTag(tagB, 'Watching', hw + 16, (W < 560 ? 35 : 14) + st + 74);
      } else {
        const hh = Math.floor(H / 2);
        views = [ { cam: eyeCam, x: 0, y: H - hh, w: W, h: hh, comp: eyeComposer }, { cam: obsCam, x: 0, y: 0, w: W, h: H - hh, comp: obsComposer } ];
        Object.assign(divider.style, { display: 'block', left: 0, top: hh + 'px', width: '100%', height: '1px' });
        setTag(tagA, 'Eyes', 16 + sl, (W < 560 ? 35 : 14) + st + 60); setTag(tagB, 'Watching', 16 + sl, hh + 10);
      }
    } else {
      const main = S.view === 'eye' ? eyeCam : obsCam, small = S.view === 'eye' ? obsCam : eyeCam;
      const mainComp = S.view === 'eye' ? eyeComposer : obsComposer, smallComp = S.view === 'eye' ? obsComposer : eyeComposer;
      const iw = Math.round(clamp(W * (W < 560 ? 0.42 : 0.27), 140, 380)), ih = Math.round(iw * (W < H ? 1.15 : 0.68));
      const m = W < 560 ? 8 : 14, ix = W - iw - m - sr, iy = (W < 560 ? 35 : 14) + st;
      views = [ { cam: main, x: 0, y: 0, w: W, h: H, comp: mainComp }, { cam: small, x: ix, y: H - ih - iy, w: iw, h: ih, comp: smallComp } ];
      Object.assign(frameInset.style, { display: 'block', left: ix + 'px', top: iy + 'px', width: iw + 'px', height: ih + 'px' });
      setTag(tagA, S.view === 'eye' ? 'Watching' : 'Eyes', ix + 8, iy + 6);
    }
  const eyeMain = views.find(v => v.cam === eyeCam);
  S.eyeShare = eyeMain ? (eyeMain.w * eyeMain.h) / (W * H) : 0;
  
  for (const v of views) {
    v.comp.setSize(v.w, v.h);
  }
  
  if (perceptionPasses.length > 0) {
     perceptionPasses[0].uniforms.uResolution.value.set(views[0].w, views[0].h);
     perceptionPasses[1].uniforms.uResolution.value.set(views[1].w, views[1].h);
  }
}
function render() {
  const W = window.innerWidth, H = window.innerHeight;
  renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); renderer.clear(true, true, false);
  renderer.setScissorTest(true);
  for (const v of views) {
    renderer.setViewport(v.x, v.y, v.w, v.h); renderer.setScissor(v.x, v.y, v.w, v.h);
    renderer.clearDepth();
    v.cam.aspect = v.w / v.h; v.cam.updateProjectionMatrix();
    sky.position.copy(v.cam.position);
    v.comp.render();
  }
}

function updateDodgers(dt) {
  // predict where the body will be in ~1 second
  const predX = Ux * 1.0, predZ = Uz * 1.0;
  
  for (const s of slabs) {
    const gd = s.depth - D;
    // only bother with slabs that are somewhat close (-100 to 400m)
    if (gd < -100 || gd > 400) continue;
    
    for (const obj of s.dodgeables) {
      const m = obj.m;
      // Object's base position relative to the falling body's origin
      const ox = m.userData.baseX - worldX, oz = m.userData.baseZ - worldZ;
      
      // distance from predicted path
      const dx = ox - predX, dz = oz - predZ;
      const dist = Math.hypot(dx, dz);
      
      const avoidRadius = obj.radius + 3.0; // keep radius
      
      // Calculate target offset
      let tx = 0, tz = 0;
      if (dist < avoidRadius) {
        const push = (avoidRadius - dist);
        const dirX = dist > 0.001 ? dx / dist : 1;
        const dirZ = dist > 0.001 ? dz / dist : 0;
        tx = dirX * push;
        tz = dirZ * push;
        
        // Add some chaotic twist based on torsoW if they are falling fast
        const twist = push * clamp(torsoW * 0.1, -0.5, 0.5);
        m.quaternion.copy(m.userData.baseQ).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), twist));
      } else {
        m.quaternion.slerp(m.userData.baseQ, 1 - Math.exp(-dt * 4));
      }
      
      // Spring towards target offset
      m.userData.ox = (m.userData.ox || 0); m.userData.oz = (m.userData.oz || 0);
      m.userData.ox += (tx - m.userData.ox) * (1 - Math.exp(-dt * 6));
      m.userData.oz += (tz - m.userData.oz) * (1 - Math.exp(-dt * 6));
      
      m.position.x = m.userData.baseX + m.userData.ox;
      m.position.z = m.userData.baseZ + m.userData.oz;
      m.updateMatrix();
    }
  }
}

/* -------------------------------------------------------------------- tick */
let acc = 0, hudT = 0;
const STEP = 1 / 120;
function tick(dt) {
  if (!plan.length) ensurePlan(D + 1400);
  acc += dt;
  let n = 0;
  while (acc >= STEP && n < 6) { physicsStep(STEP); acc -= STEP; n++; }
  if (n === 6) acc = 0;
  D += U * dt;
  worldX += Ux * dt;
  worldZ += Uz * dt;
  world.position.set(-worldX, D, -worldZ);
  G.dmod.value = D % ROW; G.didx.value = Math.floor(D / ROW);
  streamWorld(); updateEnv(dt);
  for (const s of slabs) for (const sp of s.spin) { sp.o.rotation.x += sp.w.x * dt; sp.o.rotation.y += sp.w.y * dt; sp.o.rotation.z += sp.w.z * dt; }
  updateDodgers(dt);
  updateBody(dt); smoothEye(dt); updateObserver(dt); updateStreaks(dt); updateAudio();
  vigEl.style.opacity = String(clamp((camW - 1.6) / 6, 0, 1) * 0.85 * (S.eyeShare || 0));
  hudT += dt;
  if (hudT > 0.25) { hudT = 0; hud(); }
}
function hud() {
  const km = D / 1000;
  $('rDepth').textContent = (D < 1000 ? Math.max(0, Math.round(D)) + ' m' : km.toFixed(2) + ' km') + ' down, ' + Math.round(U) + ' m/s';
  const gap = nearestFloorGap();
  let txt;
  const surrealPhrases = ["the ground refuses to arrive", "falling through the cracks", "the architecture is shifting", "orientation lost", "the world rearranges itself", "perpetual descent"];
  if (gap < 1e8 && gap > 8) txt = 'floor ' + (gap > 1000 ? (gap / 1000).toFixed(1) + ' km' : Math.round(gap) + ' m') + ' below';
  else if (gap <= 8 && gap < 1e8) txt = 'the floor is gone';
  else txt = surrealPhrases[Math.floor(D / 500) % surrealPhrases.length];
  if (floorsEscaped) txt += ', ' + floorsEscaped + (floorsEscaped === 1 ? ' floor' : ' floors') + ' escaped';
  $('rFloor').textContent = txt;
}

/* --------------------------------------------------------------------- UI */
function setView(v) {
  S.view = v;
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  layout();
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
function shove() { fireKick(4.5); nextKick = simT + 4; }
$('shove').addEventListener('click', shove);

function flipBody() {
  // toggles belly-to-earth / back-to-earth; the posture controller rolls the body over in about a second
  isFlipped = !isFlipped;
}
$('flipBtn').addEventListener('click', flipBody);

$('floorBtn').addEventListener('click', forceFloor);
$('snd').addEventListener('click', () => setSound(!S.sound));
function setSound(on) {
  S.sound = on; if (on) startAudio();
  const b = $('snd'); b.textContent = on ? 'Sound on' : 'Sound off'; b.setAttribute('aria-pressed', String(on));
}
$('begin').addEventListener('click', () => { $('intro').style.display = 'none'; S.started = true; setSound(true); });
const bind = (id, key, fmt) => { const el = $(id), out = $(id + 'O'); const f = () => { S[key] = parseFloat(el.value); out.textContent = fmt(S[key]); }; el.value = S[key]; el.addEventListener('input', f); f(); };
bind('gust', 'gust', v => v.toFixed(2)); bind('limp', 'limp', v => v.toFixed(2)); bind('freedom', 'freedom', v => v.toFixed(2)); bind('comfort', 'comfort', v => v.toFixed(2));
const keys = { arrowup: 0, arrowdown: 0, arrowleft: 0, arrowright: 0, w: 0, a: 0, s: 0, d: 0 };
window.addEventListener('keydown', e => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase();
  if (keys[k] !== undefined) keys[k] = 1;
  
  if (k === ' ') { e.preventDefault(); shove(); }
  else if (k === 'v') setView({ eye: 'watch', watch: 'split', split: 'eye' }[S.view]);
  else if (k === 'f') forceFloor();
  else if (k === 'r') flipBody();
  else if (k === 'h') document.body.classList.toggle('hide-ui');
  else if (k === 'm') setSound(!S.sound);
});
window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (keys[k] !== undefined) keys[k] = 0;
});
let touchLeftId = null;
let startLeftX = 0, startLeftY = 0;

window.addEventListener('touchstart', e => {
  if (e.target.closest('#bar, #intro, button, summary')) return;
  const W = window.innerWidth;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (touchLeftId === null) {
      touchLeftId = t.identifier;
      startLeftX = t.clientX; startLeftY = t.clientY;
    }
  }
}, {passive: false});

window.addEventListener('touchmove', e => {
  if (e.target.closest('#bar, #intro, button, summary')) return;
  e.preventDefault(); // prevent scrolling while playing
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.identifier === touchLeftId) {
      keys.vDiveX = clamp((t.clientX - startLeftX) / 40, -1, 1);
      keys.vDiveZ = clamp((t.clientY - startLeftY) / 40, -1, 1);
    }
  }
}, {passive: false});

const touchEnd = e => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.identifier === touchLeftId) {
      touchLeftId = null; keys.vDiveX = 0; keys.vDiveZ = 0;
    }
  }
};
window.addEventListener('touchend', touchEnd);
window.addEventListener('touchcancel', touchEnd);

window.addEventListener('resize', layout);
document.addEventListener('visibilitychange', () => { last = 0; });

/* -------------------------------------------------------------------- go */
ensurePlan(D + 1400);
layout();
// start the eye camera already looking where the head looks
  updateBody(0.016); eyeQ.copy(tgtQ);
let last = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60; last = now;
  tick(dt); render();
}
requestAnimationFrame(loop);

// small hook for automated checks
window.__fall = { tick, render, layout, setView, forceFloor, shove, S,
  state: () => ({ D, U, simT, torsoW, camW, slabs: slabs.length, plan: plan.map(a => [a.type, a.pal, Math.round(a.start), Math.round(a.end), a.ground && a.ground.type]), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, dens, arousal }) };
})();
