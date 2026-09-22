# Falling Dream Sim - Plan

## Objective
Improve the existing `index.html` falling simulation to better align with the conceptual vision of an "embodied falling experience" as described in the ChatGPT transcript.

## Identified Areas for Improvement

### 1. Dream Logic & Environment Responsiveness
*   **Current State:** The environment generates slabs (`sky`, `canyon`, `shaft`, `debris`) procedurally, but blindly. The floor just fades out using opacity when approaching.
*   **Proposed Improvement:** Tie the environment generation to the ragdoll's physical state.
    *   *High Rotation (`torsoW`)* -> Increase structural chaos (e.g., tilted towers, weird angles).
    *   *Upside Down* -> Invert gravity visually or spawn inverted structures.
    *   *Near Impact* -> Instead of just fading the floor, warp the geometry (e.g., sinkhole effect) or abruptly shift the palette/fog.

### 2. The Anti-Impact System (Floor Dissolve)
*   **Current State:** The floor uses a polar grid with a shader that fades transparency.
*   **Proposed Improvement:** Enhance the shader to include vertex displacement (shattering, melting, or opening a vortex) when the body gets dangerously close, selling the "dream-like" escape.

### 3. Visuals & Post-Processing
*   **Current State:** Standard Three.js rendering.
*   **Proposed Improvement:** Add `EffectComposer` with `UnrealBloomPass` and potentially some motion blur/chromatic aberration to make it feel less like a game and more like a lucid dream.

### 4. Asset Integration (Blender)
*   **Current State:** Ragdoll and debris are made of primitive shapes (boxes, spheres, cylinders).
*   **Proposed Improvement:** Utilize Blender (via the user's available tools) to model a more sophisticated, stylistic ragdoll and environment pieces, then export to GLTF and load them into the scene.

## Next Steps
Await user feedback to prioritize these areas and proceed to Phase 2 (Architecture Design) for the selected features.
