import { h, raw } from '../dom.js';

export const MENU = [
  { href: '#/before-after', icon: '🪞', label: 'Before and after', desc: 'See what each step changes' },
  { href: '#/estimate', icon: '⏱️', label: 'Time estimate', desc: 'How long a look takes, and what fits your time' },
  { href: '#/kit', icon: '🧴', label: 'My Kit', desc: 'Track when to replace products' },
  { href: '#/tips', icon: '💡', label: 'Tips', desc: 'Best practices and hygiene' },
  { href: '#/share', icon: '🔗', label: 'Share and invite', desc: 'Send the app or a look to a friend' },
  { href: '#/feedback', icon: '✉️', label: 'Feedback', desc: 'Request features, report bugs, fix content' },
  { href: '#/settings', icon: '⚙️', label: 'Settings', desc: 'Profile, privacy, install, data' },
  { href: '#/terms', icon: '📄', label: 'Terms of use', desc: '' },
  { href: '#/privacy', icon: '🔒', label: 'Privacy Policy', desc: '' },
  { href: '#/admin', icon: '📊', label: 'Admin', desc: 'Usage dashboard (passphrase)' },
];

export async function view() {
  const html = h`<section class="section"><h1>More</h1>
    <ul class="menu">${MENU.map((m) => raw(h`<li><a class="menu-item" href="${m.href}"><span class="menu-icon" aria-hidden="true">${m.icon}</span><span><span class="menu-label">${m.label}</span>${m.desc ? raw(h`<span class="muted small">${m.desc}</span>`) : ''}</span></a></li>`))}</ul></section>`;
  return { title: 'More', html };
}
