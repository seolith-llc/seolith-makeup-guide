# Blendwise: static PWA served by nginx. No build step; the image is just nginx plus src/.
FROM nginx:1.27-alpine

# Security headers, cache rules and SPA fallback live in docker/nginx.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.inc /etc/nginx/conf.d/security-headers.inc
COPY src/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
