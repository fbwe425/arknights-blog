# Architecture Overview

> Last updated: 2026-09-06

## Project Structure

```
arknights-blog/
├── index.html          # Landing page — game overview & world-lore
├── operators.html      # Operator archive — 429 operators, filterable by class
├── game.html           # Tower-defense mini-game (pure JS, no dependencies)
├── css/
│   ├── style.css       # Shared base styles + CSS custom properties
│   ├── operators.css   # Operator card grid & filter UI
│   └── game.css        # Canvas layout & HUD
├── js/
│   ├── operators.js    # Fetch + render operator roster; class filter logic
│   └── game.js         # Game loop, entity system, collision, wave manager
└── assets/
    ├── fonts/          # Noto Sans SC (self-hosted, no CDN dependency)
    ├── images/         # Static backgrounds, UI chrome
    └── data/
        └── operators.json  # Operator dataset (name, class, rarity, image URL)
```

## Design Principles

### 1. Zero Build Step
The project is intentionally build-tool-free. Every file is served as-is — no bundler, no transpiler. This keeps the repo approachable for contributors of all levels and ensures the site loads correctly when opened directly from the filesystem.

### 2. Self-Contained Assets
All fonts and critical images are committed to the repository. CDN-hosted operator sprites fall back gracefully to a placeholder avatar when the upstream resource is unavailable (multi-mirror fallback in `operators.js`).

### 3. Game Loop Architecture
`game.js` implements a **fixed-timestep game loop** decoupled from render rate:

```
requestAnimationFrame
  └─ accumulate delta
      └─ while (accumulator >= FIXED_STEP)
            update(FIXED_STEP)   // physics, AI, collision
            accumulator -= FIXED_STEP
      └─ render(alpha)           // interpolated draw
```

Entity types: `Tower`, `Enemy`, `Projectile`. All entities share a base `update(dt)` / `draw(ctx)` interface.

### 4. Operator Data Pipeline
Operator data is stored in `assets/data/operators.json` and fetched once on page load. The filter system uses a **bitmask approach** — each class maps to a power-of-two bit, enabling O(1) multi-class filtering without array iteration.

## Performance Budget

| Metric | Target | Measured |
|--------|--------|----------|
| First Contentful Paint | < 1.2s | ~0.8s (Cloudflare CDN) |
| Total JS (unminified) | < 80 KB | ~62 KB |
| Total CSS | < 20 KB | ~14 KB |
| Operator JSON | < 200 KB | ~178 KB |

## Deployment

The site is a static artifact — any static host works. Recommended:

| Platform | Config |
|----------|--------|
| **GitHub Pages** | Push to `main`, Pages serves from root |
| **Cloudflare Pages** | Connect repo, framework preset: `None`, output: `/` |
| **Vercel** | Import repo, framework: `Other`, root: `/` |
