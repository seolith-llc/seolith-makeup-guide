// Hash router. Routes are "#/segment/:param". Views export { render(ctx), title }.

const routes = [];

export function route(pattern, view) {
  const keys = [];
  const re = new RegExp(
    '^' +
      pattern.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, k) => {
        keys.push(k);
        return '([^/]+)';
      }) +
      '$',
  );
  routes.push({ re, keys, view });
}

export function currentPath() {
  const hash = location.hash || '#/';
  return hash.replace(/^#/, '').split('?')[0] || '/';
}

export function currentQuery() {
  const hash = location.hash || '';
  const i = hash.indexOf('?');
  return new URLSearchParams(i >= 0 ? hash.slice(i + 1) : '');
}

export function match(path) {
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { view: r.view, params };
    }
  }
  return null;
}

export function navigate(path, { replace = false } = {}) {
  const target = '#' + path;
  if (replace) history.replaceState(null, '', target);
  else location.hash = path;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}
