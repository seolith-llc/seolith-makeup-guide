# Makeup research notes (compiled 2026-09-07)

These notes back the content in `src/data/looks.js`, `src/data/products.js` and `src/data/tips.js`.
Everything in the app is educational, not medical or dermatological advice.

## 1. The order of application

Every mainstream source agrees on the same broad sequence; each layer is designed to sit on the one below it
(primer grips foundation, powder sets cream, colour goes on top of a smooth base).

| Phase | Steps | Why |
|---|---|---|
| Skin prep | Cleanse, moisturise, sunscreen (daytime), primer | Hydrated, smooth skin makes every later layer blend and last |
| Base | Colour corrector (optional), foundation, concealer, setting powder | Even tone first, then spot-correct, then lock creams |
| Sculpt | Bronzer, contour, blush, highlighter | Warmth and dimension go on after the base is even |
| Eyes | Brows, eyeshadow, eyeliner, mascara (lashes optional) | Eye fallout is easier to clean up before base, so some artists do eyes first; beginners do base first |
| Lips | Lip liner, lipstick or gloss | Done last so nothing smudges it |
| Finish | Setting spray | Melts powder into skin and extends wear |

Sources: [L'Oreal Paris: order of application](https://www.lorealparisusa.com/beauty-magazine/makeup/makeup-looks/makeup-order-for-application),
[Makeup.com: correct order](https://www.makeup.com/makeup-tutorials/face/how-to-apply-makeup),
[Colorescience: how to apply makeup](https://www.colorescience.com/blogs/learn/how-to-apply-makeup),
[Maybelline: makeup steps for beginners](https://www.maybelline.co.in/makeup-tips/face-makeup/makeup-steps-for-beginners),
[Iba Cosmetics: 2026 step-by-step](https://ibacosmetics.com/blogs/iba-blogs/makeup-tutorial-step-by-step-guide-for-beginners).

Beginner consensus: thin layers, blend more than you think, and a starter kit is only foundation or tinted moisturiser,
concealer, mascara, a lip tint and two or three brushes.

## 2. What changes visually ("before and after")

- **Foundation** evens tone: redness on cheeks and around the nose, dullness and mild discolouration disappear into one uniform shade.
  It "erases detail" so the rest of the face can be re-drawn.
- **Concealer** lifts the under-eye and hides individual blemishes. Under-eye brightening reads as "well rested".
- **Contour** reads as shadow, so the brain sees it as "further back": a rounder face looks more angular, a nose looks slimmer, a
  jawline appears. **Highlight** reads as "closer forward": cheekbones, brow bone, nose bridge and cupid's bow pop.
- **Blush** restores the vitality foundation removed. Without it a full base can look flat or mask-like.
- **Brows** frame the face; filled brows are the single biggest change in most before/after photos.
- **Mascara and liner** make the eye appear larger and more open; a tightline (liner in the upper waterline) thickens the lash line.
- **Lips**: liner prevents feathering and can slightly redefine shape; colour draws attention to the mouth and balances the eyes.
- Two schools of contour: after foundation (sharper, photographs well, "full glam"), or before foundation ("underpainting", softer and more natural).

Sources: [Patrick Ta: contour before or after foundation](https://patrickta.com/blogs/articles/do-you-contour-before-or-after-foundation),
[Marie Claire: how to contour](https://www.marieclaire.com/beauty/makeup/how-to-contour/),
[L'Oreal Paris: contour like a pro](https://www.lorealparisusa.com/beauty-magazine/makeup/face-makeup/how-to-contour-like-a-pro-makeup-artist),
[Glamwithfam: contouring before/after](https://glamwithfam.com/contouring-before-after-pictures/).

The app illustrates this with a layered SVG face (`src/js/face.js`): the "before" state shows uneven tone, under-eye shadow,
sparse brows and pale lips; each completed step switches on a layer, so users see exactly what each product does.

## 3. How long it takes

- A YouGov survey of 1,000 US women: 73% of daily makeup wearers finish in 20 minutes or less; 45% in under 10 minutes.
- Professional artists: 30 to 45 minutes for a fresh-faced look, 45 to 60+ minutes for full glam with lashes and layered eyes.
- Beginners take roughly 1.5 to 2x the time of an experienced person for the same steps.

The estimator uses per-step minute values for three skill levels. Defaults, in minutes
(beginner / intermediate / advanced):

| Step | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Skin prep + primer | 4 | 3 | 2 |
| Foundation | 5 | 3 | 2 |
| Concealer | 4 | 2.5 | 1.5 |
| Powder | 2 | 1.5 | 1 |
| Bronzer / contour | 5 | 3 | 2 |
| Blush | 2 | 1.5 | 1 |
| Highlighter | 2 | 1 | 1 |
| Brows | 5 | 3 | 2 |
| Eyeshadow (simple wash) | 4 | 2.5 | 2 |
| Eyeshadow (blended 3-shade) | 10 | 6 | 4 |
| Eyeliner (pencil) | 3 | 2 | 1 |
| Eyeliner (wing) | 8 | 5 | 3 |
| Mascara | 2 | 1.5 | 1 |
| False lashes | 8 | 5 | 3 |
| Lips | 2 | 1.5 | 1 |
| Setting spray | 1 | 0.5 | 0.5 |

These sum to about 9 minutes (an honest "5-minute face" for a beginner), 25 to 35 minutes (everyday, beginner) and
60 to 70 minutes (full glam, beginner), which matches the survey and artist ranges above. The app then learns from the
user's own timed runs and re-weights the estimate.

Sources: [Beautylish: how long for a full face](https://www.beautylish.com/t/rmrca/how-long-to-do-a-full-face-of-makeup),
[KT Beauty: MUA timing explained](https://www.ktbeauty.au/how-long-does-a-mua-take),
[Typsy Beauty: everyday vs special occasion](https://typsybeauty.com/blogs/makeup/everyday-vs-special-occasion-makeup).

## 4. Safety and hygiene (drives the "My Kit" PAO tracker and the Terms)

- No US law requires expiry dates on cosmetics; manufacturers are responsible for safety. The EU-style "period after opening"
  (open-jar symbol, e.g. 6M, 12M) is increasingly used in the US.
- Mascara: discard 2 to 4 months after opening (most carry 3M). Never add water or saliva. Eye products are the highest infection risk.
- Typical PAO used by the app: mascara 3 months, liquid eyeliner 3 to 6, cream products 6 to 12, liquid foundation 6 to 12,
  powders 12 to 24, lipstick 12 to 18, pencils 24. Sunscreen follows its printed expiry.
- Patch test new products (inner forearm or behind the ear, 24 to 48 hours) especially with sensitive skin or known allergies.
- Do not share eye or lip products; sharpen pencils; wash brushes weekly and sponges after every use.

Sources: [FDA: shelf life and expiration dating](https://www.fda.gov/cosmetics/cosmetics-labeling/shelf-life-and-expiration-dating-cosmetics),
[FDA: eye cosmetic safety](https://www.fda.gov/cosmetics/cosmetic-products/eye-cosmetic-safety),
[Cosmetics Info: shelf life](https://www.cosmeticsinfo.org/shelf-life/),
[Tangie: PAO USA vs EU](https://tangieco.com/blog/period-after-opening-in-cosmetics/).

## 5. Products and ratings

The catalogue in `src/data/products.js` lists widely reviewed products across drugstore and prestige tiers. Ratings are
editorial summaries of public retailer and review-site ratings as of mid-2026, rounded to the nearest 0.1, and are labelled in the
app as "editorial rating, verify at retailer". They are data, not endorsements, and the admin can edit the file.

Notable 2026 picks from the sources: Maybelline Fit Me Matte + Poreless (most recommended starter foundation),
Milani Conceal + Perfect 2-in-1, e.l.f. Soft Glam Satin Concealer, Armani Luminous Silk (prestige base benchmark). The
drugstore/prestige gap has closed most in mascara; prestige still leads in full-coverage foundation shade range and pigmented palettes.

Sources: [Who What Wear: best drugstore foundations 2026](https://www.whowhatwear.com/beauty/makeup/best-drugstore-foundation-products),
[Shop TODAY Beauty Awards 2026](https://www.today.com/shop/best-makeup-products-beauty-awards-2026-rcna587462),
[The Zoe Report: best makeup 2026](https://www.thezoereport.com/beauty/best-makeup-products-2026),
[Makeup Tutorials: best drugstore makeup 2026](https://makeuptutorials.com/best-drugstore-makeup-2026/).

## 6. Affiliate links: rules that shape the product page

- Amazon Associates requires the exact sentence "As an Amazon Associate I earn from qualifying purchases." to be clearly visible
  wherever links appear, and disclosure near the links themselves. Links must not be cloaked, must not be used in offline
  material such as emails or printed guides, and prices or ratings pulled from Amazon must not be shown stale. The app therefore
  shows its own editorial rating and never an Amazon price.
- FTC Endorsement Guides: disclosure must be clear and conspicuous, adjacent to the link ("paid link", "#ad"), not hidden in a
  separate page. Penalties can exceed $50,000 per violation.
- Because the app is offline-first, links open the retailer in the system browser only when the user taps; the app itself
  never fetches retailer data.

Sources: [Amazon Associates help](https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98),
[Termly: Amazon affiliate disclosure](https://termly.io/resources/articles/amazon-affiliate-disclosure/),
[LegalForge: FTC affiliate disclosure 2026](https://www.legalforge.app/blog/ftc-affiliate-disclosure-compliance),
[AzonPress: Amazon affiliate requirements 2026](https://azonpress.com/key-amazon-affiliate-requirements/).
