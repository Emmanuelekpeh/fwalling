# Visualize Coffin Confinement

**User:** Anonymous  
**Created:** 9/22/2026 8:13:21  
**Updated:** 9/22/2026 8:17:35  
**Exported:** 9/22/2026 8:17:41  
**Link:** [https://chatgpt.com/c/6ab270e0-a158-83ea-b54e-27eb712412e4](https://chatgpt.com/c/6ab270e0-a158-83ea-b54e-27eb712412e4)  

## Prompt:
9/22/2026, 8:14:24 AM

Good, useful physiological data. Now let's get the hypoxia/asphyxiation-specific physiology and timeline:Good. Now let's cover trapped-miner survivor accounts (real confined-space entrapment psychology) and then pivot to dream/nightmare research:Now let's move to the dream/nightmare side — sleep paralysis, REM atonia, and burial/entrapment dream imagery:Here's what the research actually says, organized by phase — and I've flagged where it maps directly onto what we've already built versus what it suggests we should add next. 
 
## Real, physical burial: the stages your body would actually go through 
 
The physiological chain is well documented: oxygen drops, CO2 builds, and the two together — not just one — are what produce the panic. Lack of oxygen and excess carbon dioxide cause panic, disorientation, and eventually loss of consciousness, and the physical constraints of the coffin can cause muscle cramps and nerve damage. As CO2 specifically accumulates, the picture isn't just "less air" — it's a specific symptom cluster: confusion presenting as delayed responses or an odd sense of detachment, flushed warm skin, rapidly-progressing disorientation, involuntary muscle twitching, and a heart rate that climbs to compensate. 
 
Layered on top of that biochemistry is a panic response with its own well-characterized perceptual signature: tunnel vision from blood being redirected away from the head, flashing vision, numbness, heavy breathing, and a loss of body control, alongside auditory exclusion — hearing either drops out completely or turns into a muffled hiss or ringing, paired with a subjective slowing of time. 
 
**This is directly useful:** it tells us the *order* things should degrade in. Not oxygen → death in a straight line, but oxygen → CO2 confusion/detachment → panic-driven sensory narrowing (vision tunneling, hearing muffling, time dilating) → and only then unconsciousness. Right now our panic system drives audio/vignette uniformly; it should instead drive *specific, escalating perceptual failures* in a sequence. 
 
## Longer-term confinement: what darkness and helplessness alone do 
 
Separate from the acute asphyxiation, there's research on people trapped in the dark for extended periods (mine disasters) that's very relevant to your "whisper of light" instinct. Field studies of mine disasters found visual illusions and hallucinations in miners subjected to prolonged darkness, and once miners were found, giving them control over light was treated as important to physical and psychological health. That's a strong external validation of the light-loss beat we built — losing light isn't just atmospheric, it's specifically named in the literature as a psychological stressor distinct from the confinement itself. 
 
## The nightmare side: sleep paralysis and dream logic 
 
This is the part that maps almost exactly onto your intro sequence. Sleep paralysis is a real, well-studied neurological state, not just a folk experience: during it, someone has the impression of being awake and aware of their environment but is unable to initiate voluntary movement, because REM muscle atonia is intruding into waking consciousness. The described sensations are eerily on-theme: being awakened in complete darkness, feeling helpless and paralyzed, unable to scream, with the dream world's sensory flood still obscuring thought and murmurs, roars, hissing, static, zapping, and buzzing noises, along with a fearful, pushed-down sensation. One clinical account described it as feeling arms pinned across the chest, hands pressing down on the chest, pinning against a wall — literally the sensation of being held down and weighted, without any actual force present. 
 
On dream content specifically about suffocation/burial, there's a direct match to your premise: dreams of suffocation often involve an invisible force pressing on the chest or throat, or being trapped in a small enclosed space like a coffin where the air seems to grow thinner and thinner. 
 
And here's the finding that validates your intro design choice most precisely — Revonsuo's threat-simulation research on dream content found that the dreamer rarely succeeds in fleeing the threat despite making important and appropriate efforts to escape. That's your "you struggle, it does nothing" intro almost verbatim, described as a *general property of nightmares*, not something you invented for effect. 
 
## The unexpected finding: it doesn't end in pure terror 
 
This is worth building toward, not away from. Near-drowning/asphyxiation survivor reports converge on something counterintuitive: survivors have reported feelings of profound calm, tranquility, or even euphoria just before losing consciousness, likely because the brain fails to process fear and pain signals effectively under oxygen deficit — a neurological fade-out that replaces the earlier terror with a sense of distant detachment. Your losing-ending text ("Stay still. Stay calm. Stay—") already gestures at this, which is good instinct — the research suggests you could lean into it much further: the *last* phase before death shouldn't be the most frantic, it should be the moment panic switches off and everything goes quiet and strangely peaceful. That inversion — terror peaking then collapsing into calm rather than terror peaking at death — is more true to the actual physiology and more unsettling than a straight escalation. 
 
## Concrete design implications 
 
| Finding | Implementation | 
|---|---| 
| Panic degrades senses in a specific order (vision tunnels → hearing muffles → time dilates) before unconsciousness | Right now panic drives audio/vignette together uniformly. Split it: tunnel the actual render (vignette closing harder, FOV narrowing) before muffling audio, then only at very high panic, slow `dt` perceptually (time dilation) | 
| CO2-specific confusion/detachment, not just fear | Near oxygen depletion, occasionally *drop* panic-driven urgency instead of raising it — a wave of detachment/confusion, maybe a brief camera drift or color desaturation, distinct from the heartbeat-racing panic beats | 
| Hallucinated presence, pinning sensation, buzzing/hissing in sleep paralysis | A rare, quiet hallucinated sound (a voice-like murmur, a felt "someone is here") during high panic — not a jump scare, just a wrongness | 
| Dreamers rarely succeed despite real effort | Already built into the intro. Worth extending: even in the *real* gameplay after intro, early struggle attempts could feel slightly less effective than later ones (fatigue aside) — effort that doesn't immediately pay off is the more psychologically accurate texture | 
| Calm/euphoria before death, not peak terror | Rework the death sequence: panic and heartbeat should *crest and then fall* in the final seconds — audio thins out, heartbeat slows unnaturally, vignette softens instead of tightening, right before it cuts to black. Currently it's just "oxygen hits 0 → end" with no distinct final beat | 
| Light control matters psychologically, independent of survival | Supports keeping the sky light purely as a one-way loss (already done) — but also suggests that regaining *any* control over light (not just escaping) could be its own small design beat, if you wanted a middle state between "struggling blind" and "winning" | 
 
Want me to implement the sense-degradation ordering and the calm-before-death rework next? Those are the two findings that most clearly aren't in the current build yet. yes and they make sense but youur only thinking about sounds and thats very important but we need a source of light a fire fly that dies as the shit progresses or something just to give the visual identity of being in a box while the sound carries the rest this is where im at i need you to do visual reseach to help fill up the blank spaces <!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Cwoffin - Embodied Helplessness</title>
<style>
  html, body { height: 100%; margin: 0; background: #000; overflow: hidden; font-family: monospace; }
  #c { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
  #ui { position: fixed; bottom: 20px; left: 20px; color: rgba(255, 255, 255, 0.35); pointer-events: none; opacity: 0; transition: opacity 2s; }
  #vignette {
    position: fixed; inset: 0; pointer-events: none;
    background: radial-gradient(circle at center, transparent var(--clear, 12%), rgba(5,0,0,var(--dark,0.94)) 75%, #000 100%);
  }
  #flash { position: fixed; inset: 0; pointer-events: none; background: #fff; opacity: 0; }
  #ending {
    position: fixed; inset: 0; background: #000; color: #ccc; display: flex; align-items: center; justify-content: center;
    text-align: center; opacity: 0; pointer-events: none; transition: opacity 4s; letter-spacing: 2px; font-size: 1.3em;
  }
  #ending.show { opacity: 1; pointer-events: all; }
  #ending .sub { font-size: 0.55em; opacity: 0.4; margin-top: 1.2em; letter-spacing: 1px; }
  kbd { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="vignette"></div>
<div id="flash"></div>
<div id="ending"><div><div id="endingText"></div><div class="sub">press R to be buried again</div></div></div>
<div id="ui">
  <div>Motor Intentions:</div>
  <div><kbd>Q</kbd> Curl Left Arm | <kbd>E</kbd> Curl Right Arm</div>
  <div><kbd>Z</kbd> Curl Left Leg | <kbd>C</kbd> Curl Right Leg</div>
  <div><kbd>Space</kbd> Push Against The Lid</div>
  <div><kbd>Mouse</kbd> Struggle to look around</div>
  <div style="margin-top:6px; opacity:0.6;">Stay calm to conserve air. Push the lid to escape.</div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(() => {
'use strict';

// Helpers
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const V3 = THREE.Vector3, Q4 = THREE.Quaternion;

// Scene setup
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 0.05, 1.5);

// Lighting (claustrophobic — darkness is the default state, not an afterthought)
const ambient = new THREE.AmbientLight(0x0a0812, 1.0);
scene.add(ambient);
const headLight = new THREE.PointLight(0xffcfa0, 0.35, 1.6, 2.2);
scene.add(headLight);
let headLightBase = 0.35;

// Camera
const camera = new THREE.PerspectiveCamera(85, 1, 0.01, 100);

// Coffin Dimensions (Half-extents)
const CX = 0.35; // Width
const CY = 0.30; // Height (clearance above/below)
const CZ = 1.0;  // Length

// A whisper of light from above — present only during the burial, fading to
// nothing as dirt piles on top. Once it's gone, it never comes back.
const skyLight = new THREE.PointLight(0xcfe0ff, 1.1, 3.0, 2.0);
skyLight.position.set(0, CY + 0.4, -0.15);
scene.add(skyLight);
const skyLightBase = 1.1;

// Coffin Visuals
const coffinGeo = new THREE.BoxGeometry(CX * 2, CY * 2, CZ * 2);
const coffinMat = new THREE.MeshStandardMaterial({ 
  color: 0x120d09, 
  roughness: 1.0, 
  side: THREE.BackSide 
});
const coffinMesh = new THREE.Mesh(coffinGeo, coffinMat);
scene.add(coffinMesh);

// --- PHYSICS ENGINE ---
const NP = 13;
const IX = { HEAD:0, SHL:1, SHR:2, HPL:3, HPR:4, ELL:5, ELR:6, HDL:7, HDR:8, KNL:9, KNR:10, FTL:11, FTR:12 };

// Rest positions roughly laying flat on the back
const REST = [
  [0, CY - 0.15, -0.7],  // HEAD
  [-0.20, CY - 0.2, -0.4], [0.20, CY - 0.2, -0.4], // SHOULDERS
  [-0.15, CY - 0.2, 0.1],  [0.15, CY - 0.2, 0.1],  // HIPS
  [-0.25, CY - 0.2, -0.1], [0.25, CY - 0.2, -0.1], // ELBOWS
  [-0.28, CY - 0.2, 0.2],  [0.28, CY - 0.2, 0.2],  // HANDS
  [-0.15, CY - 0.2, 0.5],  [0.15, CY - 0.2, 0.5],  // KNEES
  [-0.15, CY - 0.2, 0.9],  [0.15, CY - 0.2, 0.9]   // FEET
];

const BASE_M = [5, 6, 6, 7, 7, 1.8, 1.8, 0.9, 0.9, 4, 4, 1.6, 1.6];
const MASS = BASE_M.map(m => m * 80 / BASE_M.reduce((a, b) => a + b, 0));

const P = [], O = [], F = [];
for (let i = 0; i < NP; i++) {
  P.push(new V3(...REST[i]));
  O.push(new V3(...REST[i]));
  F.push(new V3());
}

const CONS = [];
const con = (a, b, lo, hi) => CONS.push({ a, b, lo, hi: hi === undefined ? lo : hi, wa: 1 / MASS[a], wb: 1 / MASS[b] });
const rv = i => new V3(...REST[i]);
const rd = (a, b) => rv(a).distanceTo(rv(b));

// Torso rigidity
for (const [a, b] of [[IX.SHL,IX.SHR],[IX.HPL,IX.HPR],[IX.SHL,IX.HPL],[IX.SHR,IX.HPR],[IX.SHL,IX.HPR],[IX.SHR,IX.HPL]]) con(a, b, rd(a, b));
con(IX.HEAD, IX.SHL, rd(IX.HEAD, IX.SHL)); con(IX.HEAD, IX.SHR, rd(IX.HEAD, IX.SHR)); 
// Arms
for (const [s, e, h] of [[IX.SHL, IX.ELL, IX.HDL], [IX.SHR, IX.ELR, IX.HDR]]) { con(s, e, rd(s, e)); con(e, h, rd(e, h)); con(s, h, 0.05, rd(s, e) + rd(e, h)); }
// Legs
for (const [s, e, h] of [[IX.HPL, IX.KNL, IX.FTL], [IX.HPR, IX.KNR, IX.FTR]]) { con(s, e, rd(s, e)); con(e, h, rd(e, h)); con(s, h, 0.05, rd(s, e) + rd(e, h)); }

const SEGS = [ [IX.SHL, IX.ELL], [IX.ELL, IX.HDL], [IX.SHR, IX.ELR], [IX.ELR, IX.HDR],
               [IX.HPL, IX.KNL], [IX.KNL, IX.FTL], [IX.HPR, IX.KNR], [IX.KNR, IX.FTR] ];

// --- RAGDOLL MESHES ---
const bodyGroup = new THREE.Group(); scene.add(bodyGroup);
const skinMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 0.9 });
const shirtMat = new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 1.0 });
const boneMesh = SEGS.map((_, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,8), i > 3 ? shirtMat : skinMat); m.userData.r = 0.04; bodyGroup.add(m); return m; });
const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), shirtMat); bodyGroup.add(torsoMesh);
const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMat); bodyGroup.add(headMesh);

