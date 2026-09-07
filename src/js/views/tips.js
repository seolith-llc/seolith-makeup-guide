import { h, raw } from '../dom.js';
import { TIP_GROUPS, TIPS } from '../../data/tips.js';
import { getPrefs } from '../store.js';

export async function view() {
  const prefs = getPrefs();
  const html = h`
    <section class="section">
      <h1>Tips and best practices</h1>
      <p class="lede">Short rules that fix most beginner problems. Skin-type tips are filtered to your profile (${prefs.skinType}); change it in Settings.</p>
      ${TIP_GROUPS.map((g) => {
        const tips = TIPS.filter((t) => t.group === g.id && (!t.skinTypes || t.skinTypes.includes(prefs.skinType)));
        if (!tips.length) return '';
        return raw(h`<div class="card"><h2>${g.name}</h2><ul class="tips">${tips.map((t) => raw(h`<li><strong>${t.title}.</strong> ${t.body}</li>`))}</ul></div>`);
      })}
    </section>`;
  return { title: 'Tips', html };
}
