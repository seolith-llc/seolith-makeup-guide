import { h, raw } from '../dom.js';
import { TERMS, PRIVACY, LEGAL_META, fillLegal } from '../../data/legal.js';

export function legalHtml(kind) {
  const sections = kind === 'privacy' ? PRIVACY : TERMS;
  return h`
    <p class="muted small">Version ${LEGAL_META.version}, effective ${LEGAL_META.effective}.</p>
    ${sections.map((s) => raw(h`<h2>${s.heading}</h2>${s.paragraphs.map((p) => raw(h`<p>${fillLegal(p)}</p>`))}`))}`;
}

export async function view({ params, path }) {
  const kind = path.startsWith('/privacy') ? 'privacy' : 'terms';
  const html = h`<section class="section legal"><h1>${kind === 'privacy' ? 'Privacy Policy' : 'Terms of use'}</h1>${raw(legalHtml(kind))}
    <p class="muted small"><a class="link" href="${kind === 'privacy' ? '#/terms' : '#/privacy'}">${kind === 'privacy' ? 'Terms of use' : 'Privacy Policy'}</a></p></section>`;
  return { title: kind === 'privacy' ? 'Privacy' : 'Terms', html };
}