const _a = new V3(), _up = new V3(0, 1, 0);
function updateMeshes() {
  for (let i = 0; i < SEGS.length; i++) {
    const a = P[SEGS[i][0]], b = P[SEGS[i][1]], m = boneMesh[i];
    _a.subVectors(b, a); const len = _a.length() || 0.001;
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.scale.set(m.userData.r, len, m.userData.r);
    m.quaternion.setFromUnitVectors(_up, _a.normalize());
  }
  const shMid = new V3().addVectors(P[IX.SHL], P[IX.SHR]).multiplyScalar(0.5);
  const hpMid = new V3().addVectors(P[IX.HPL], P[IX.HPR]).multiplyScalar(0.5);
  torsoMesh.position.addVectors(shMid, hpMid).multiplyScalar(0.5);
  _a.subVectors(hpMid, shMid); const tLen = _a.length() || 0.001;
  const right = new V3().subVectors(P[IX.SHR], P[IX.SHL]).normalize();
  const fwd = new V3().crossVectors(right, _a.normalize()).normalize();
  const m4 = new THREE.Matrix4().makeBasis(right, _a, fwd);
  torsoMesh.quaternion.setFromRotationMatrix(m4);
  torsoMesh.scale.set(0.35, tLen + 0.1, 0.2);
  
  headMesh.position.copy(P[IX.HEAD]);
  _rawCamPos.copy(P[IX.HEAD]).addScaledVector(fwd, 0.12); // Eyes slightly forward
  _rawCamFwd.copy(fwd);
}

