#!/usr/bin/env bash
# Forced command for the CI deploy key on the OVH host.
#
# authorized_keys entry (installed by the runbook):
#   restrict,command="/opt/blendwise/deploy/ci-receive.sh" ssh-ed25519 AAAA... blendwise-ci@github-actions
#
# The CI job runs:  git archive HEAD | ssh ubuntu@host "deploy <sha>"
# sshd ignores the requested command and runs this script instead, with the original
# request in SSH_ORIGINAL_COMMAND and the tar stream on stdin. The key can therefore only
# deliver an archive and trigger the deploy; it cannot open a shell or run anything else.
set -euo pipefail

DEST=/opt/blendwise
req="${SSH_ORIGINAL_COMMAND:-}"
if [[ ! "$req" =~ ^deploy\ ([0-9a-f]{7,40})$ ]]; then
  echo "ci-receive: refused request '${req}'" >&2
  exit 2
fi
sha="${BASH_REMATCH[1]:0:7}"

# Extract into a staging directory first so a truncated upload cannot leave a half-updated tree.
stage=$(mktemp -d /tmp/blendwise-stage.XXXXXX)
trap 'rm -rf "$stage"' EXIT
tar -x -C "$stage"
[[ -f "$stage/deploy/ovh-deploy.sh" && -f "$stage/src/index.html" ]] || { echo "ci-receive: archive does not look like the Blendwise repo" >&2; exit 3; }

# Sync into place. The credentials file is never in the archive (gitignored) and must survive.
mkdir -p "$DEST"
find "$DEST" -mindepth 1 -maxdepth 1 ! -name '.deployed-sha' ! -name 'deploy' -exec rm -rf {} +
find "$DEST/deploy" -mindepth 1 -maxdepth 1 ! -name 'cloudflared' -exec rm -rf {} + 2>/dev/null || true
find "$DEST/deploy/cloudflared" -mindepth 1 -maxdepth 1 ! -name 'credentials.json' -exec rm -rf {} + 2>/dev/null || true
cp -a "$stage/." "$DEST/"
echo "$sha" > "$DEST/.deployed-sha"

cd "$DEST"
IMAGE_TAG="$sha" exec bash ./deploy/ovh-deploy.sh
