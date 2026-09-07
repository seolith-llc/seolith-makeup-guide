# Compliance, privacy and security review

This is an engineering review, not legal advice. Have a lawyer review the Terms and Privacy Policy for the countries you launch in.

## Data and privacy

| Topic | Decision |
|---|---|
| Server | None. The app is static files plus a service worker. Nothing the user enters leaves the device unless the user taps Share, Email or Export. |
| Personal data | Not collected. Skin type, skill level, kit items, timings and feedback live in the browser's IndexedDB and localStorage on that device only. |
| Telemetry | Opt-in at first launch (default off). Events contain only event names, coarse buckets (minute ranges, orientation, page ids) and a random install id that the user can regenerate or delete. No free text, no IP, no device fingerprinting, timestamps rounded to the hour. |
| Admin dashboard | Reads the same local store, so on a single device it shows that device's data. Admins aggregate across devices by importing exported JSON files that users choose to share. |
| GDPR / UK GDPR / CCPA | Local-only processing with explicit consent for optional analytics; "Delete all my data" (erasure) and "Export my data" (portability) are in Settings. No sale or sharing of data. |
| Children | Terms set a minimum age of 13 (16 in the EEA where required). No account, no chat, no user content shown to others. |
| Cookies | None. A consent screen is still shown because analytics storage is optional and the user should choose. |
| Health claims | Cosmetic instructions only. Content avoids medical claims and tells users to patch-test and consult a professional for skin conditions. |

## Affiliate and advertising

- Amazon Associates: the required sentence appears on the Products page and in the Terms. Each link is labelled "Paid link". The app shows no Amazon price or Amazon star rating, only its own editorial rating. No links in exported or shared content (Amazon prohibits links in offline material).
- FTC Endorsement Guides: disclosure adjacent to every link and at the top of the product list.
- `rel="sponsored noopener noreferrer"` on all affiliate links; `target="_blank"` so the PWA stays open.
- The affiliate tag is a single placeholder in `src/js/config.js` (`affiliate.amazonTag`). Leave it empty and links become plain search links with no tag.

## Security

- Content Security Policy in `index.html`: scripts and styles only from the app's origin, no inline scripts, no eval, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`. Connections allowed only to same origin and HTTPS (for the optional feedback endpoint).
- All user text (feedback, kit names) is inserted with `textContent`, or passes through the escaping helper in `src/js/dom.js` before reaching `innerHTML`.
- Admin mode is protected by a passphrase hashed with PBKDF2-SHA256 (100k iterations, random salt) via Web Crypto. Because the app is fully client-side this only prevents casual access on a shared device; it is not a security boundary against someone with the device and dev tools. Documented in the Admin page.
- Service worker caches only same-origin files from a fixed list; cross-origin requests are never cached.
- Shared invite links carry a random 6-character code, never an identifier tied to a person.
- No third-party scripts, fonts or CDNs, so nothing can be injected from outside and the app works fully offline.
- Recommended hosting headers (cannot be set from static files): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera and geolocation. See `docs/architecture.md`.

## Accessibility

- Every control is a real `button`, `a` or form element; the app is keyboard-navigable.
- Colour is never the only signal (step state uses icons and text).
- Respects `prefers-reduced-motion` and `prefers-color-scheme`.
- Works in portrait and landscape; text scales with the user's font-size setting.

## Open items before public launch

1. Fill in the company name, address, contact email and governing law in `src/data/legal.js`.
2. Register for Amazon Associates and set the tag; confirm the Operating Agreement version at that time.
3. Trademark clearance for "Blendwise" (see `docs/naming.md`).
4. If you later add a feedback server, publish a data-retention period and update the Privacy Policy.