// Camera is smoothed/decoupled from raw ragdoll physics — the jitter reads as
// nausea if piped straight through; smoothing keeps it stable while a separate
// shake impulse (below) restores the *feeling* of impact only when it happens.
const _rawCamPos = new V3(), _rawCamFwd = new V3(0, 0, -1);
let _smoothPos = null;
const _smoothFwd = new V3(0, 0, -1);
let camShake = 0;
function updateCamera(dt) {
  if (!_smoothPos) { _smoothPos = _rawCamPos.clone(); _smoothFwd.copy(_rawCamFwd); }
  const posLerp = 1 - Math.exp(-dt * 10);
  const fwdLerp = 1 - Math.exp(-dt * 8);
  _smoothPos.lerp(_rawCamPos, posLerp);
  _smoothFwd.lerp(_rawCamFwd, fwdLerp).normalize();

  camShake = Math.max(0, camShake - dt * 3);
  const shakeAmt = camShake * 0.01;
  camera.position.copy(_smoothPos);
  if (shakeAmt > 0.0001) camera.position.set(
    camera.position.x + (Math.random() - 0.5) * shakeAmt,
    camera.position.y + (Math.random() - 0.5) * shakeAmt,
    camera.position.z + (Math.random() - 0.5) * shakeAmt
  );
  const lookTarget = new V3().copy(camera.position).addScaledVector(_smoothFwd, 1);
  camera.up.set(0, 1, 0);
  camera.lookAt(lookTarget);
  headLight.position.copy(camera.position);
}

// Helper to get random point on inner walls of coffin
/*
function randomWallPoint() {
  const p = new V3();
  const n = new V3();
  const face = Math.floor(Math.random() * 6);
  p.x = (Math.random() - 0.5) * 2 * CX;
  p.y = (Math.random() - 0.5) * 2 * CY;
  p.z = (Math.random() - 0.5) * 2 * CZ;
  if (face === 0) { p.x = CX; n.set(-1,0,0); }
  else if (face === 1) { p.x = -CX; n.set(1,0,0); }
  else if (face === 2) { p.y = CY; n.set(0,-1,0); }
  else if (face === 3) { p.y = -CY; n.set(0,1,0); }
  else if (face === 4) { p.z = CZ; n.set(0,0,-1); }
  else if (face === 5) { p.z = -CZ; n.set(0,0,1); }
  return { p, n };
}

for (let i = 0; i < NUM_CENTIPEDES; i++) {
  const { p, n } = randomWallPoint();
  // Random direction on the plane
  const tangent = new V3(1,0,0);
  if (Math.abs(n.dot(tangent)) > 0.9) tangent.set(0,1,0);
  const dir = new V3().crossVectors(n, tangent).normalize();
  dir.applyAxisAngle(n, Math.random() * Math.PI * 2);
  
  const segments = [];
  for (let s = 0; s < SEGS_PER_CENTI; s++) {
    segments.push({
      p: p.clone().addScaledVector(dir, -s * SEG_LEN),
      n: n.clone(),
      dir: dir.clone()
    });
  }
  centipedes.push({ segments, speed: 0.2 + Math.random() * 0.2, phase: Math.random() * Math.PI * 2 });
}

function updateCentipedes(dt) {
  const time = performance.now() * 0.001;
  let idx = 0;
  
  for (let i = 0; i < NUM_CENTIPEDES; i++) {
    const c = centipedes[i];
    const head = c.segments[0];
    
    // Wander direction slightly
    head.dir.applyAxisAngle(head.n, (Math.random() - 0.5) * 4.0 * dt);
    
    // Move head
    head.p.addScaledVector(head.dir, c.speed * dt);
    
    // Check coffin bounds and wrap around corners
    const pr = 0.01;
    if (head.p.x > CX - pr) { head.p.x = CX - pr; head.n.set(-1,0,0); head.dir.x = 0; head.dir.normalize(); }
    if (head.p.x < -CX + pr) { head.p.x = -CX + pr; head.n.set(1,0,0); head.dir.x = 0; head.dir.normalize(); }
    if (head.p.y > CY - pr) { head.p.y = CY - pr; head.n.set(0,-1,0); head.dir.y = 0; head.dir.normalize(); }
    if (head.p.y < -CY + pr) { head.p.y = -CY + pr; head.n.set(0,1,0); head.dir.y = 0; head.dir.normalize(); }
    if (head.p.z > CZ - pr) { head.p.z = CZ - pr; head.n.set(0,0,-1); head.dir.z = 0; head.dir.normalize(); }
    if (head.p.z < -CZ + pr) { head.p.z = -CZ + pr; head.n.set(0,0,1); head.dir.z = 0; head.dir.normalize(); }

    // Ragdoll body interaction (repel slightly so they crawl around limbs)
    for (let pi = 0; pi < NP; pi++) {
      const dist = head.p.distanceTo(P[pi]);
      if (dist < 0.15) {
        const repel = head.p.clone().sub(P[pi]).normalize();
        head.dir.lerp(repel, 2.0 * dt).normalize();
      }
    }
    
    // Follow the leader
    for (let s = 1; s < SEGS_PER_CENTI; s++) {
      const seg = c.segments[s];
      const prev = c.segments[s-1];
      const dist = seg.p.distanceTo(prev.p);
      const diff = (dist - SEG_LEN) / dist;
      if (dist > 0.001) {
        seg.p.addScaledVector(seg.p.clone().sub(prev.p), -diff);
      }
      seg.dir.subVectors(prev.p, seg.p).normalize();
      seg.n.copy(prev.n);
    }
    
    // Update instances
    for (let s = 0; s < SEGS_PER_CENTI; s++) {
      const seg = c.segments[s];
      _dummy.position.copy(seg.p);
      
      // Undulate body slightly
      const wave = Math.sin(time * 15.0 + s * 1.5 + c.phase) * 0.005;
      _dummy.position.addScaledVector(seg.n, wave + 0.015);
      
      // Orient
      const up = seg.n;
      const right = new V3().crossVectors(seg.dir, up).normalize();
      const fwd = new V3().crossVectors(up, right).normalize();
      const m4 = new THREE.Matrix4().makeBasis(right, up, fwd);
      _dummy.quaternion.setFromRotationMatrix(m4);
      
      _dummy.updateMatrix();
      instMesh.setMatrixAt(idx++, _dummy.matrix);
    }
  }
  instMesh.instanceMatrix.needsUpdate = true;
}
*/

// --- SURVIVAL STATE ---
let oxygen = 100;       // 0-100, depletes over time; panic/exertion drain it faster
let panic = 0;          // 0-1, driven by low oxygen and sudden shocks (wall impacts)
let fatigue = 0;        // 0-1, rises while struggling, saps force output, forces pacing
let lidStress = 0;      // 0-100, rises only when pushing against the lid while not exhausted
let gameState = 'intro'; // 'intro' | 'playing' | 'won' | 'lost'
let heartTimer = 0, breathPhase = 0;
let creakCooldown = 0, dirtCooldown = 2 + Math.random() * 3;
let struggling = false; // true whenever a struggle key is held, even if it has no effect

