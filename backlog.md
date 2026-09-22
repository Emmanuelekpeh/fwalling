# Cwoffin Backlog

## Priority 1: Core Physics & Environment
- [x] **Feature:** Base Coffin Environment
  - *Details:* Setup Three.js scene, renderer, and an enclosed box for the coffin. Add claustrophobic, dark lighting.
- [x] **Feature:** Ragdoll Verlet Physics
  - *Details:* Implement 13-particle physics system with distance constraints. Ensure the particles collide and friction correctly against the 6 interior walls of the coffin.

## Priority 2: Embodiment & Agency
- [x] **Feature:** First-Person Head Camera
  - *Details:* Attach perspective camera to the HEAD particle. Allow limited mouse look that applies torque/forces to the neck, struggling against the coffin constraints.
- [x] **Feature:** Motor Intentions
  - *Details:* Map keys (Q, E, Z, C, Space) to apply forces or shift distance constraint targets (curling limbs). Input doesn't guarantee movement, only applies force vectors that resolve against walls.

## Priority 3: The Ecosystem (Centipedes)
- [x] **Feature:** Centipede Rendering
  - *Details:* Use `THREE.InstancedMesh` to render hundreds of multi-segment centipedes efficiently (CPU-aware, minimal draw calls).
- [x] **Feature:** Surface Crawling Logic
  - *Details:* Write logic for centipedes to navigate along the coffin walls and over the ragdoll's collision capsules/particles. Introduce density/avoidance behavior so they swarm realistically.
