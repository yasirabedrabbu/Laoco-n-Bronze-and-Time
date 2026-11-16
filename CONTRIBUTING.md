# Contributing

Thanks for your interest in improving this project. This guide explains how to propose changes.

## Code of Conduct

Be respectful and constructive. Harassment or personal attacks are not tolerated.

## Ways to Contribute

- Report bugs
- Suggest features or visual improvements
- Improve performance or accessibility
- Fix typos and documentation

## Reporting Bugs

Open an issue and include:

- What you expected and what happened instead
- Steps to reproduce
- Browser, version, OS and device (including GPU if you know it)
- Screenshot or screen recording
- Console errors (press `F12`, open the Console tab)

For security problems, **do not open an issue**. Follow [SECURITY.md](./SECURITY.md).

## Development Setup

```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
npm install
npm run dev
```

You need Node.js 18.18+. Make sure these exist locally:

- `public/models/bronze_horse.glb`
- `public/images/1.png`

## Workflow

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your change.
3. Run the checks:
   ```bash
   npm run build
   ```
4. Commit using the message format below.
5. Push and open a Pull Request against `main`.

### Branch names

| Prefix | Use for |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `perf/` | Performance work |
| `docs/` | Documentation only |
| `refactor/` | Code change with no behavior change |

### Commit messages

Use the format `type: short summary` in the present tense.

```
feat: add bloom post-processing to sparks
fix: correct shader resolution on retina screens
docs: update scroll map table
```

## Code Guidelines

**General**

- TypeScript only. Avoid `any`; if you must use it, add a comment explaining why.
- Keep components small and focused. Scene logic lives in `lib/`, UI in `components/`.
- Styles go in `app/globals.css`. Reuse existing CSS variables.

**Animation loop (`lib/scene.ts`)**

This code runs every frame, so be strict:

- No `document.querySelector` or DOM reads inside the loop. Cache nodes once.
- No `new THREE.Vector3()` (or other allocations) per frame. Reuse objects.
- Use `transform` and `opacity` for animation, not `top`, `left` or `height`.
- Use delta-time damping (`damp(rate, dt)`), not fixed per-frame lerp factors.
- Anything you create in Three.js must be disposed in `dispose()`.

**Accessibility**

- Respect `prefers-reduced-motion`.
- Decorative elements get `aria-hidden="true"`.
- Interactive elements must be keyboard reachable.

**Assets**

- Keep the GLB under 20 MB and images optimized.
- Do not add assets you do not have the right to distribute.

## Pull Request Checklist

- [ ] `npm run build` passes with no errors
- [ ] Tested on desktop and a mobile viewport
- [ ] Tested with `prefers-reduced-motion` on (if animation changed)
- [ ] No new console errors or warnings
- [ ] No secrets, API keys or large unnecessary files committed
- [ ] New dependencies are justified in the PR description
- [ ] Screenshot or short video attached for any visual change
- [ ] README updated if behavior or setup changed

## Review Process

A maintainer will review your PR, usually within a week. You may be asked to make changes. Once approved, it is merged into `main` and deployed automatically.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).