// --- INTRO: you are being buried. You can try to struggle. It does nothing yet. ---
const INTRO_THUDS = [0.7, 2.5, 4.4, 6.7, 9.1, 11.4]; // seconds — each is a shovel-load landing
const INTRO_END = 13.0; // total seconds before control actually begins
let introTimer = 0, introIndex = 0;

// --- AUDIO (fully synthesized, no external assets) ---
let actx = null, masterGain, breathGain, breathFilter, droneGain, noiseBuffer;
function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = actx.createGain(); masterGain.gain.value = 0.55; masterGain.connect(actx.destination);

  const bufSize = actx.sampleRate * 2;
  noiseBuffer = actx.createBuffer(1, bufSize, actx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const breathSrc = actx.createBufferSource();
  breathSrc.buffer = noiseBuffer; breathSrc.loop = true;
  breathFilter = actx.createBiquadFilter(); breathFilter.type = 'bandpass'; breathFilter.frequency.value = 500; breathFilter.Q.value = 0.6;
  breathGain = actx.createGain(); breathGain.gain.value = 0.0;
  breathSrc.connect(breathFilter).connect(breathGain).connect(masterGain);
  breathSrc.start();

  droneGain = actx.createGain(); droneGain.gain.value = 0.035; droneGain.connect(masterGain);
  const o1 = actx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 54; o1.connect(droneGain); o1.start();
  const o2 = actx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 57.5; o2.connect(droneGain); o2.start();
}
function playHeartbeat(strength) {
  if (!actx) return;
  const t = actx.currentTime;
  const osc = actx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(60, t); osc.frequency.exponentialRampToValueAtTime(28, t + 0.16);
  const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5 * strength, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  osc.connect(g).connect(masterGain); osc.start(t); osc.stop(t + 0.3);
}
function playCreak(strength) {
  if (!actx) return;
  const t = actx.currentTime;
  const src = actx.createBufferSource(); src.buffer = noiseBuffer;
  const filt = actx.createBiquadFilter(); filt.type = 'bandpass';
  const f0 = 180 + Math.random() * 500;
  filt.frequency.setValueAtTime(f0, t); filt.frequency.exponentialRampToValueAtTime(f0 * 0.45, t + 0.5);
  filt.Q.value = 9;
  const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(clamp(0.55 * strength, 0, 0.6), t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45 + Math.random() * 0.3);
  src.connect(filt).connect(g).connect(masterGain); src.start(t); src.stop(t + 0.9);
}
// Many tiny high-passed noise grains scattered over a short window — this is what
// reads as sand/dirt (granular, irregular) instead of a single filtered "whoosh" (a wave).
function playSandCascade(strength, grains, spread) {
  if (!actx) return;
  const t0 = actx.currentTime;
  for (let i = 0; i < grains; i++) {
    const start = t0 + Math.random() * spread;
    const src = actx.createBufferSource(); src.buffer = noiseBuffer;
    const filt = actx.createBiquadFilter(); filt.type = 'bandpass';
    filt.frequency.value = 1800 + Math.random() * 5000;
    filt.Q.value = 2.5 + Math.random() * 4;
    const g = actx.createGain(); g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.025 * strength * (0.4 + Math.random() * 0.8), start + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.015 + Math.random() * 0.035);
    src.connect(filt).connect(g).connect(masterGain);
    src.start(start); src.stop(start + 0.1);
  }
}
// A heavy shovel-load landing on the lid: one low, felt thud, then the load
// sliding/settling as a sand cascade.
function playShovelThud(strength) {
  if (!actx) return;
  const t = actx.currentTime;
  const osc = actx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(50, t); osc.frequency.exponentialRampToValueAtTime(24, t + 0.3);
  const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35 * strength, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc.connect(g).connect(masterGain); osc.start(t); osc.stop(t + 0.45);
  const thumpSrc = actx.createBufferSource(); thumpSrc.buffer = noiseBuffer;
  const thumpFilt = actx.createBiquadFilter(); thumpFilt.type = 'lowpass'; thumpFilt.frequency.value = 200;
  const thumpGain = actx.createGain(); thumpGain.gain.setValueAtTime(0.0001, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.18 * strength, t + 0.01);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  thumpSrc.connect(thumpFilt).connect(thumpGain).connect(masterGain); thumpSrc.start(t); thumpSrc.stop(t + 0.2);
  playSandCascade(strength, 45 + Math.floor(Math.random() * 30), 0.55 + Math.random() * 0.35);
}
// Rare, distant, ambient dirt settling once buried — quiet, small, granular, not a swell.
function playDirtFall() { playSandCascade(0.35 + Math.random() * 0.25, 10 + Math.floor(Math.random() * 10), 0.3); }
function playEscapeSwell() {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(80, t); o.frequency.linearRampToValueAtTime(220, t + 2.5);
  const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 1.5); g.gain.linearRampToValueAtTime(0.0001, t + 3.5);
  o.connect(g).connect(masterGain); o.start(t); o.stop(t + 3.6);
}

// --- DUST / DEBRIS PARTICLES (cheap pooled points, spawned on wall impact) ---
const MAX_DUST = 80;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(MAX_DUST * 3);
const dustVel = [];
const dustLife = new Float32Array(MAX_DUST);
for (let i = 0; i < MAX_DUST; i++) dustVel.push(new V3());
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ color: 0x8a7358, size: 0.012, transparent: true, opacity: 0.7, depthWrite: false });
const dustPoints = new THREE.Points(dustGeo, dustMat);
scene.add(dustPoints);
let dustCursor = 0;
function spawnDust(pos, n, count) {
  for (let k = 0; k < count; k++) {
    const i = dustCursor; dustCursor = (dustCursor + 1) % MAX_DUST;
    dustPos[i * 3] = pos.x; dustPos[i * 3 + 1] = pos.y; dustPos[i * 3 + 2] = pos.z;
    dustVel[i].set((Math.random() - 0.5) * 0.3, Math.random() * 0.2, (Math.random() - 0.5) * 0.3).addScaledVector(n, 0.3 + Math.random() * 0.3);
    dustLife[i] = 0.6 + Math.random() * 0.6;
  }
}
function updateDust(dt) {
  for (let i = 0; i < MAX_DUST; i++) {
    if (dustLife[i] <= 0) continue;
    dustLife[i] -= dt;
    dustVel[i].y -= 0.4 * dt;
    dustPos[i * 3] += dustVel[i].x * dt;
    dustPos[i * 3 + 1] += dustVel[i].y * dt;
    dustPos[i * 3 + 2] += dustVel[i].z * dt;
    if (dustLife[i] <= 0) dustPos[i * 3 + 1] = -999;
  }
  dustGeo.attributes.position.needsUpdate = true;
}

function endGame(state) {
  if (gameState !== 'playing') return;
  gameState = state;
  const el = document.getElementById('ending');
  const txt = document.getElementById('endingText');
  document.getElementById('ui').style.opacity = '0';
  if (state === 'lost') {
    txt.textContent = 'Stay still. Stay calm. Stay—';
    setTimeout(() => el.classList.add('show'), 1200);
  } else {
    playEscapeSwell();
    const fl = document.getElementById('flash');
    fl.style.transition = 'opacity 0.15s'; fl.style.opacity = '1';
    setTimeout(() => { fl.style.transition = 'opacity 2.5s'; fl.style.opacity = '0'; }, 200);
    for (let i = 0; i < 8; i++) setTimeout(() => spawnDust(P[IX.HEAD], new V3(0, 1, 0), 15), i * 120);
    txt.textContent = 'The lid gives way.';
    setTimeout(() => el.classList.add('show'), 2500);
  }
}

