# Dignivirtus

A gamified fitness tracker: a 0–100 "Overall" rating built from five attributes (Strength, Endurance, Mobility, Recovery, Speed), a 20-badge collection with six tiers each (Bronze → Silver → Gold → Hall of Fame → Legend), a live workout logger, and step/water/sleep tracking. Everything is computed from what you actually log — no backend, data lives in your browser (`localStorage`).

Live at [dignivirtus.com](https://dignivirtus.com).

## Development

```bash
npm install
npm run dev
```

## Deploying

```bash
npm run deploy
```

Builds and pushes to the `gh-pages` branch, which GitHub Pages serves at dignivirtus.com. `public/CNAME` carries the custom domain into every build — don't delete it.
