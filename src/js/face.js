// Stylised, layered face illustration. Each makeup step switches on a layer, so the
// same drawing shows "before", every stage in between, and "after".
// Visibility is driven by classes on the <svg> root (see css/app.css, ".face" rules).

export const TONES = {
  light: { name: 'Light', skin: '#f2d3bd', shadow: '#d9ac93', light: '#fbe8da', hair: '#6b4a3a', lipBefore: '#d9a496', blush: '#e8788a', lip: '#b7454f', shadowLid: '#b48a78' },
  medium: { name: 'Medium', skin: '#d9a982', shadow: '#b98a64', light: '#ecc8a8', hair: '#3b2a22', lipBefore: '#c48e7a', blush: '#e0687d', lip: '#a83a48', shadowLid: '#9c6f5c' },
  tan: { name: 'Tan', skin: '#b97f55', shadow: '#97623e', light: '#d1a07a', hair: '#2b1d17', lipBefore: '#a8705a', blush: '#d65c72', lip: '#9a3140', shadowLid: '#7d5340' },
  deep: { name: 'Deep', skin: '#6f4430', shadow: '#4f2f20', light: '#8f5d45', hair: '#1a110d', lipBefore: '#7a4a3c', blush: '#c94a6a', lip: '#7e2637', shadowLid: '#5a3526' },
};

export const LAYER_ORDER = [
  'prep', 'primer', 'corrector', 'foundation', 'concealer', 'powder', 'bronzer', 'contour', 'blush', 'highlight',
  'brows', 'eyeshadow', 'eyeliner', 'mascara', 'lashes', 'lipliner', 'lips', 'setting',
];

export const LAYER_LABELS = {
  prep: 'Skin prep', primer: 'Primer', corrector: 'Corrector', foundation: 'Foundation', concealer: 'Concealer', powder: 'Powder',
  bronzer: 'Bronzer', contour: 'Contour', blush: 'Blush', highlight: 'Highlight', brows: 'Brows', eyeshadow: 'Eyeshadow',
  eyeliner: 'Eyeliner', mascara: 'Mascara', lashes: 'False lashes', lipliner: 'Lip liner', lips: 'Lip colour', setting: 'Setting spray',
};

function lashes(cx, y, length, dir) {
  // dir: -1 for left eye (lashes lean outward to the left), +1 for right eye
  const out = [];
  for (let i = -3; i <= 3; i++) {
    const x = cx + i * 5;
    const lean = i * 0.6 * dir + dir * 1.5;
    out.push(`<line x1="${x}" y1="${y}" x2="${x + lean}" y2="${y - length - Math.abs(i) * 0.4}" />`);
  }
  return out.join('');
}