// --- INPUT & MOTOR INTENTIONS ---
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === document.body) {
    mouseX = clamp(mouseX + e.movementX * 0.003, -1.2, 1.2); // yaw
    mouseY = clamp(mouseY - e.movementY * 0.003, -0.8, 1.2); // pitch
  }
});
document.body.addEventListener('click', () => { document.body.requestPointerLock(); initAudio(); });
window.addEventListener('keydown', e => { if (e.code === 'KeyR' && gameState !== 'playing') location.reload(); });

let exertionThisFrame = 0, lidPushThisFrame = false;
function applyMotors(dt) {
  // Reset forces to gravity
  for (let i = 0; i < NP; i++) F[i].set(0, -9.81 * MASS[i], 0);

  const forceMul = lerp(1.0, 0.3, fatigue); // struggling too much makes you weaker, forces pacing
  const curlForce = 350 * forceMul;
  exertionThisFrame = 0; lidPushThisFrame = false;
  const active = gameState === 'playing';

  // Left Arm Curl (Q)
  if (active && keys['KeyQ']) {
    const dir = new V3().subVectors(P[IX.SHL], P[IX.HDL]).normalize();
    F[IX.HDL].addScaledVector(dir, curlForce);
    exertionThisFrame += 0.22;
  }
  // Right Arm Curl (E)
  if (active && keys['KeyE']) {
    const dir = new V3().subVectors(P[IX.SHR], P[IX.HDR]).normalize();
    F[IX.HDR].addScaledVector(dir, curlForce);
    exertionThisFrame += 0.22;
  }
  // Left Leg Curl (Z)
  if (active && keys['KeyZ']) {
    const dir = new V3().subVectors(P[IX.HPL], P[IX.FTL]).normalize();
    F[IX.FTL].addScaledVector(dir, curlForce);
    exertionThisFrame += 0.22;
  }
  // Right Leg Curl (C)
  if (active && keys['KeyC']) {
    const dir = new V3().subVectors(P[IX.HPR], P[IX.FTR]).normalize();
    F[IX.FTR].addScaledVector(dir, curlForce);
    exertionThisFrame += 0.22;
  }
  // Push Against The Lid (Space) — the one action that can actually free you
  if (active && keys['Space']) {
    const pushMul = forceMul;
    F[IX.HPL].y += 80 * pushMul; F[IX.HPR].y += 80 * pushMul;
    F[IX.SHL].y += 120 * pushMul; F[IX.SHR].y += 120 * pushMul; // push shoulders UP into the lid, not down
    exertionThisFrame += 0.5;
    // Only counts as real progress if you're actually pressed against the lid and not exhausted
    const nearLid = (CY - P[IX.SHL].y < 0.03) || (CY - P[IX.SHR].y < 0.03);
    if (nearLid && fatigue < 0.85) lidPushThisFrame = true;
  }

  // Calculate local torso axes to determine neck target
  const shMid = new V3().addVectors(P[IX.SHL], P[IX.SHR]).multiplyScalar(0.5);
  const hpMid = new V3().addVectors(P[IX.HPL], P[IX.HPR]).multiplyScalar(0.5);
  const torsoUpLocal = new V3().subVectors(shMid, hpMid).normalize();
  const rightLocal = new V3().subVectors(P[IX.SHR], P[IX.SHL]).normalize();
  const fwdLocal = new V3().crossVectors(rightLocal, torsoUpLocal).normalize();

  // Determine intended neck direction based on mouse
  // Neutral neck is mostly `torsoUpLocal` with a bit of `fwdLocal`
  const targetNeckDir = new V3().copy(torsoUpLocal).multiplyScalar(Math.cos(mouseY))
      .addScaledVector(fwdLocal, Math.sin(mouseY));
  
  // Apply yaw
  targetNeckDir.applyAxisAngle(torsoUpLocal, -mouseX);

  // The head wants to be at shMid + targetNeckDir * neck_length
  const neckLen = 0.25; 
  const targetHeadPos = new V3().copy(shMid).addScaledVector(targetNeckDir, neckLen);
  
  // Apply muscle force to move the head toward the target position
  const neckForce = new V3().subVectors(targetHeadPos, P[IX.HEAD]).multiplyScalar(200);
  F[IX.HEAD].add(neckForce);
}

let impactEnergy = 0, impactPos = null, impactNormal = null;
function physicsStep(dt) {
  applyMotors(dt);

  const dtt = dt * dt, damp = Math.exp(-1.5 * dt); // High air friction/struggle
  impactEnergy = 0; impactPos = null; impactNormal = null;

  for (let i = 0; i < NP; i++) {
    const p = P[i], o = O[i];
    const ax = F[i].x / MASS[i], ay = F[i].y / MASS[i], az = F[i].z / MASS[i];
    const vx = (p.x - o.x) * damp, vy = (p.y - o.y) * damp, vz = (p.z - o.z) * damp;
    o.copy(p);
    p.x += vx + ax * dtt; p.y += vy + ay * dtt; p.z += vz + az * dtt;

    // Coffin Boundary Constraints (AABB) with sliding friction
    const pr = 0.05; // Particle radius collision
    let hit = false, nx = 0, ny = 0, nz = 0;
    const speed = Math.hypot(vx, vy, vz);
    if (p.x < -CX + pr) { p.x = -CX + pr; o.x = p.x; o.y = lerp(o.y, p.y, 0.3); o.z = lerp(o.z, p.z, 0.3); hit = true; nx = 1; }
    if (p.x >  CX - pr) { p.x =  CX - pr; o.x = p.x; o.y = lerp(o.y, p.y, 0.3); o.z = lerp(o.z, p.z, 0.3); hit = true; nx = -1; }
    if (p.y < -CY + pr) { p.y = -CY + pr; o.y = p.y; o.x = lerp(o.x, p.x, 0.3); o.z = lerp(o.z, p.z, 0.3); hit = true; ny = 1; }
    if (p.y >  CY - pr) { p.y =  CY - pr; o.y = p.y; o.x = lerp(o.x, p.x, 0.3); o.z = lerp(o.z, p.z, 0.3); hit = true; ny = -1; }
    if (p.z < -CZ + pr) { p.z = -CZ + pr; o.z = p.z; o.x = lerp(o.x, p.x, 0.3); o.y = lerp(o.y, p.y, 0.3); hit = true; nz = 1; }
    if (p.z >  CZ - pr) { p.z =  CZ - pr; o.z = p.z; o.x = lerp(o.x, p.x, 0.3); o.y = lerp(o.y, p.y, 0.3); hit = true; nz = -1; }
    if (hit && speed > 0.004) {
      const e = speed * MASS[i];
      if (e > impactEnergy) { impactEnergy = e; impactPos = p.clone(); impactNormal = new V3(nx, ny, nz); }
    }

    // Self collision (prevent limbs from phasing entirely)
    for (let j = 0; j < i; j++) {
      const p2 = P[j];
      _a.subVectors(p, p2);
      const dist = _a.length();
      const minDist = 0.12;
      if (dist > 0.0001 && dist < minDist) {
        const push = (minDist - dist) * 0.5;
        _a.normalize().multiplyScalar(push);
        p.add(_a);
        p2.sub(_a);
      }
    }
  }

  // Iterative distance constraint solver
  for (let iter = 0; iter < 4; iter++) {
    for (let k = 0; k < CONS.length; k++) {
      const c = CONS[k], A = P[c.a], B = P[c.b];
      _a.subVectors(B, A); const len = _a.length() || 1e-6;
      let target = len; 
      if (len < c.lo) target = c.lo; 
      else if (len > c.hi) target = c.hi; 
      else continue;
      const diff = (len - target) / len, w = c.wa + c.wb;
      A.addScaledVector(_a, diff * c.wa / w); 
      B.addScaledVector(_a, -diff * c.wb / w);
    }
  }
}

