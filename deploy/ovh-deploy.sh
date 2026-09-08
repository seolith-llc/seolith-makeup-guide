#!/usr/bin/env bash
# Deploy or update Blendwise on the OVH host. Idempotent; safe to rerun.
#
#   cd /opt/seolith/prod/blendwise && ./deploy/ovh-deploy.sh
#
# Pulls the latest main, rebuilds the image from source (no registry needed), restarts the
# stack, waits for nginx to be healthy and for the tunnel connector to register.
set -euo pipefail

cd "$(dirname "$0")/.."
compose=(docker compose -f deploy/docker-compose.ovh.yml -p blendwise)

command -v docker >/dev/null || { echo "docker is not installed (see docs/deploy-ovh.md)" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "docker compose plugin is not installed" >&2; exit 1; }

creds=deploy/cloudflared/credentials.json
[[ -f "$creds" ]] || { echo "missing $creds: copy ~/.cloudflared/<tunnel-id>.json from the workstation that created the tunnel" >&2; exit 1; }
mode=$(stat -c '%a' "$creds" 2>/dev/null || stat -f '%Lp' "$creds")
[[ "$mode" == "600" || "$mode" == "400" ]] || { echo "tightening $creds to mode 600"; chmod 600 "$creds"; }

if [[ -d .git && "${SKIP_PULL:-0}" != "1" ]]; then
  git fetch --quiet origin main
  git reset --quiet --hard origin/main
  echo "checked out $(git rev-parse --short HEAD)"
fi

export IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || echo prod)"
"${compose[@]}" build --pull
"${compose[@]}" up -d --remove-orphans

for _ in $(seq 1 30); do
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' blendwise-web 2>/dev/null || echo missing)
  if [[ "$health" == "healthy" ]]; then break; fi
  sleep 2
done
[[ "$health" == "healthy" ]] || { echo "blendwise-web is not healthy ($health)" >&2; "${compose[@]}" logs --tail=50 web; exit 1; }

for _ in $(seq 1 30); do
  if "${compose[@]}" logs tunnel 2>&1 | grep -q "Registered tunnel connection"; then
    echo "tunnel connector registered; https://blendwise.amtocsoft.com is served from this host"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done
echo "tunnel did not register within 60s" >&2
"${compose[@]}" logs --tail=50 tunnel
exit 1
