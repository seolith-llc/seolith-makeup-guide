# Blendwise

Blend wisely. A step-by-step makeup guide that runs completely offline as a Progressive Web App.

## What it does

- **Guided looks**: seven routines from a 5-minute face to full glam, each step with how-to, tips, common mistakes and a timer.
- **Before and after**: a layered illustration that adds one product at a time so you can see what each step changes.
- **Time estimate**: per-step minutes for beginner, intermediate and advanced, personalised after three timed runs, plus "I have N minutes" suggestions.
- **Products**: curated catalogue with editorial ratings, skin-type fit and Amazon affiliate links with full disclosure.
- **My Kit**: period-after-opening tracker that tells you when to replace mascara, liner and everything else.
- **Insights**: streaks, average time versus estimate, slow steps and a suggested next look.
- **Feedback**: feature requests, bug reports and content corrections, stored on-device and shareable.
- **Share and invite**: Web Share API with anonymous invite codes.
- **Admin mode**: passphrase-protected dashboard of anonymous usage statistics and feedback, with import of other devices' exports.
- **Privacy by design**: no server, no accounts, no cookies, opt-in local telemetry, export and delete everything.
- Works in portrait and landscape, light and dark, and is keyboard accessible.

## Run it

Requires Node 20 or newer (only for the tiny dev server and icon generator; the app itself has no dependencies or build step).

```bash
npm start
```

Then open http://localhost:8080/. To regenerate icons:

```bash
npm run icons
```

To run the unit tests and the static checks:

```bash
npm test
```

## Deploy

Copy the `src/` folder to any static host served over HTTPS (GitHub Pages, Netlify, Cloudflare Pages, S3 + CloudFront).
Before release:

1. Set the version with `node scripts/bump-version.mjs 1.0.1` so installed clients update.
2. Fill in `src/js/config.js` (affiliate tag, feedback email, public URL) and `src/data/legal.js` (company, contact, jurisdiction).
3. Add the response headers listed in `docs/architecture.md`.

## Project layout

```
src/            the app (static files, ES modules, no build)
  data/         looks, steps, products, tips, legal text
  js/           app shell, router, store, telemetry, face illustration, estimator
  js/views/     one module per screen
docs/           research, naming, compliance, architecture, prompt history
scripts/        dev server, icon generator, version bump, prompt-history hook
tests/          node:test unit tests for the pure modules
```

## Documentation

- [Research notes](docs/research.md)
- [Name decision](docs/naming.md)
- [Compliance, privacy and security review](docs/compliance.md)
- [Architecture](docs/architecture.md)
- [Prompt history](docs/prompts-history/)
