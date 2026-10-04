# Blendwise design tokens

All visual styling lives in `src/css/app.css`. Use the CSS custom properties
below instead of one-off values; every token has a dark-mode counterpart under
`@media (prefers-color-scheme: dark)`.

## Palette

Surfaces and text (warm ivory / deep wine dark):

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#faf5ef` | `#1a1315` | page background |
| `--surface` | `#ffffff` | `#241a1d` | cards, inputs, chrome |
| `--surface-2` | `#f4e9dd` | `#302227` | hover fills, code, tracks |
| `--text` | `#241a1a` | `#f4ece6` | body text |
| `--muted` | `#7a6a63` | `#bba49c` | secondary text (≥4.5:1 on `--bg`) |
| `--border` | `#e9ddcd` | `#3d2d31` | hairlines, card/input borders |

Brand and status:

| Token | Use |
| --- | --- |
| `--accent` / `--accent-2` | deep wine primary / hover state |
| `--accent-ink` | text on `--accent` fills |
| `--accent-soft` | soft accent fill (badges, icon wells) |
| `--gold` / `--gold-soft` | champagne-gold secondary / soft fill |
| `--ok` / `--warn` / `--danger` | status colors (kit freshness, errors) |
| `--tier-low-bg` / `--tier-low-ink` | beginner / drugstore chips |
| `--tier-mid-ink` | intermediate / mid chips (bg is `--gold-soft`) |
| `--tier-high-bg` / `--tier-high-ink` | prestige chips |

`--bar` is the wine→gold gradient reserved for progress and bar-chart fills.

## Typography

- `--font-serif` for headings, brand, stats, timers (weight 600).
- `--font-sans` (system stack) for everything else; body 16px / 1.6.
- Scale: `h1` 1.85rem (2.1rem ≥900px), `h2` 1.28rem, `h3` 1.1rem,
  lede 1.05rem, `.small` 0.85rem, labels/eyebrow text 0.68–0.76rem.

## Spacing

Consistent rem rhythm: 0.35 / 0.55 / 0.65 / 0.85 / 1.1 / 1.5rem for gaps and
padding; section margin 1.6rem; view gutter `max(1.1rem, safe-area)`.
Chrome heights come from `--top-h` (56px) and `--nav-h` (66px) plus the
`--safe-*` insets. Interactive targets are ≥44px (`min-height` on `.btn`,
`.icon-btn`, inputs).

## Corner radii

| Token | Value | Use |
| --- | --- | --- |
| `--radius` | 18px | cards, overlays, illustration wrap |
| `--radius-sm` | 11px | inputs, stats, menu items, fieldsets |
| `--radius-xs` | 6px | code, bar tracks/fills |
| `999px` | pill | buttons, chips, badges, avatars, toasts |

## Elevation

`--shadow` for resting cards, `--shadow-lift` for overlays and toasts. Dark
mode swaps both automatically.

## Components

Same-kind elements share one class: `.btn` (+ `-primary`/`-ghost`/`-danger`,
`-large`/`-small`), `.icon-btn`, `.card`, `.field` inputs, `.chip`,
`.menu-item`, `.stat`, `.overlay-card`. Hover/active/disabled states are
defined on those classes — extend them rather than adding per-instance styles.

States: form errors render inline next to the offending field with
`.field-error`; submitting a form disables its submit button and reports
success or failure via a toast. Overlays, toasts, tab panels and step cards
enter with a ~180-220ms fade/pop animation (`fade-in` / `pop-in` / `rise-in`
keyframes, disabled under `prefers-reduced-motion`).
