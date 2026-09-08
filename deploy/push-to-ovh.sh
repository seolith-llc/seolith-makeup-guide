#!/usr/bin/env bash
# Push the committed tree to the OVH host and (re)deploy there. Run from the workstation:
#
#   ./deploy/push-to-ovh.sh                 # deploys HEAD of the current checkout
#   REF=v1.2.0 ./deploy/push-to-ovh.sh      # deploys a tag or commit
#
# Only committed files travel (git archive), so secrets and local files never leave the machine.
# The tunnel credentials file is copied separately, once, by the runbook (docs/deploy-ovh.md).
set -euo pipefail

HOST="${HOST:-ubuntu@40.160.89.57}"
KEY="${KEY:-$HOME/.ssh/ovh-foxy}"
DEST="${DEST:-/opt/blendwise}"
REF="${REF:-HEAD}"

cd "$(dirname "$0")/.."
sha=$(git rev-parse --short "$REF")
if [[ "$REF" == "HEAD" && -n "$(git status --porcelain)" ]]; then
  echo "note: working tree has uncommitted changes; only committed content is deployed ($sha)" >&2
fi

ssh_opts=(-i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=15)
echo "deploying $sha to $HOST:$DEST"
ssh "${ssh_opts[@]}" "$HOST" "mkdir -p '$DEST' && [ -f '$DEST/deploy/cloudflared/credentials.json' ] || { echo 'missing $DEST/deploy/cloudflared/credentials.json on host; see docs/deploy-ovh.md section 2' >&2; exit 1; }"
git archive --format=tar "$REF" | ssh "${ssh_opts[@]}" "$HOST" "tar -x -C '$DEST' && echo '$sha' > '$DEST/.deployed-sha'"
ssh "${ssh_opts[@]}" "$HOST" "cd '$DEST' && IMAGE_TAG='$sha' bash ./deploy/ovh-deploy.sh"