function updateVitalsAudio(dt, panicLevel) {
  const bpm = lerp(52, 150, panicLevel);
  heartTimer += dt;
  if (heartTimer >= 60 / bpm) { heartTimer = 0; playHeartbeat(0.3 + panicLevel * 0.75); }
  const breathHz = lerp(0.2, 0.85, panicLevel);
  breathPhase += dt * breathHz * Math.PI * 2;
  const env = Math.pow(Math.sin(breathPhase) * 0.5 + 0.5, 2);
  if (breathGain) breathGain.gain.value = 0.03 + env * (0.07 + panicLevel * 0.22);
  if (breathFilter) breathFilter.frequency.value = 420 + env * 300 + panicLevel * 200;
}

function updateIntro(dt) {
  introTimer += dt;
  struggling = !!(keys['KeyQ'] || keys['KeyE'] || keys['KeyZ'] || keys['KeyC'] || keys['Space']);

  // Trying does nothing yet — but the fear of that builds anyway.
  panic = clamp(panic + (struggling ? dt * 0.09 : -dt * 0.04), 0, 0.42);
  updateVitalsAudio(dt, panic);

  // Each shovel-load: thud, sand cascade, a jolt from above, and the light drops a notch.
  if (introIndex < INTRO_THUDS.length && introTimer >= INTRO_THUDS[introIndex]) {
    playShovelThud(0.55 + Math.random() * 0.35);
    camShake = Math.max(camShake, 0.9 + Math.random() * 0.6);
    introIndex++;
  }
  const stepLight = 1 - introIndex / INTRO_THUDS.length;
  const introProgress = clamp(introTimer / INTRO_END, 0, 1);
  skyLight.intensity = skyLightBase * stepLight * (0.85 + Math.random() * 0.15) * (1 - introProgress * 0.3);
  headLight.intensity = headLightBase * (0.6 + Math.random() * 0.3);

  // Vignette starts open (the whisper of light) and closes in as the burial completes.
  document.documentElement.style.setProperty('--clear', lerp(24, 13, introProgress).toFixed(1) + '%');
  document.documentElement.style.setProperty('--dark', lerp(0.45, 0.92, introProgress).toFixed(3));

  if (introTimer >= INTRO_END) {
    gameState = 'playing';
    skyLight.intensity = 0;
    oxygen = 100; fatigue = 0; lidStress = 0;
    panic = clamp(panic * 0.55, 0, 1); // the dread doesn't fully reset — some of it stays with you
    const ui = document.getElementById('ui');
    ui.style.opacity = '1';
  }
}

function updateSurvival(dt) {
  if (gameState !== 'playing') { fatigue = Math.max(0, fatigue - dt * 0.2); return; }

  // Fatigue: rises with exertion, recovers when calm
  fatigue = clamp(fatigue + (exertionThisFrame > 0 ? dt * exertionThisFrame * 0.35 : -dt * 0.22), 0, 1);

  // Lid stress: only progresses through genuine, sustained pushing
  if (lidPushThisFrame) lidStress = clamp(lidStress + dt * 7, 0, 100);
  else lidStress = clamp(lidStress - dt * 1.5, 0, 100);

  // Oxygen drains faster the more you exert and the more panicked you are
  const drain = (1.0 + exertionThisFrame * 2.2 + panic * 1.3) * (100 / 150); // ~150s of air at rest baseline
  oxygen = clamp(oxygen - drain * dt, 0, 100);

  // Panic responds to low air and to physical shocks (wall impacts)
  const shock = impactEnergy > 4 ? clamp((impactEnergy - 4) / 20, 0, 0.4) : 0;
  const panicTarget = clamp((35 - oxygen) / 35, 0, 1) * 0.85 + shock;
  panic = lerp(panic, panicTarget, 1 - Math.exp(-dt * (panicTarget > panic ? 3 : 0.4)));

  // Audio: heartbeat tempo/strength and breathing rate/depth follow panic + oxygen
  updateVitalsAudio(dt, panic);

  // Wall/lid impacts: creak sound + dust, throttled so it doesn't spam
  creakCooldown -= dt;
  if (impactEnergy > 3.5 && creakCooldown <= 0) {
    playCreak(clamp(impactEnergy / 18, 0.15, 1));
    if (impactPos) spawnDust(impactPos, impactNormal, 3 + Math.floor(Math.min(impactEnergy, 12)));
    camShake = Math.max(camShake, clamp(impactEnergy / 5, 0, 2.5));
    creakCooldown = 0.35;
  }

  // Rare ambient dirt-shifting sound from above — the world outside, barely audible
  dirtCooldown -= dt;
  if (dirtCooldown <= 0) { playDirtFall(); dirtCooldown = 4 + Math.random() * 7; }

  // Headlamp is really just the faint glow of your own strained eyes — flickers with panic
  if (headLight) headLight.intensity = headLightBase * (0.7 + Math.random() * 0.3) * (1 - panic * 0.5);

  // Vignette: darkens and reddens as air runs out and panic rises
  const clearPct = lerp(13, 6, panic).toFixed(1) + '%';
  const darkAmt = lerp(0.9, 0.985, clamp((40 - oxygen) / 40, 0, 1));
  document.documentElement.style.setProperty('--clear', clearPct);
  document.documentElement.style.setProperty('--dark', darkAmt.toFixed(3));

  // Win / lose
  if (lidStress >= 100) endGame('won');
  else if (oxygen <= 0) endGame('lost');
}

function layout() {
  const W = window.innerWidth, H = window.innerHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', layout);
layout();

let last = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60; last = now;
  
  physicsStep(dt);
  updateMeshes();
  if (gameState === 'intro') updateIntro(dt);
  else updateSurvival(dt);
  updateCamera(dt);
  updateDust(dt);

  renderer.render(scene, camera);
}
requestAnimationFrame(loop);

})();
</script>
</body>
</html>

## Response:
9/22/2026, 8:14:36 AM

> **Searched 2 websites**
>
> 
>
> Worked for 8s

Yes. I think the missing piece is that the game currently has a very strong physiological/audio system, but visually it still reads as "a dark 3D scene." It needs to read as "I am physically inside a box."

I did a visual pass specifically around coffin interiors, extreme low-light vision, fireflies/bioluminescence, and sleep-paralysis imagery. The important thing is that you do not need more visual *events*. You need a small number of visual anchors that become increasingly unreliable.