export function faceSvg(toneId = 'medium') {
  const t = TONES[toneId] || TONES.medium;
  return `
<svg class="face tone-${toneId}" viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrated face showing the effect of each makeup step">
  <ellipse cx="150" cy="165" rx="122" ry="150" fill="${t.hair}" />
  <rect x="118" y="270" width="64" height="90" rx="26" fill="${t.shadow}" />
  <ellipse cx="50" cy="185" rx="12" ry="18" fill="${t.skin}" />
  <ellipse cx="250" cy="185" rx="12" ry="18" fill="${t.skin}" />
  <ellipse class="face-base" cx="150" cy="185" rx="102" ry="128" fill="${t.skin}" />
  <ellipse cx="150" cy="70" rx="95" ry="45" fill="${t.hair}" />

  <g class="imperfections">
    <ellipse cx="150" cy="185" rx="102" ry="128" fill="#7d7d7d" opacity="0.10" />
    <ellipse cx="96" cy="212" rx="26" ry="15" fill="#d9534f" opacity="0.28" />
    <ellipse cx="204" cy="212" rx="26" ry="15" fill="#d9534f" opacity="0.28" />
    <ellipse cx="139" cy="205" rx="6" ry="9" fill="#d9534f" opacity="0.22" />
    <ellipse cx="161" cy="205" rx="6" ry="9" fill="#d9534f" opacity="0.22" />
    <circle cx="84" cy="240" r="3.2" fill="#b83a30" opacity="0.7" />
    <circle cx="214" cy="150" r="2.8" fill="#b83a30" opacity="0.7" />
    <circle cx="152" cy="240" r="2.6" fill="#b83a30" opacity="0.7" />
    <circle cx="118" cy="120" r="2.4" fill="#b83a30" opacity="0.6" />
    <g class="darkcircles">
      <ellipse cx="110" cy="184" rx="22" ry="8" fill="#4a3f6b" opacity="0.35" />
      <ellipse cx="190" cy="184" rx="22" ry="8" fill="#4a3f6b" opacity="0.35" />
    </g>
  </g>

  <g class="layer layer-prep"><ellipse class="sheen" cx="150" cy="150" rx="65" ry="55" fill="#ffffff" opacity="0.12" /></g>
  <g class="layer layer-primer"><path d="M118 100 L182 100 L168 135 L168 225 L132 225 L132 135 Z" fill="${t.light}" opacity="0.18" /></g>
  <g class="layer layer-corrector">
    <ellipse cx="110" cy="184" rx="20" ry="7" fill="#f4b183" opacity="0.6" />
    <ellipse cx="190" cy="184" rx="20" ry="7" fill="#f4b183" opacity="0.6" />
  </g>
  <g class="layer layer-foundation"><ellipse cx="150" cy="185" rx="102" ry="128" fill="${t.skin}" opacity="0.92" /></g>
  <g class="layer layer-concealer">
    <path d="M88 178 Q110 200 132 178 L122 196 Q110 206 98 196 Z" fill="${t.light}" opacity="0.85" />
    <path d="M168 178 Q190 200 212 178 L202 196 Q190 206 178 196 Z" fill="${t.light}" opacity="0.85" />
  </g>
  <g class="layer layer-powder"><path d="M120 95 L180 95 L165 130 L165 230 L135 230 L135 130 Z" fill="${t.skin}" opacity="0.5" /></g>
  <g class="layer layer-bronzer">
    <ellipse cx="72" cy="140" rx="14" ry="30" fill="#b5743f" opacity="0.32" transform="rotate(20 72 140)" />
    <ellipse cx="228" cy="140" rx="14" ry="30" fill="#b5743f" opacity="0.32" transform="rotate(-20 228 140)" />
    <ellipse cx="150" cy="295" rx="60" ry="10" fill="#b5743f" opacity="0.25" />
    <ellipse cx="150" cy="185" rx="5" ry="22" fill="#b5743f" opacity="0.18" />
  </g>
  <g class="layer layer-contour">
    <ellipse cx="84" cy="222" rx="30" ry="9" fill="${t.shadow}" opacity="0.55" transform="rotate(-28 84 222)" />
    <ellipse cx="216" cy="222" rx="30" ry="9" fill="${t.shadow}" opacity="0.55" transform="rotate(28 216 222)" />
    <path d="M100 290 Q150 318 200 290" stroke="${t.shadow}" stroke-width="10" fill="none" opacity="0.4" stroke-linecap="round" />
    <line x1="143" y1="170" x2="141" y2="212" stroke="${t.shadow}" stroke-width="3" opacity="0.4" stroke-linecap="round" />
    <line x1="157" y1="170" x2="159" y2="212" stroke="${t.shadow}" stroke-width="3" opacity="0.4" stroke-linecap="round" />
  </g>
  <g class="layer layer-blush">
    <ellipse cx="98" cy="208" rx="24" ry="13" fill="${t.blush}" opacity="0.45" transform="rotate(-15 98 208)" />
    <ellipse cx="202" cy="208" rx="24" ry="13" fill="${t.blush}" opacity="0.45" transform="rotate(15 202 208)" />
  </g>
  <g class="layer layer-highlight">
    <ellipse cx="92" cy="192" rx="20" ry="5" fill="#ffffff" opacity="0.5" transform="rotate(-20 92 192)" />
    <ellipse cx="208" cy="192" rx="20" ry="5" fill="#ffffff" opacity="0.5" transform="rotate(20 208 192)" />
    <line x1="150" y1="165" x2="150" y2="205" stroke="#ffffff" stroke-width="3" opacity="0.45" stroke-linecap="round" />
    <ellipse cx="150" cy="243" rx="8" ry="2.5" fill="#ffffff" opacity="0.5" />
  </g>

  <g class="features">
    <path d="M150 160 Q142 200 138 214 Q150 224 162 214 Q158 200 150 160" fill="none" stroke="${t.shadow}" stroke-width="2.2" stroke-linejoin="round" opacity="0.9" />
    <ellipse cx="110" cy="168" rx="19" ry="10" fill="#ffffff" />
    <ellipse cx="190" cy="168" rx="19" ry="10" fill="#ffffff" />
    <circle cx="110" cy="169" r="7" fill="#5a3b2e" />
    <circle cx="190" cy="169" r="7" fill="#5a3b2e" />
    <circle cx="110" cy="169" r="3" fill="#1b1b1b" />
    <circle cx="190" cy="169" r="3" fill="#1b1b1b" />
    <circle cx="107.5" cy="166.5" r="1.6" fill="#ffffff" />
    <circle cx="187.5" cy="166.5" r="1.6" fill="#ffffff" />
    <path d="M91 166 Q110 152 129 166" fill="none" stroke="${t.shadow}" stroke-width="2" />
    <path d="M171 166 Q190 152 209 166" fill="none" stroke="${t.shadow}" stroke-width="2" />
    <g class="brows-before">
      <path d="M90 143 Q110 136 130 141" fill="none" stroke="${t.hair}" stroke-width="2.4" opacity="0.55" stroke-linecap="round" />
      <path d="M170 141 Q190 136 210 143" fill="none" stroke="${t.hair}" stroke-width="2.4" opacity="0.55" stroke-linecap="round" />
    </g>
    <g class="lips-before">
      <path d="M124 252 Q137 244 150 250 Q163 244 176 252 Q150 262 124 252 Z" fill="${t.lipBefore}" />
      <path d="M124 252 Q150 274 176 252 Q150 260 124 252 Z" fill="${t.lipBefore}" opacity="0.9" />
    </g>
  </g>

  <g class="layer layer-brows">
    <path d="M88 145 Q100 134 118 136 Q128 137 132 141 Q120 140 108 141 Q98 142 90 147 Z" fill="${t.hair}" />
    <path d="M212 145 Q200 134 182 136 Q172 137 168 141 Q180 140 192 141 Q202 142 210 147 Z" fill="${t.hair}" />
  </g>
  <g class="layer layer-eyeshadow">
    <path d="M90 164 Q110 146 130 164 Q110 157 90 164 Z" fill="${t.shadowLid}" opacity="0.8" />
    <path d="M170 164 Q190 146 210 164 Q190 157 170 164 Z" fill="${t.shadowLid}" opacity="0.8" />
    <ellipse cx="128" cy="160" rx="8" ry="5" fill="#5a3a30" opacity="0.5" />
    <ellipse cx="172" cy="160" rx="8" ry="5" fill="#5a3a30" opacity="0.5" />
  </g>
  <g class="layer layer-eyeliner" stroke="#1b1b1b" stroke-width="2.4" fill="none" stroke-linecap="round">
    <path d="M92 165 Q110 154 128 164 L136 158" />
    <path d="M208 165 Q190 154 172 164 L164 158" />
  </g>
  <g class="layer layer-mascara" stroke="#1b1b1b" stroke-width="1.6" stroke-linecap="round">
    ${lashes(110, 160, 7, -1)}
    ${lashes(190, 160, 7, 1)}
  </g>
  <g class="layer layer-lashes" stroke="#1b1b1b" stroke-width="1.8" stroke-linecap="round">
    ${lashes(112, 159, 12, -1)}
    ${lashes(188, 159, 12, 1)}
  </g>
  <g class="layer layer-lipliner">
    <path d="M123 252 Q137 243 150 249 Q163 243 177 252 Q150 275 123 252 Z" fill="none" stroke="${t.lip}" stroke-width="1.8" />
  </g>
  <g class="layer layer-lips">
    <path d="M124 252 Q137 244 150 250 Q163 244 176 252 Q150 262 124 252 Z" fill="${t.lip}" />
    <path d="M124 252 Q150 274 176 252 Q150 260 124 252 Z" fill="${t.lip}" opacity="0.92" />
    <ellipse cx="150" cy="262" rx="10" ry="2.5" fill="#ffffff" opacity="0.25" />
  </g>
  <g class="layer layer-setting"><ellipse cx="150" cy="185" rx="102" ry="128" fill="#ffffff" opacity="0.05" /></g>
</svg>`;
}

// Apply a set of visible layers to a rendered face element.
export function setLayers(svg, layers) {
  if (!svg) return;
  for (const l of LAYER_ORDER) svg.classList.toggle(`l-${l}`, layers.has(l));
}

export function layersUpTo(layerList, index) {
  return new Set(layerList.slice(0, index));
}
