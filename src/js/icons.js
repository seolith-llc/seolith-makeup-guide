// Inline line-icon set for navigation and menus. Kept as raw SVG strings (no external
// icon font, no network request) so the strict Content Security Policy and offline-first
// design are untouched. Every icon is a 22x22 viewBox, stroke-based, currentColor.

const wrap = (inner) =>
  `<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  home: wrap(
    '<path d="M3.5 10.5 11 4l7.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M5.5 9v8a1 1 0 0 0 1 1H15.5a1 1 0 0 0 1-1V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M8.75 18v-4.5a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  looks: wrap(
    '<path d="M9.3 4.2c0-.9.76-1.6 1.7-1.6s1.7.7 1.7 1.6v3.4H9.3V4.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M8.6 7.6h4.8l.9 2.2c.24.58.37 1.2.37 1.83V16.3c0 1.16-.94 2.1-2.1 2.1H9.43a2.1 2.1 0 0 1-2.1-2.1v-4.67c0-.63.13-1.25.37-1.83l.9-2.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M7.3 12.6h7.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  bag: wrap(
    '<path d="M6 8h10l.85 9.36A1.5 1.5 0 0 1 15.36 19H6.64a1.5 1.5 0 0 1-1.49-1.64L6 8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M8.3 8V6.3a2.7 2.7 0 0 1 5.4 0V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  chart: wrap(
    '<path d="M4 17.5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M4 17.5h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M6.5 15 10 10.2l2.6 2.4L17.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M14 6.5h3.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  more: wrap(
    '<circle cx="5.2" cy="6" r="1.4" fill="currentColor"/><circle cx="11" cy="6" r="1.4" fill="currentColor"/><circle cx="16.8" cy="6" r="1.4" fill="currentColor"/>' +
      '<circle cx="5.2" cy="11" r="1.4" fill="currentColor"/><circle cx="11" cy="11" r="1.4" fill="currentColor"/><circle cx="16.8" cy="11" r="1.4" fill="currentColor"/>' +
      '<circle cx="5.2" cy="16" r="1.4" fill="currentColor"/><circle cx="11" cy="16" r="1.4" fill="currentColor"/><circle cx="16.8" cy="16" r="1.4" fill="currentColor"/>',
  ),
  mirror: wrap(
    '<ellipse cx="11" cy="9" rx="6" ry="7.2" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M11 16.2V19.5M8 19.5h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  clock: wrap(
    '<circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M11 6.8V11l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  bottle: wrap(
    '<path d="M9.3 3.5h3.4v2.6l1.4 1.8v9.6a1.6 1.6 0 0 1-1.6 1.6H9.5a1.6 1.6 0 0 1-1.6-1.6V7.9l1.4-1.8V3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M8.4 11.6h5.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  bulb: wrap(
    '<path d="M11 3.8a5 5 0 0 1 2.9 9.08c-.5.36-.9 1-.9 1.62v.5H9v-.5c0-.62-.4-1.26-.9-1.62A5 5 0 0 1 11 3.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M9.3 17.5h3.4M9.7 19.2h2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  link: wrap(
    '<path d="M9.3 12.7 12.7 9.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M11.4 6.6 13 5a3 3 0 0 1 4.2 4.2l-1.9 1.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M10.6 15.4 9 17a3 3 0 0 1-4.2-4.2l1.9-1.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  mail: wrap(
    '<rect x="3.5" y="5.5" width="15" height="11" rx="1.6" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M4.2 6.5 11 12l6.8-5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  gear: wrap(
    '<circle cx="11" cy="11" r="2.7" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M11 4.3v1.9M11 15.8v1.9M17.7 11h-1.9M6.2 11H4.3M15.9 6.1l-1.35 1.35M7.45 14.55 6.1 15.9M15.9 15.9l-1.35-1.35M7.45 7.45 6.1 6.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  document: wrap(
    '<path d="M7 3.8h6l3 3v10.9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M8.3 10h5.4M8.3 13h5.4M8.3 16h3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  lock: wrap(
    '<rect x="5" y="10" width="12" height="8" rx="1.6" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M7.5 10V7.3a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  heart: wrap(
    '<path d="M11 18s-6.5-4.02-6.5-8.6C4.5 6.6 6.3 5 8.3 5c1.1 0 2.1.5 2.7 1.4C11.6 5.5 12.6 5 13.7 5c2 0 3.8 1.6 3.8 4.4C17.5 14 11 18 11 18Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  ),
  heartFilled: wrap(
    '<path d="M11 18s-6.5-4.02-6.5-8.6C4.5 6.6 6.3 5 8.3 5c1.1 0 2.1.5 2.7 1.4C11.6 5.5 12.6 5 13.7 5c2 0 3.8 1.6 3.8 4.4C17.5 14 11 18 11 18Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  ),
};

export function icon(name, extraClass = '') {
  return `<span class="ico ${extraClass}">${ICONS[name] || ''}</span>`;
}
