# Deploying Blendwise to OVH at blendwise.amtocsoft.com

Blendwise is a static site in one nginx container. It is published through a **Cloudflare Tunnel**, the same
pattern as `demo-dialog-pay.amtocsoft.com`: the host publishes no ports, Cloudflare terminates TLS, and the
`cloudflared` connector in the compose stack pulls traffic in. Moving the site between hosts is just starting
the stack somewhere else with the same tunnel credentials.

| Item | Value |
|---|---|
| Hostname | `blendwise.amtocsoft.com` (zone `amtocsoft.com`, Cloudflare DNS, proxied) |
| Tunnel | `blendwise`, id `86a75bb1-3e1e-4d53-89c3-09e7b8658e59` |
| DNS record | `blendwise` CNAME `86a75bb1-3e1e-4d53-89c3-09e7b8658e59.cfargotunnel.com` (created 2026-09-07 with `cloudflared tunnel route dns`) |
| Compose file | `deploy/docker-compose.ovh.yml` (services `web`, `tunnel`) |
| Tunnel config | `deploy/cloudflared/blendwise.yml` |
| Credentials | `deploy/cloudflared/credentials.json`, gitignored, mode 600. Source: `~/.cloudflared/86a75bb1-3e1e-4d53-89c3-09e7b8658e59.json` on the workstation that created the tunnel |
| Install path on OVH | `/opt/seolith/prod/blendwise` |
| Deploy command | `./deploy/ovh-deploy.sh` |

## 1. Host

Any Ubuntu 24.04 OVH VPS with Docker Engine and the Compose plugin. The smallest tier is enough (the stack
uses under 100 MB of RAM). If the host is new, follow sections 1 and 2 of
`seolith-twbb/docs/runbooks/ovh-vps-migration.md` for ordering, the `seolith` operator user, SSH hardening,
UFW and Docker install. Because the tunnel is the only ingress, UFW only needs SSH: do **not** open 80/443
for this app.

If the app is placed on an existing OVH host (omnifield staging `135.148.44.231`, production `51.161.10.85`,
or `ovh-app-host-01`), it lives in its own compose project and its own directory and does not touch Caddy,
Traefik or any other project's network.

## 2. First deployment

On the workstation that created the tunnel (it holds the credentials file):

```bash
scp -i <ovh-ssh-key> ~/.cloudflared/86a75bb1-3e1e-4d53-89c3-09e7b8658e59.json seolith@<VPS_IP>:/tmp/blendwise-credentials.json
```

On the host:

```bash
sudo mkdir -p /opt/seolith/prod && sudo chown "$USER" /opt/seolith/prod
cd /opt/seolith/prod
git clone https://github.com/seolith-llc/seolith-makeup-guide.git blendwise   # private repo: use a read-only deploy key or `gh auth login`
cd blendwise
install -m 600 /tmp/blendwise-credentials.json deploy/cloudflared/credentials.json && rm /tmp/blendwise-credentials.json
./deploy/ovh-deploy.sh
```

The script builds the image from source, starts the stack, waits for nginx to be healthy and for the
connector to log `Registered tunnel connection`. Then check from anywhere:

```bash
curl -sI https://blendwise.amtocsoft.com/ | head -5
```

For a private repo without `gh` on the host, create a read-only deploy key:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/blendwise-deploy -N "" -C blendwise-deploy@ovh
gh repo deploy-key add ~/.ssh/blendwise-deploy.pub --repo seolith-llc/seolith-makeup-guide --title "ovh read-only"
git remote set-url origin git@github.com:seolith-llc/seolith-makeup-guide.git
```

## 3. Updating

```bash
cd /opt/seolith/prod/blendwise && ./deploy/ovh-deploy.sh
```

It resets the checkout to `origin/main`, rebuilds, and restarts only what changed. Bump the app version first
(`node scripts/bump-version.mjs x.y.z`) so installed PWAs pick up the new service worker cache.

## 4. Cutover from the interim origin

Until the OVH host is available the same stack runs on a workstation
(`docker compose -f deploy/docker-compose.ovh.yml -p blendwise up -d --build`). Cloudflare balances a
tunnel across every connected connector, so the move is:

1. Deploy on OVH (section 2). `cloudflared tunnel info blendwise` on the workstation now lists two connectors.
2. Stop the workstation stack: `docker compose -f deploy/docker-compose.ovh.yml -p blendwise down`.
3. `cloudflared tunnel info blendwise` shows only the OVH connector. No DNS change, no downtime.

## 5. Rollback and removal

- Roll back code: `git checkout <sha>` then `SKIP_PULL=1 ./deploy/ovh-deploy.sh`.
- Take the site offline: `docker compose -f deploy/docker-compose.ovh.yml -p blendwise down` (Cloudflare returns a 530 page while no connector is up).
- Remove entirely: also `cloudflared tunnel delete blendwise` and delete the CNAME in the Cloudflare dashboard.

## 6. What is deliberately not here

- No GitHub Actions deploy over SSH: the estate keeps long-lived SSH keys out of GitHub and deploys from the host (see the TWBB runbook). A self-hosted runner on the OVH host could run `deploy/ovh-deploy.sh` on push if wanted later.
- No origin certificate or Caddy: Cloudflare Universal SSL covers `blendwise.amtocsoft.com` at the edge and the tunnel is encrypted end to end.
- No telemetry or feedback server: the app stores everything on the user's device. Nothing on the host holds user data, so there is nothing to back up.
