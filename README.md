# Laocoön — Bronze and Time

A cinematic, scroll-driven WebGL experience built around a bronze horse sculpture. Built with Next.js, TypeScript and Three.js.

**Live demo:** https://YOUR-PROJECT.vercel.app

![Bronze and Time](./public/images/1.png)

---

## Overview

The page is a 900vh scroll experience. Everything is driven by scroll position: camera orbit, shader palette, particle turbulence, slide reveals and progress indicators. The bronze horse sits on a deep-black stage lit with a three-point rig, forge sparks rise around it, and a liquid-bronze wave shader shifts from molten copper at the top to deep sapphire at the bottom.

## Features

- **WebGL scene:** Three.js r160, ACES Filmic tone mapping, PCF soft shadows
- **360° camera orbit** that completes one full revolution over the scroll range
- **Liquid-bronze wave shader** with a scroll-driven bronze to sapphire palette
- **450 forge sparks** (additive points, 60% orange, 40% icy blue) with scroll turbulence
- **Per-letter title reveal** with blur-up animation and screen-reader friendly labels
- **Editorial image wipe** on slide 2 using `clip-path` and a parallax zoom
- **Vertical grid** with drifting dots and a 4-segment story progress bar
- **Double-ring cursor** with hover state (fine pointers only)
- **Preloader** with real loading progress and an error state
- **Responsive layout** for mobile and tablet
- **Accessibility:** `prefers-reduced-motion` support, `aria-label` on split titles
- **Frame-rate independent smoothing** (same feel on 60Hz and 144Hz)

## Tech Stack

| Piece | Detail |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| 3D | Three.js r160 + `GLTFLoader` |
| Shaders | Custom GLSL (background waves) |
| Styling | Plain CSS (`app/globals.css`) |
| Fonts | Italiana, Outfit via `next/font` |
| Hosting | Vercel |

## Getting Started

### Requirements

- Node.js 18.18 or newer
- npm 9 or newer

### Install and run

```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |

## Assets

Place these files before running the project:

| File | Purpose |
|---|---|
| `public/models/bronze_horse.glb` | Main sculpture. Auto-scaled to max dimension 3.5 and recentered |
| `public/images/1.png` | Editorial image for slide 2 |

The spark texture is generated in code, no file needed.

**Tip:** keep the GLB under 20 MB. You can compress it with:

```bash
npx @gltf-transform/cli optimize public/models/bronze_horse.glb public/models/bronze_horse.glb --compress meshopt
```

(If you use Meshopt, register `MeshoptDecoder` on the `GLTFLoader` in `lib/scene.ts`.)

## Project Structure

```
app/
  layout.tsx        Root layout, fonts, metadata
  page.tsx          Home page
  globals.css       All styles
components/
  Experience.tsx    Client component: DOM overlay, cursor, slides, nav
  SplitTitle.tsx    Per-letter animated heading
lib/
  scene.ts          Three.js scene, camera, lights, sparks, model, render loop
  shaders.ts        GLSL for the background wave shader
public/
  models/           GLB model
  images/           Static images
```

## Scroll Map

| Scroll % | Event |
|---|---|
| 0 – 12% | Slide 1: Bronze and Time |
| 28 – 40% | Slide 2: Marble Emotion + image wipe |
| 56 – 68% | Slide 3: Liquid Metal |
| 84 – 100% | Slide 4: Eternal Moment |

## Scene Parameters

```
Camera       PerspectiveCamera(50°, aspect, 0.1, 100), start (0, 0.2, 3.0)
Orbit        phi = scroll × 2π
             radius = 4.2 − sin(scroll × π) × 0.6
             y = 0.35 + sin(scroll × π) × 0.8
Lights       Ambient #ffffff @ 0.1
             Key SpotLight #ffffff @ 18 at (4, 6, 3), shadow 2048²
             Rim Directional #e3f2ff @ 10 at (-5, 3, -4)
             Fill Directional #fff3e6 @ 0.8 at (-2, -4, 2)
Bronze       roughness 0.42, metalness 0.92
Sparks       450 particles, size 0.025, additive, opacity 0.85
Smoothing    exponential damping: scroll 1.5, mouse 3.1, camera 5, cursor ring 13.4
```

## Browser Support

Any modern browser with WebGL2: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

## Deployment

1. Push to GitHub.
2. Import the repo on [Vercel](https://vercel.com).
3. Deploy. No environment variables are required.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## Credits

- Original single-file concept: *Laocoön — Bronze and Time*
- Fonts: Italiana and Outfit (Google Fonts, OFL)
- 3D engine: [Three.js](https://threejs.org)

## License

MIT. See [LICENSE](./LICENSE).