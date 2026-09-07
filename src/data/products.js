// Product catalogue. Ratings are editorial summaries of public retailer and review-site
// ratings as of mid-2026 (rounded to 0.1). They are not live data and are labelled as such
// in the app. `search` is the retailer search query used to build the affiliate link.
// `pao` is the typical period-after-opening in months, used by the My Kit tracker.

export const CATEGORIES = [
  { id: 'cleanser', name: 'Cleanser', pao: 12 },
  { id: 'moisturizer', name: 'Moisturiser', pao: 12 },
  { id: 'spf', name: 'Sunscreen', pao: 12 },
  { id: 'primer', name: 'Primer', pao: 12 },
  { id: 'foundation', name: 'Foundation & skin tint', pao: 12 },
  { id: 'concealer', name: 'Concealer', pao: 12 },
  { id: 'powder', name: 'Setting powder', pao: 24 },
  { id: 'bronzer', name: 'Bronzer', pao: 24 },
  { id: 'contour', name: 'Contour', pao: 12 },
  { id: 'blush', name: 'Blush', pao: 18 },
  { id: 'highlighter', name: 'Highlighter', pao: 18 },
  { id: 'brow', name: 'Brow', pao: 12 },
  { id: 'eyeshadow', name: 'Eyeshadow', pao: 24 },
  { id: 'eyeliner', name: 'Eyeliner', pao: 6 },
  { id: 'mascara', name: 'Mascara', pao: 3 },
  { id: 'lashes', name: 'False lashes', pao: 1 },
  { id: 'lipliner', name: 'Lip liner', pao: 24 },
  { id: 'lipstick', name: 'Lipstick, tint & balm', pao: 18 },
  { id: 'setting-spray', name: 'Setting spray', pao: 12 },
  { id: 'tools', name: 'Brushes & sponges', pao: 12 },
];

export const TIERS = { drugstore: 'Drugstore', mid: 'Mid-range', prestige: 'Prestige' };

