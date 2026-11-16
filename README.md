# Laocoön — Bronze and Time

A cinematic, scroll-driven WebGL landing page built around a bronze horse sculpture. Single self-contained `index.html` — no build step, no framework, no bundler.

![Bronze and Time](https://api.getlayers.ai/storage/v1/object/public/public/assets/laocoon-59f84455c6/1.png)

---

## Overview

The page is a 900vh scroll experience where everything is driven by scroll position — camera orbit, shader palette, particle turbulence, slide reveals, and progress indicators. The bronze horse lives on a deep-black stage lit with a chiaroscuro three-point rig; molten forge sparks rise around it; a liquid-bronze wave shader breathes in the background and shifts from molten copper at the top to deep sapphire blue at the bottom.

---

## Features

- **WebGL scene** — Three.js r160, ACES Filmic tone mapping, PCF soft shadows
- **360° camera orbit** — full revolution as you scroll, with inertia lerp and a framing shift that clears the text columns on the first screen
- **Liquid-bronze wave shader** — procedural layered sine waves, scroll-driven bronze → sapphire palette transition, vignette
- **450 forge sparks** — additive point particles, 60% molten orange / 40% icy blue, turbulence on fast scroll
- **Per-letter title reveal** — blur-up animation (12px → 0, 50px rise), 0.035s stagger per character
- **Slide-2 editorial image** — `clip-path` wipe + 1.15 → 1 parallax zoom
- **5-column vertical grid** — drifting dots + stories-style 4-segment scroll progress bar
- **Double-ring cursor** — inner snaps, outer lerps at 0.2 factor
- **Nav scroll** — each nav link jumps to its slide's scroll milestone via `window.scrollTo`

---

## Tech Stack

| Piece | Detail |
|---|---|
| Renderer | Three.js `r0.160` via unpkg importmap |
| Model loader | `GLTFLoader` addon |
| Fonts | Italiana (display), Outfit 300/400/600 (body) — Google Fonts |
| Assets | Hosted on Supabase Storage (public bucket) |
| Build | None — pure HTML/CSS/JS, single file |

---

## Assets

| File | Purpose |
|---|---|
| `bronze_horse.glb` | Main sculpture — auto-scaled to max dim 3.5, recentered, pivot at `y = -0.4` |
| `1.png` | Editorial image in slide 2 |

Both served from:
```
https://api.getlayers.ai/storage/v1/object/public/public/assets/laocoon-59f84455c6/
```

The spark texture is generated procedurally in code (radial canvas gradient, no file).

---

## Usage

Open `index.html` directly in any modern browser. No server required — everything loads from CDN and the public asset bucket.

```bash
open index.html
# or
npx serve .
```

> **Note:** Three.js importmaps require a browser that supports ES module importmaps (Chrome 89+, Firefox 108+, Safari 16.4+). The page will not work in Internet Explorer.

---

## Scroll Map

| Scroll % | Event |
|---|---|
| 0 – 12% | Slide 1 — *Bronze and Time* active |
| 28 – 40% | Slide 2 — *Marble Emotion* + editorial image wipe |
| 56 – 68% | Slide 3 — *Liquid Metal* |
| 84 – 100% | Slide 4 — *Eternal Moment* |

Shader palette completes its bronze → sapphire transition over the full scroll range. Camera completes one full 360° orbit at 100% scroll.

---

## Scene Parameters

```
Camera          PerspectiveCamera(50°, aspect, 0.1, 100)
                start (0, 0.2, 3.0)

Orbit           phi = scroll × 2π
                radius = 4.2 − sin(scroll × π) × 0.6
                y = 0.35 + sin(scroll × π) × 0.8

Lights          Ambient       #ffffff  @ 0.1
                Key SpotLight #ffffff  @ 18.0  pos (4, 6, 3)  shadow 2048²
                Rim Direct.   #e3f2ff  @ 10.0  pos (−5, 3, −4)
                Fill Direct.  #fff3e6  @ 0.8   pos (−2, −4, 2)

Bronze mat.     roughness 0.42 · metalness 0.92 · flatShading false · anisotropy 16

Sparks          450 particles · size 0.025 · additive blending · opacity 0.85
                recycle bounds: y > 3.0 or |x|/|z| > 3.5

Lerp factors    scroll 0.025 · mouse 0.05 · outer cursor 0.2
```

---

## Structure

```
index.html
├── <style>          reset, layout, slides, grid, cursor
├── Cursor divs      .cursor-inner / .cursor-outer
├── .cinematic-container
│   ├── .main-header brand + nav + contact button
│   ├── #slide-1     Bronze and Time (two-column layout)
│   ├── #slide-2     Marble Emotion
│   ├── #slide-3     Liquid Metal
│   └── #slide-4     Eternal Moment
├── #slide-2-img     editorial image mask (fixed, z-index 2)
├── .grid-lines      5 vertical lines + drifting dots + story progress
├── <canvas #webgl>
└── <script type="module">
    ├── Three.js scene, camera, renderer
    ├── createBackgroundShader()   wave plane parented to camera
    ├── createSparks()             450 additive particles
    ├── loadModel()                GLTFLoader + material + scale + center
    ├── animate()                  rAF loop — scroll lerp, orbit, sparks, slides
    ├── splitTitlesIntoChars()     per-letter span injection
    ├── updateSlides()             active class + stories progress
    ├── updateGridDots()           drifting dot positions
    └── setupNavigation()          nav click → scrollTo milestone
```

---

## License

MIT — do whatever you want with it.