![Image](https://images.openai.com/static-rsc-4/zxtv2Z9YX6IKqkE9a8Crh3EkcVndtXm-_KDbvPeHS3JiMP7cniboyBIfnDCpPOwxZJkkY-bXvAim45Op74HE3_GrtRZn07RQgN1UVWSBG3Wt5fAQGw79FoeqcZAwc4NymLQN4vmGB536zw0Z0WZaj3GgQSPlrq4DWs6qt1AiW7GJR2BcZ-tljWYUVMQnFjw2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/b6Ag--u7I954dAbpw3YHvpfGg8dvGuwN-2fm1MlAS0xgBAdoCamRa0RQxzuCz6oHNkDtFA4As7mEhbEWAnLt9C9cS0ytsLm8_Ykp-mkf-UiuIjJZ3dXRr4stgc23ojoaZ4_mrL19H-jtfALf2k1OOgWi4QWuZ4GXie_yErnYvoHezpH7YvSp8MO-YWOlmuHr?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/zn5Xyw5Tq3VvkNWDq_-G5m1IrCqq0hIr2IZtFwvcIAfKQR4F3sDwDcCTxi59mQm9dUxRSaWNBqsakUMyJahHpcDSMpPs_6fQIky7sK5O7_BVny2VSxShWoy91j7D5bShO5RiVRzrFvCUfzDp1yPTcr_6ECVyAxSEi3l_CH7hPVpMBuPhOEA7xXG-DeyrJ1X_?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/ljB4jq7erJdR1bBlnQs4ehsHQtHsLej2eUxfkZVed9YcMrMqGo9DKL9YZ6JgKAdU32WRJzvS-5yJktGuGYjGZFEFi9-iIACZ7bQZGiNo-GJw00wgBNJiNUM9r0Ifu4q82a-bzcN6WPSkkUtk15a6IFlqpGoyBZlsC3gLWBHkY6cbL1gt8kGOUipUnB-dqd4z?purpose=fullsize)

The useful visual references here are surprisingly simple: the face nearly touching the lid, a very small amount of directional light, wood texture becoming visible only where illumination reaches it, and huge areas of unresolved blackness.

## The biggest change: give the darkness a physical surface

Right now:

```js
const coffinMat = new THREE.MeshStandardMaterial({
  color: 0x120d09,
  roughness: 1.0,
  side: THREE.BackSide
});
```

is basically giving you a black volume.

That's the wrong kind of darkness.

You want the player to constantly be able to infer:

**lid above me**
**wall beside me**
**wall behind my head**
**my shoulder is touching this**
**there is approximately this much space between my face and the lid**

But you don't want them to see the whole coffin clearly.

So I would make the coffin interior extremely tactile:

### 1. Lid

The lid should be the dominant visual object.

Not a black ceiling.

A piece of wood approximately 10-20 cm above the face.

You should see:

- wood grain
- seams between boards
- tiny imperfections
- knots
- nail heads
- occasional dirt falling from a seam
- perhaps a slight curvature/warping
- the occasional vibration when dirt lands above

And critically:

**the lid should move imperceptibly when you push it.**

Not enough to make escape obvious. Maybe 1-3 mm.

That creates an absolutely brutal feedback loop:

> push  
> lid moves  
> push harder  
> lid moves slightly more  
> stop  
> it settles back

That is much more powerful than another UI meter.

---

# 2. The firefly is actually a fantastic idea

But I wouldn't make it a conventional glowing firefly floating around like a magical companion.

Make it feel accidental.

Something like:

```text
        LID
  ─────────────────
       •
      /
     /       <- tiny insect

face

  ─────────────────
       BODY
```

It initially crawls/floats somewhere near the coffin's upper interior.

Its light is the player's **visual reference point**.

At the beginning:

**green/yellow pulse**

You can see:

- your hands
- fragments of your shirt
- the wood grain
- the insect itself
- dust particles
- the edges of the lid

Then as the experience progresses:

### Stage 1
The firefly pulses normally.

### Stage 2
It becomes the only reliable light.

### Stage 3
Its flashes become irregular.

### Stage 4
It disappears for longer periods.

### Stage 5
The player starts looking directly toward it to see.

### Stage 6
The flash comes late.

### Stage 7
One weak pulse.

### Stage 8

Nothing.

And that's the moment the player discovers something horrible:

**the world didn't become darker. Their visual reference disappeared.**

That's much more interesting.

Firefly bioluminescence also gives you a naturally tiny, localized light source rather than bathing the entire scene in ambient illumination. ![Image](https://images.openai.com/static-rsc-4/zn5Xyw5Tq3VvkNWDq_-G5m1IrCqq0hIr2IZtFwvcIAfKQR4F3sDwDcCTxi59mQm9dUxRSaWNBqsakUMyJahHpcDSMpPs_6fQIky7sK5O7_BVny2VSxShWoy91j7D5bShO5RiVRzrFvCUfzDp1yPTcr_6ECVyAxSEi3l_CH7hPVpMBuPhOEA7xXG-DeyrJ1X_?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/kKF6WTnh37ryj6zmuSY5l4FQH1AKEoDwfioHrX7bDPzemRJWjbsWCvqX8OmdosgDFOwoMFfP7fMMcjkh08VwcpkpRy88bpl2QyHzw_fq83VQXlWWFfKhELudfZQ2h7WLXVHdgAAgrqY2K6EusypyBurw7scwcsyG03_P23w1pgEMF1zd4JrOE0nbnv_LnkOf?purpose=fullsize)

---

# But there's an even better trick

Don't make the firefly's light behave like a flashlight.

Make it behave like **biological light**.

Something approximately:

```text
          flash
           *
          ***
         *****
          ***
           *

          dark

              flash
               *
              ***
```

The light should pulse rather than continuously illuminate.

That means the player gets:

**frame of information → darkness → frame of information → darkness**

And the information can subtly change between flashes.

That opens a really interesting visual possibility.

During panic, the player sees:

> hand

dark

> lid

dark

> insect

dark

> something that might have been a hand

dark

> wood

dark

> nothing

Now the visual system itself begins behaving like the unreliable perception you're researching.

---

# 3. Don't make the vignette the main visual degradation

This is probably the biggest thing I'd change in your current code.

You've currently got:

```js
const clearPct = lerp(13, 6, panic)
```

and increasingly dark edges.

That's videogame vision.

Human low-light vision is stranger.

Under scotopic conditions, rod-dominated vision becomes low-resolution and essentially colorless, with reduced central acuity and slower temporal processing. ([NCBI](https://www.ncbi.nlm.nih.gov/books/NBK542177/?utm_source=chatgpt.com))

So instead of:

**normal image → smaller circle → black**

I'd do:

**color → desaturated → grainy → low contrast → peripheral movement → blur → fragments**

The player shouldn't necessarily see *less screen*.

They should see a **worse interpretation of the same screen**.

---

# 4. Make the firefly exploit human vision

This is where the research gets really useful.

At low light:

- rods become increasingly important
- color information deteriorates
- spatial resolution falls
- very dim objects are easier to detect outside the center of gaze

([PubMed Central (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10844829/?utm_source=chatgpt.com))

So you can create a beautiful little nightmare:

The firefly is dim.

If the player looks directly at it:

**it almost disappears.**

If they look slightly away:

**there it is.**

That is an actual low-light visual phenomenon you can turn into gameplay.

So the player learns:

> Don't look directly at the light.

That would be fucking eerie because the player isn't being told this.

They discover it.

---

# 5. Your coffin needs a "material identity"

Right now I would add three distinct surfaces:

### Lid
Rough dark wood.

### Interior walls
Slightly lighter wood, but almost never directly illuminated.

### Bottom
Dark fabric / rough lining.

This gives the player a sensory map.

You don't need realistic modeling.

You need **recognizable surfaces under intermittent illumination**.

Think about this reference:

![Image](https://images.openai.com/static-rsc-4/b6Ag--u7I954dAbpw3YHvpfGg8dvGuwN-2fm1MlAS0xgBAdoCamRa0RQxzuCz6oHNkDtFA4As7mEhbEWAnLt9C9cS0ytsLm8_Ykp-mkf-UiuIjJZ3dXRr4stgc23ojoaZ4_mrL19H-jtfALf2k1OOgWi4QWuZ4GXie_yErnYvoHezpH7YvSp8MO-YWOlmuHr?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/zxtv2Z9YX6IKqkE9a8Crh3EkcVndtXm-_KDbvPeHS3JiMP7cniboyBIfnDCpPOwxZJkkY-bXvAim45Op74HE3_GrtRZn07RQgN1UVWSBG3Wt5fAQGw79FoeqcZAwc4NymLQN4vmGB536zw0Z0WZaj3GgQSPlrq4DWs6qt1AiW7GJR2BcZ-tljWYUVMQnFjw2?purpose=fullsize)

The important thing isn't "coffin."

It's the relationship:

**face → lid → tiny light → darkness**

That composition should basically become your game's visual logo.

---

# 6. Dirt should become a visual system, not just an audio system

You've already got:

```js
playDirtFall()
```

but the dirt is mostly sound.

Give the dirt a visual consequence.

When something settles above:

```text
     lid
────────────────────
  ·  ·      ·
       ·
     dust
       ↓

       face
```

A tiny amount of particulate matter should fall through cracks.

Not a sandstorm.

Maybe 3-8 particles.

And because the firefly is illuminating them, they briefly become visible.

So:

**THUD**

tiny vibration

dust particles fall

firefly illuminates them

they disappear into darkness

That creates the sensation that there's an enormous physical world directly above you without ever showing it.

---

# 7. The sky light should leave evidence after it disappears

Your current intro is:

```js
skyLight.intensity = 0;
```

That's functional but visually abrupt.

Instead, when the burial finishes, I want the player's visual memory of the outside world to remain for a few seconds.

Something like:

### Burial

blue-white daylight

↓

dirt

↓

smaller opening

↓

warm/brown

↓

tiny slit

↓

dark

Then when the lid finally closes:

**the player's eyes should temporarily retain the brightness.**

A subtle afterimage.

Then:

black

then

the firefly.

That gives you:

**outside world → darkness → tiny artificial/biological world**

The firefly becomes the replacement sun.

That's psychologically much stronger.

---

# 8. There should be one "impossible" visual system

This is where the sleep-paralysis research becomes useful.

Sleep paralysis isn't simply "dark + monster." It involves a dissociation between conscious awareness and REM motor atonia, and can involve vivid visual, auditory and tactile hallucinations, including sensed presence, figures, pressure and suffocation. ([PubMed](https://pubmed.ncbi.nlm.nih.gov/39184697/?utm_source=chatgpt.com))

So I would **not** put a monster in the coffin.

Instead, occasionally make the environment betray the player.

For example:

### Very high panic

The firefly flashes.

For one frame:

There appears to be a **second light**.

Then nothing.

Another flash.

Nothing.

Another flash.

The player starts wondering:

> Was there something else in here?

That's much more sleep-paralysis-like than a creature.

Or:

The firefly lands on the lid.

Flash.

There appears to be a tiny dark silhouette beside it.

Dark.

Flash.

Nothing.

You never confirm anything.

---

# 9. Give the player "false spatial information"

This is the really juicy one.

The coffin is physically tiny.

But during severe panic, the visual system can become unreliable.

So perhaps:

**the lid appears farther away for a moment.**

Not literally changing geometry.

Just:

- slight FOV expansion
- depth distortion
- blur
- camera drift
- contrast change

Then suddenly:

**WHAM**

the lid feels inches from the face again.

You can create the sensation:

> "I thought there was more room."

That is much more disturbing than adding geometry.

---

# 10. The final oxygen phase should visually become strangely beautiful

This is where your calm-before-death idea becomes important.

Don't make the ending:

```text
panic ↑
panic ↑
panic ↑
BLACK
```

Make it:

```text
panic
panic
panic
panic
...
...
...
calm
```

And visually:

### 100-60 oxygen
Normal firefly.

### 60-35
Less color.

### 35-20
Firefly becomes extremely important.

### 20-10
Vision loses contrast.

### 10-5
The firefly looks beautiful.

Not scary.

Beautiful.

### 5-0

The insect gives one final pulse.

The wood is briefly illuminated.

Dust hangs motionless.

Heartbeat fades.

Breathing disappears.

The player is looking at this tiny living light.

Then:

**black.**

That gives the entire experience a visual arc instead of merely a horror filter.

---

# And I would change one thing in your existing code immediately

This:

```js
// Headlamp is really just the faint glow of your own strained eyes
if (headLight) headLight.intensity =
    headLightBase * (0.7 + Math.random() * 0.3) * (1 - panic * 0.5);
```

I would kill it.

The player's eyes don't emit light.

More importantly, it makes the darkness less meaningful because you're effectively giving yourself a permanent flashlight.

Replace it with:

**firefly light + intermittent environmental illumination.**

Then the scene has an actual visual logic.

---

# The visual architecture I'd build

Not 30 effects.

Six systems.

```text
                  COFFIN
                     │
        ┌────────────┼────────────┐
        │            │            │
       WOOD        FIREFLY       DUST
        │            │            │
        │            │            │
     physical     visual       evidence of
     enclosure    anchor       outside world
        │            │            │
        └────────────┼────────────┘
                     │
                 PERCEPTION
                     │
          ┌──────────┼──────────┐
          │          │          │
       contrast    color      spatial
        loss       loss       distortion
          │          │          │
          └──────────┼──────────┘
                     │
                 HALLUCINATION
                     │
                ambiguous things
```

That is the missing architecture.

The **coffin** tells you where you are.

The **firefly** tells you where you can see.

The **dust** tells you what's happening outside.

The **physiology** determines what your eyes can perceive.

The **hallucination system** makes you question what you perceived.

And the **sound** tells you what you cannot see.

That gives each sensory channel a different job.

---

## One more thing I really like about this direction

The sleep-paralysis imagery research keeps showing the same visual grammar: a basically ordinary environment, extreme helplessness, an ambiguous presence, and sensory information that feels real enough to be believed. ([PubMed Central (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4958367/?utm_source=chatgpt.com))

So I would resist turning *Cwoffin* into conventional horror.

No demon.

No gore.

No giant monster.

No "BOO."

The terrifying visual object is:

**a wooden lid 12 centimeters from your face.**

Then eventually:

**you can't see the lid anymore.**

And the tiny insect that was helping you see it has stopped flashing.

That is the visual identity I'd chase.

---

**Sources:**

- [Photopic Vision - StatPearls - NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK542177/?utm_source=chatgpt.com)
- [Seeing in the dark: High-order visual functions under scotopic conditions - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10844829/?utm_source=chatgpt.com)
- [Recent Insights Into Sleep Paralysis: Mechanisms and Management - PubMed](https://pubmed.ncbi.nlm.nih.gov/39184697/?utm_source=chatgpt.com)

## Prompt:
9/22/2026, 8:16:16 AM

can you help with the code

## Response:
9/22/2026, 8:16:32 AM

Yes. The code is already structured well enough that we can add the visual layer without gutting the physics/audio. I’d wire the firefly, physical coffin surfaces, low-light degradation, and the final calm phase directly into what you have.

> **Improving the firefly**
>
> I’m updating the scene with a softly glowing, animated firefly point light, brighter emissive material, warmer illumination, and subtle wooden interior details while preserving the existing spooky composition and controls.
>
> **Improved the firefly**
>
> 
>
> Worked for 44s

Data analysis isn't available right now. Do you want to continue without it?



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)