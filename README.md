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
npm run build
npx gh-pages -d dist
```

Pushes the built app to the `gh-pages` branch, which GitHub Pages serves at the custom domain configured in the repo settings.
