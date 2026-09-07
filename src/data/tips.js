// Best-practice tips. `skinTypes` and `skills` narrow when a tip is shown; empty = everyone.

export const TIP_GROUPS = [
  { id: 'app', name: 'Getting the most out of Blendwise' },
  { id: 'order', name: 'Order and layering' },
  { id: 'blending', name: 'Blending and colour' },
  { id: 'longevity', name: 'Making it last' },
  { id: 'hygiene', name: 'Hygiene and safety' },
  { id: 'skin', name: 'For your skin type' },
];

export const TIPS = [
  { id: 'app-timer', group: 'app', title: 'Time your first three runs', body: 'Use the guided routine with the timer on. After three timed runs the estimator switches from averages to your own pace, and Insights will show which steps slow you down.' },
  { id: 'app-landscape', group: 'app', title: 'Prop the phone in landscape', body: 'In landscape the illustration sits beside the instructions, so you can glance at both while your hands are busy. Portrait keeps the steps above the fold for a phone on the counter.' },
  { id: 'app-install', group: 'app', title: 'Install it to the home screen', body: 'The app works fully offline once installed. Use Settings > Install app, or your browser\'s "Add to Home Screen".' },
  { id: 'app-kit', group: 'app', title: 'Log opening dates in My Kit', body: 'Mascara expires 3 months after opening. Add products to My Kit with the date you opened them and the app will tell you when to replace them.' },
  { id: 'app-estimate', group: 'app', title: 'Use "I have N minutes"', body: 'Running late? The estimator suggests the fullest look that fits the time you have, at your skill level.' },
  { id: 'app-favorite', group: 'app', title: 'Favourite two looks', body: 'A daytime look and an evening look are enough for most weeks. Favourites appear first on Home.' },
  { id: 'order-thin', group: 'order', title: 'Thin layers beat one thick layer', body: 'Every product blends better and lasts longer as two thin coats. This is the single most common beginner fix.' },
  { id: 'order-eyes-first', group: 'order', title: 'Heavy eyes first', body: 'For blended shadow or glitter, do the eyes before foundation so you can wipe away fallout without ruining the base.' },
  { id: 'order-cream-powder', group: 'order', title: 'Cream before powder, never after', body: 'Cream blush, contour and highlighter go on before setting powder. Powder products go on after. Cream over powder pills and streaks.' },
  { id: 'order-wait', group: 'order', title: 'Give skincare a minute', body: 'Moisturiser and SPF need 60 to 120 seconds to set. Foundation applied over wet skincare slides and separates.' },
  { id: 'blend-undertone', group: 'blending', title: 'Undertone first, depth second', body: 'Look at the veins on your inner wrist in daylight: greenish suggests warm, bluish suggests cool, hard to tell suggests neutral. Pick foundation and concealer in that family, then match depth to your jaw.' },
  { id: 'blend-daylight', group: 'blending', title: 'Check in daylight', body: 'Bathroom bulbs are yellow. Take the mirror to a window before you leave, especially for foundation edges and blush intensity.' },
  { id: 'blend-motion', group: 'blending', title: 'Bounce, sweep, wiper', body: 'Sponges bounce (never drag). Brushes on the face sweep in one direction. Crease brushes move like a windscreen wiper. Matching the motion to the tool is most of blending.' },
  { id: 'blend-less', group: 'blending', title: 'Stop one layer early', body: 'Blush, bronzer and contour look about 30% stronger in daylight than in the mirror. Stop when it looks like "almost enough".' },
  { id: 'long-primer', group: 'longevity', title: 'Primer where you fade', body: 'You do not need primer everywhere. Put it on the nose, chin and forehead, or wherever your makeup disappears first.' },
  { id: 'long-set', group: 'longevity', title: 'Set with powder, seal with spray', body: 'Powder locks creams; setting spray melts the powder and locks everything. Both together give the longest wear.' },
  { id: 'long-blot', group: 'longevity', title: 'Blot, do not re-powder', body: 'Midday shine: press with blotting paper first. Adding powder over oil turns cakey.' },
  { id: 'long-lips', group: 'longevity', title: 'Liner all over, then lipstick, blot, repeat', body: 'Fill the whole lip with liner, apply lipstick, blot with tissue, apply again. Lasts through lunch.' },
  { id: 'hyg-mascara', group: 'hygiene', title: 'Replace mascara every 3 months', body: 'Eye products carry the highest infection risk. Bin mascara at 3 months, liquid liner at 3 to 6, and never share them.' },
  { id: 'hyg-patch', group: 'hygiene', title: 'Patch-test anything new', body: 'Apply a small amount behind the ear or on the inner forearm and wait 24 to 48 hours. Essential for sensitive skin and known allergies.' },
  { id: 'hyg-brushes', group: 'hygiene', title: 'Wash brushes weekly, sponges after each use', body: 'Gentle shampoo, lukewarm water, reshape and dry flat. Dirty tools cause breakouts and muddy colour.' },
  { id: 'hyg-pao', group: 'hygiene', title: 'Read the open-jar symbol', body: 'The "6M" or "12M" on the packaging is the number of months a product is safe after opening. Track opening dates in My Kit.' },
  { id: 'hyg-water', group: 'hygiene', title: 'Never add water or saliva to a product', body: 'It introduces bacteria. If mascara or liner has dried out, it is finished.' },
  { id: 'skin-oily', group: 'skin', skinTypes: ['oily'], title: 'Oily skin: gel moisturiser, mattifying primer, press powder', body: 'Hydrate with a gel so the skin does not overproduce oil, prime the T-zone, press powder with a puff, and finish with a mattifying spray.' },
  { id: 'skin-dry', group: 'skin', skinTypes: ['dry'], title: 'Dry skin: creams over powders', body: 'Use a hydrating primer, a dewy foundation on a damp sponge, cream blush and highlighter, minimal powder, and a hydrating setting spray.' },
  { id: 'skin-combo', group: 'skin', skinTypes: ['combination'], title: 'Combination skin: treat zones differently', body: 'Mattify the T-zone and keep the cheeks dewy. Powder the centre only; use cream blush on the cheeks.' },
  { id: 'skin-sensitive', group: 'skin', skinTypes: ['sensitive'], title: 'Sensitive skin: fragrance-free and fewer products', body: 'Choose fragrance-free formulas, patch-test everything, and prefer mineral SPF. Skip setting sprays with high alcohol content.' },
  { id: 'skin-normal', group: 'skin', skinTypes: ['normal'], title: 'Normal skin: experiment with finishes', body: 'You can wear both matte and dewy bases. Try a satin foundation as a middle ground for daytime.' },
];

export function tipsFor({ skinType, skill } = {}) {
  return TIPS.filter((t) => (!t.skinTypes || t.skinTypes.includes(skinType)) && (!t.skills || t.skills.includes(skill)));
}