export const PRODUCTS = [
  { id: 'cerave-cleanser', brand: 'CeraVe', name: 'Hydrating Facial Cleanser', category: 'cleanser', tier: 'drugstore', rating: 4.6, why: 'Non-stripping, fragrance-free, works for almost every skin type.', bestFor: ['normal', 'dry', 'sensitive', 'combination'], search: 'CeraVe Hydrating Facial Cleanser' },
  { id: 'cerave-am', brand: 'CeraVe', name: 'AM Facial Moisturizing Lotion SPF 30', category: 'spf', tier: 'drugstore', rating: 4.5, why: 'Moisturiser and sunscreen in one step; sits well under makeup.', bestFor: ['normal', 'combination', 'sensitive'], search: 'CeraVe AM Facial Moisturizing Lotion SPF 30' },
  { id: 'neutrogena-hydro', brand: 'Neutrogena', name: 'Hydro Boost Water Gel', category: 'moisturizer', tier: 'drugstore', rating: 4.5, why: 'Light gel hydration that will not make oily skin shine.', bestFor: ['oily', 'combination', 'normal'], search: 'Neutrogena Hydro Boost Water Gel' },
  { id: 'elf-power-grip', brand: 'e.l.f.', name: 'Power Grip Primer', category: 'primer', tier: 'drugstore', rating: 4.5, why: 'Tacky gel grip that noticeably extends foundation wear at a low price.', bestFor: ['normal', 'combination', 'oily'], search: 'elf Power Grip Primer' },
  { id: 'milk-hydro-grip', brand: 'Milk Makeup', name: 'Hydro Grip Primer', category: 'primer', tier: 'prestige', rating: 4.4, why: 'Hydrating grip primer, good for dry or mature skin that still wants long wear.', bestFor: ['dry', 'normal', 'combination'], search: 'Milk Makeup Hydro Grip Primer' },
  { id: 'maybelline-fitme', brand: 'Maybelline', name: 'Fit Me Matte + Poreless Foundation', category: 'foundation', tier: 'drugstore', rating: 4.4, why: 'The most recommended starter foundation: 40 shades, natural matte, easy to blend.', bestFor: ['oily', 'combination', 'normal'], search: 'Maybelline Fit Me Matte Poreless Foundation' },
  { id: 'loreal-infallible', brand: "L'Oreal Paris", name: 'Infallible 24H Fresh Wear Foundation', category: 'foundation', tier: 'drugstore', rating: 4.4, why: 'Long-wear, medium-to-full coverage that stays put through heat.', bestFor: ['oily', 'combination', 'normal'], search: "L'Oreal Infallible 24H Fresh Wear Foundation" },
  { id: 'ilia-skin-tint', brand: 'ILIA', name: 'Super Serum Skin Tint SPF 40', category: 'foundation', tier: 'prestige', rating: 4.3, why: 'Sheer tint plus SPF in one; the ideal 5-minute-face base.', bestFor: ['dry', 'normal', 'sensitive'], search: 'ILIA Super Serum Skin Tint SPF 40' },
  { id: 'armani-luminous-silk', brand: 'Giorgio Armani', name: 'Luminous Silk Foundation', category: 'foundation', tier: 'prestige', rating: 4.5, why: 'The prestige benchmark: radiant, buildable and flattering on mature skin.', bestFor: ['dry', 'normal', 'combination'], search: 'Giorgio Armani Luminous Silk Foundation' },
  { id: 'estee-double-wear', brand: 'Estee Lauder', name: 'Double Wear Stay-in-Place Foundation', category: 'foundation', tier: 'prestige', rating: 4.6, why: 'Full coverage and 24-hour wear; the wedding and event standard.', bestFor: ['oily', 'combination', 'normal'], search: 'Estee Lauder Double Wear Foundation' },
  { id: 'maybelline-age-rewind', brand: 'Maybelline', name: 'Instant Age Rewind Eraser Concealer', category: 'concealer', tier: 'drugstore', rating: 4.5, why: 'Sponge-tip applicator makes under-eye brightening nearly foolproof.', bestFor: ['normal', 'combination', 'dry'], search: 'Maybelline Instant Age Rewind Concealer' },
  { id: 'elf-soft-glam', brand: 'e.l.f.', name: 'Soft Glam Satin Concealer', category: 'concealer', tier: 'drugstore', rating: 4.3, why: 'Buildable, creaseless satin coverage that performs like prestige.', bestFor: ['normal', 'dry', 'combination'], search: 'elf Soft Glam Satin Concealer' },
  { id: 'nars-radiant-creamy', brand: 'NARS', name: 'Radiant Creamy Concealer', category: 'concealer', tier: 'prestige', rating: 4.5, why: 'Medium coverage that looks like skin; very wide shade range.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'NARS Radiant Creamy Concealer' },
  { id: 'laura-mercier-powder', brand: 'Laura Mercier', name: 'Translucent Loose Setting Powder', category: 'powder', tier: 'prestige', rating: 4.6, why: 'Finely milled, no flashback, sets without looking powdery.', bestFor: ['oily', 'combination', 'normal'], search: 'Laura Mercier Translucent Loose Setting Powder' },
  { id: 'coty-airspun', brand: 'Coty', name: 'Airspun Loose Face Powder', category: 'powder', tier: 'drugstore', rating: 4.5, why: 'A decades-old budget favourite for baking and setting.', bestFor: ['oily', 'combination'], search: 'Coty Airspun Loose Face Powder Translucent' },
  { id: 'pf-butter-bronzer', brand: 'Physicians Formula', name: 'Murumuru Butter Bronzer', category: 'bronzer', tier: 'drugstore', rating: 4.6, why: 'Soft, blendable warmth that never looks muddy.', bestFor: ['normal', 'dry', 'combination'], search: 'Physicians Formula Butter Bronzer' },
  { id: 'benefit-hoola', brand: 'Benefit', name: 'Hoola Matte Bronzer', category: 'bronzer', tier: 'prestige', rating: 4.5, why: 'Neutral matte bronzer that also works as a soft contour on fair to medium skin.', bestFor: ['normal', 'oily', 'combination'], search: 'Benefit Hoola Matte Bronzer' },
  { id: 'nyx-wonder-stick', brand: 'NYX', name: 'Wonder Stick Contour & Highlight', category: 'contour', tier: 'drugstore', rating: 4.3, why: 'Two-ended cream stick; easy placement for beginners.', bestFor: ['normal', 'dry', 'combination'], search: 'NYX Wonder Stick Contour Highlight' },
  { id: 'fenty-match-stix', brand: 'Fenty Beauty', name: 'Match Stix Contour Skinstick', category: 'contour', tier: 'prestige', rating: 4.4, why: 'Cool-toned cream contour in shades that suit deep skin as well as fair.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'Fenty Beauty Match Stix Contour Skinstick' },
  { id: 'rare-soft-pinch', brand: 'Rare Beauty', name: 'Soft Pinch Liquid Blush', category: 'blush', tier: 'prestige', rating: 4.5, why: 'One tiny dot per cheek; extremely pigmented, blends into a natural flush.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'Rare Beauty Soft Pinch Liquid Blush' },
  { id: 'milani-baked-blush', brand: 'Milani', name: 'Baked Blush', category: 'blush', tier: 'drugstore', rating: 4.5, why: 'Luminous powder blush with a cult following; Luminoso is the classic shade.', bestFor: ['normal', 'combination', 'oily'], search: 'Milani Baked Blush Luminoso' },
  { id: 'elf-halo-glow', brand: 'e.l.f.', name: 'Halo Glow Liquid Filter', category: 'highlighter', tier: 'drugstore', rating: 4.4, why: 'Liquid glow that can be mixed into foundation or tapped on cheekbones.', bestFor: ['dry', 'normal', 'combination'], search: 'elf Halo Glow Liquid Filter' },
  { id: 'fenty-killawatt', brand: 'Fenty Beauty', name: 'Killawatt Freestyle Highlighter', category: 'highlighter', tier: 'prestige', rating: 4.5, why: 'Smooth, non-glittery powder highlight with shades for every depth.', bestFor: ['normal', 'combination', 'oily'], search: 'Fenty Beauty Killawatt Highlighter' },
  { id: 'abh-brow-wiz', brand: 'Anastasia Beverly Hills', name: 'Brow Wiz', category: 'brow', tier: 'prestige', rating: 4.5, why: 'Ultra-fine tip for hair-like strokes; the pro standard.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Anastasia Beverly Hills Brow Wiz' },
  { id: 'nyx-micro-brow', brand: 'NYX', name: 'Micro Brow Pencil', category: 'brow', tier: 'drugstore', rating: 4.4, why: 'Near-identical format to Brow Wiz at a third of the price.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'NYX Micro Brow Pencil' },
  { id: 'glossier-boy-brow', brand: 'Glossier', name: 'Boy Brow', category: 'brow', tier: 'mid', rating: 4.4, why: 'Tinted gel for fluffy, brushed-up brows in ten seconds.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Glossier Boy Brow' },
  { id: 'ud-naked-reloaded', brand: 'Urban Decay', name: 'Naked Reloaded Eyeshadow Palette', category: 'eyeshadow', tier: 'prestige', rating: 4.4, why: 'Twelve wearable neutrals, mattes and shimmers, that cover every look in this app.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Urban Decay Naked Reloaded Palette' },
  { id: 'elf-bite-size', brand: 'e.l.f.', name: 'Bite Size Eyeshadow Palette', category: 'eyeshadow', tier: 'drugstore', rating: 4.3, why: 'Four-shade quads that make the three-shade blend easy and cheap to try.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'elf Bite Size Eyeshadow Palette' },
  { id: 'ud-247-liner', brand: 'Urban Decay', name: '24/7 Glide-On Eye Pencil', category: 'eyeliner', tier: 'prestige', rating: 4.6, why: 'Creamy enough to tightline, sets and does not budge.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'Urban Decay 24/7 Glide-On Eye Pencil' },
  { id: 'nyx-epic-ink', brand: 'NYX', name: 'Epic Ink Liner', category: 'eyeliner', tier: 'drugstore', rating: 4.4, why: 'Flexible brush tip that makes wings forgiving for beginners.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'NYX Epic Ink Liner' },
  { id: 'stila-stay-all-day', brand: 'Stila', name: 'Stay All Day Waterproof Liquid Eyeliner', category: 'eyeliner', tier: 'prestige', rating: 4.5, why: 'Precise felt tip; the winged-liner benchmark.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'Stila Stay All Day Waterproof Liquid Eyeliner' },
  { id: 'maybelline-sky-high', brand: 'Maybelline', name: 'Lash Sensational Sky High Mascara', category: 'mascara', tier: 'drugstore', rating: 4.5, why: 'Length and lift with a flexible wand; the drugstore mascara that closed the gap with prestige.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Maybelline Lash Sensational Sky High Mascara' },
  { id: 'loreal-telescopic', brand: "L'Oreal Paris", name: 'Telescopic Lift Mascara', category: 'mascara', tier: 'drugstore', rating: 4.5, why: 'Clean separation and lift without clumps.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: "L'Oreal Telescopic Lift Mascara" },
  { id: 'benefit-theyre-real', brand: 'Benefit', name: "They're Real! Lengthening Mascara", category: 'mascara', tier: 'prestige', rating: 4.4, why: 'Dramatic length; a favourite for evening looks.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: "Benefit They're Real Mascara" },
  { id: 'ardell-wispies', brand: 'Ardell', name: 'Wispies False Lashes', category: 'lashes', tier: 'drugstore', rating: 4.5, why: 'The most-used strip lash; light, fluttery and easy to apply.', bestFor: ['normal', 'dry', 'combination', 'oily'], search: 'Ardell Wispies Lashes' },
  { id: 'nyx-slim-lip', brand: 'NYX', name: 'Slim Lip Pencil', category: 'lipliner', tier: 'drugstore', rating: 4.5, why: 'Dozens of shades for a couple of dollars each.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'NYX Slim Lip Pencil' },
  { id: 'ct-lip-cheat', brand: 'Charlotte Tilbury', name: 'Lip Cheat Lip Liner', category: 'lipliner', tier: 'prestige', rating: 4.6, why: 'Waxy, precise and long-wearing; Pillow Talk is the universal nude.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Charlotte Tilbury Lip Cheat Pillow Talk' },
  { id: 'maybelline-superstay', brand: 'Maybelline', name: 'SuperStay Matte Ink', category: 'lipstick', tier: 'drugstore', rating: 4.4, why: 'Transfer-proof liquid matte that survives meals.', bestFor: ['normal', 'combination', 'oily'], search: 'Maybelline SuperStay Matte Ink' },
  { id: 'mac-matte', brand: 'MAC', name: 'Matte Lipstick', category: 'lipstick', tier: 'prestige', rating: 4.5, why: 'The classic bullet; Ruby Woo and Velvet Teddy are the reference red and nude.', bestFor: ['normal', 'combination', 'oily'], search: 'MAC Matte Lipstick' },
  { id: 'clinique-black-honey', brand: 'Clinique', name: 'Almost Lipstick in Black Honey', category: 'lipstick', tier: 'prestige', rating: 4.5, why: 'Sheer berry tint that flatters nearly every skin tone; perfect for the 5-minute face.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Clinique Almost Lipstick Black Honey' },
  { id: 'ud-all-nighter', brand: 'Urban Decay', name: 'All Nighter Setting Spray', category: 'setting-spray', tier: 'prestige', rating: 4.5, why: 'The long-wear setting spray most artists carry.', bestFor: ['oily', 'combination', 'normal'], search: 'Urban Decay All Nighter Setting Spray' },
  { id: 'nyx-matte-spray', brand: 'NYX', name: 'Matte Finish Setting Spray', category: 'setting-spray', tier: 'drugstore', rating: 4.4, why: 'Budget mattifying spray that controls shine.', bestFor: ['oily', 'combination'], search: 'NYX Matte Finish Setting Spray' },
  { id: 'real-techniques-set', brand: 'Real Techniques', name: 'Everyday Essentials Brush Set', category: 'tools', tier: 'drugstore', rating: 4.6, why: 'Everything a beginner needs: base, powder, blush, crease and a sponge.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Real Techniques Everyday Essentials Brush Set' },
  { id: 'beautyblender', brand: 'Beautyblender', name: 'Original Makeup Sponge', category: 'tools', tier: 'mid', rating: 4.6, why: 'The damp-sponge standard for seamless foundation.', bestFor: ['normal', 'dry', 'combination', 'oily', 'sensitive'], search: 'Beautyblender Original Makeup Sponge' },
];

export function productsForCategory(category) {
  return PRODUCTS.filter((p) => p.category === category).sort((a, b) => b.rating - a.rating);
}

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function categoryName(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.name : id;
}

export function categoryPao(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.pao : 12;
}
