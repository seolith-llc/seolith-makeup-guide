# Architecture

## Principles

1. **Offline first, no server.** Static files plus a service worker. Every feature works with the network off.
2. **No build step, no dependencies.** Plain ES modules and CSS so the whole app can be read, audited and hosted anywhere.
3. **Strict CSP.** No inline scripts, no inline styles, no third-party origins. Dynamic widths (bars, progress) are set through the CSSOM, which the policy allows.
4. **Data stays local.** localStorage for preferences, IndexedDB for collections.

## Modules

| File | Role |
|---|---|
| `src/js/app.js` | Boot, routes, navigation, consent gate, onboarding, online state |
| `src/js/router.js` | Hash router (`#/look/:id`) with params and query |
| `src/js/dom.js` | `h` tagged template with escaping, toast, download, clipboard |
| `src/js/store.js` | Preferences and IndexedDB stores: `events`, `feedback`, `runs`, `kit`, `imported` |
| `src/js/telemetry.js` | Opt-in anonymous events, whitelisted properties, aggregation |
| `src/js/estimator.js` | Step times per skill, personal pace model, "what fits in N minutes" |
| `src/js/face.js` | Layered SVG face; `setLayers()` toggles classes per step |
| `src/js/crypto.js` | PBKDF2 passphrase hashing for admin |
| `src/js/pwa.js` | Service worker registration, install prompt, update flow |
| `src/js/views/*` | One module per screen; each exports `view(ctx)` returning `{ title, html, mount }` |
| `src/data/*` | Content: steps, looks, products, tips, legal |
| `src/sw.js` | Precache list, cache-first for same-origin, navigation fallback |

## Data model

```
prefs (localStorage "blendwise:prefs")
  consent { terms, telemetry, at, version }, skill, skinType, skinTone, installId, inviteCode,
  favorites[], admin { salt, hash, iterations } | null, lastLook, onboarded

runs      { id, lookId, startedAt, finishedAt, completed, skill, totalSeconds, steps[{ id, seconds, estimatedMinutes }] }
kit       { id, productId|null, name, category, openedAt (YYYY-MM-DD), paoMonths }
feedback  { id, type, message, contact, version, page, createdAt, sentAt? }
events    { id, n (name), p (props), s (session), i (install), h (hour bucket), d (day), o (orientation), v }
imported  { id, importedAt, name, count, events[] }
```

## Telemetry event names

`app_open`, `page_view`, `onboarded`, `look_start`, `step_done`, `step_skip`, `look_complete`, `look_abandon`, `estimate`,
`product_click`, `kit_add`, `share`, `feedback_submit`, `export`, `referred_open`, `pwa_installed`, `orientation_change`.
Properties are limited to the whitelist in `telemetry.js`; strings are cut to 40 characters.

## Layout

- Portrait: fixed top bar, bottom tab bar (5 tabs), single column.
- Landscape (width >= 640px): left rail navigation, two columns, illustration sticky beside instructions.
- Short landscape phones (height <= 480px): smaller chrome and timer.
- Safe-area insets are respected for notched devices.

## Release checklist

1. `node scripts/bump-version.mjs x.y.z` (updates package.json, config.js and the service worker cache name).
2. `npm test`.
3. Deploy the Docker image (`Dockerfile` + `docker/nginx.conf`, which already sets the headers below) behind an HTTPS proxy, or deploy `src/` to a static host with these headers:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - `X-Frame-Options: DENY`
   - `Cache-Control: no-cache` for `index.html` and `sw.js`; long max-age for everything else.
4. If new files are added under `src/`, add them to `PRECACHE` in `sw.js` (`npm run check` verifies the list).
