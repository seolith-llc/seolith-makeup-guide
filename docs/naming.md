# Name decision: Blendwise

Chosen name: **Blendwise**. Tagline: "Blend wisely. Step-by-step makeup, offline."

## Why

- Describes the core skill the app teaches (blending) and the app's tone (calm, practical, no hype).
- Two syllables, easy to say, spell and search. Works as a slug (`blendwise`) and as a PWA short name (9 characters fits under most home-screen icons).
- Gender-neutral and age-neutral.

## Rejected

| Candidate | Reason rejected |
|---|---|
| GlowGuide | Already used by at least three published apps on the App Store and Google Play (beauty routine, aesthetic-treatment tracker, skincare companion). High confusion and trademark risk. |
| Primerly | No collision found, but "primer" is a single product, which narrows the perceived scope. |
| Facette | Common French word and existing cosmetics brands use it. |
| MirrorMirror | Overused; multiple apps and a film. |

## Checks done (2026-09-07)

Web search for "Blendwise" returned no app, cosmetics brand or beauty service with that name. Results were unrelated
("BeautyBlend", "AR Makeup Blend", the Beautyblender sponge).

## Before launch

1. Run a trademark search (USPTO, EUIPO and the target countries) for classes 9 (software), 3 (cosmetics) and 44 (beauty services).
2. Check app store names and the `.com` / `.app` domains.
3. The name lives in `src/js/config.js`, `src/manifest.webmanifest` and `src/index.html`, so renaming is cheap.
