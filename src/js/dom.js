// Tiny DOM helpers. All dynamic text goes through `esc` before reaching innerHTML,
// which keeps the strict Content Security Policy honest (no inline handlers, no inline styles).

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Tagged template: interpolations are escaped unless wrapped with raw().
export function h(strings, ...values) {
  return strings.reduce((out, s, i) => {
    const v = values[i - 1];
    let piece = '';
    if (v && v.__raw) piece = v.html;
    else if (Array.isArray(v)) piece = v.map((x) => (x && x.__raw ? x.html : esc(x))).join('');
    else if (v !== undefined) piece = esc(v);
    return out + piece + s;
  });
}

export function raw(html) {
  return { __raw: true, html: String(html) };
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

export function fmtMinutes(min) {
  if (min < 1) return 'under a minute';
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const hrs = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${hrs} h ${rest} min` : `${hrs} h`;
}

export function fmtSeconds(sec) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function stars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return raw(
    `<span class="stars" role="img" aria-label="${esc(rating.toFixed(1))} out of 5">` +
      '<span class="star full">★</span>'.repeat(full) +
      (half ? '<span class="star half">★</span>' : '') +
      '<span class="star empty">☆</span>'.repeat(empty) +
      `</span><span class="rating-num">${esc(rating.toFixed(1))}</span>`,
  );
}

let toastTimer = null;
export function toast(message, { action, onAction, duration = 4000 } = {}) {
  const host = qs('#toast');
  if (!host) return;
  host.innerHTML = h`<span>${message}</span>${action ? raw(`<button class="btn btn-small" data-toast-action>${esc(action)}</button>`) : ''}`;
  host.hidden = false;
  if (action && onAction) qs('[data-toast-action]', host).addEventListener('click', () => { onAction(); host.hidden = true; });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { host.hidden = true; }, duration);
}

export function randomId(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
