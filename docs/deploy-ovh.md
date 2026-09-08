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
| Credentials | `deploy/cloudflared/credentials.json`, gitignored. On the host it must be owned by uid 65532 (the `cloudflared` image's `nonroot` user) with mode 400; `ovh-deploy.sh` enforces this. Source: `~/.cloudflared/86a75bb1-3e1e-4d53-89c3-09e7b8658e59.json` on the workstation that created the tunnel |
| OVH host | `vps-57bebaca.vps.ovh.us` = `40.160.89.57` (VPS-1, Ubuntu, Virginia). Also hosts the tax-manager stack behind Caddy; Blendwise does not use Caddy or any port. |
| SSH | `ssh -i ~/.ssh/ovh-foxy ubuntu@40.160.89.57` from the workstation that holds that key |
| Cloudflare cache rule | "Blendwise: respect origin browser TTL" on zone `amtocsoft.com` (created 2026-09-08): `http.host eq "blendwise.amtocsoft.com"`, eligible for cache, Browser TTL = respect origin. Without it the zone's 4-hour browser TTL overrode `sw.js`'s `no-cache` and delayed PWA updates. |
| Install path on OVH | `/opt/blendwise` (this host keeps projects directly under `/opt`) |
| Repo access on host | None. Deploy keys are disabled by the org policy, so the workstation pushes a `git archive` of the commit over SSH (`deploy/push-to-ovh.sh`); the host never needs GitHub credentials. |
| Deploy command | `./deploy/push-to-ovh.sh` on the workstation (runs `deploy/ovh-deploy.sh` on the host) |

## 1. Host

Any Ubuntu 24.04 OVH VPS with Docker Engine and the Compose plugin. The smallest tier is enough (the stack
uses under 100 MB of RAM). If the host is new, follow sections 1 and 2 of
`seolith-twbb/docs/runbooks/ovh-vps-migration.md` for ordering, the `seolith` operator user, SSH hardening,
UFW and Docker install. Because the tunnel is the only ingress, UFW only needs SSH: do **not** open 80/443
for this app.

If the app is placed on an existing OVH host (omnifield staging `135.148.44.231`, production `51.161.10.85`,
or `ovh-app-host-01`), it lives in its own compose project and its own directory and does not touch Caddy,
Traefik or any other project's network.

## 2. First deployment (done 2026-09-07)

One-time, from the workstation that created the tunnel (it holds the credentials file):

```bash
scp -i ~/.ssh/ovh-foxy ~/.cloudflared/86a75bb1-3e1e-4d53-89c3-09e7b8658e59.json ubuntu@40.160.89.57:/tmp/blendwise-credentials.json
ssh -i ~/.ssh/ovh-foxy ubuntu@40.160.89.57 'sudo mkdir -p /opt/blendwise && sudo chown ubuntu:ubuntu /opt/blendwise && mkdir -p /opt/blendwise/deploy/cloudflared && install -m 600 /tmp/blendwise-credentials.json /opt/blendwise/deploy/cloudflared/credentials.json && rm /tmp/blendwise-credentials.json'
./deploy/push-to-ovh.sh
```

`push-to-ovh.sh` streams `git archive HEAD` into `/opt/blendwise` and runs `deploy/ovh-deploy.sh` there, which
builds the image from source, starts the stack, waits for nginx to be healthy and for the connector to log
`Registered tunnel connection`. Then check from anywhere:

```bash
curl -sI https://blendwise.amtocsoft.com/ | head -5
```

## 3. Updating

Commit, bump the version first (`node scripts/bump-version.mjs x.y.z`) so installed PWAs pick up the new
service worker cache, then:

```bash
./deploy/push-to-ovh.sh            # HEAD
REF=v1.2.0 ./deploy/push-to-ovh.sh # a tag or commit
```

Only committed files are sent. The host records the deployed commit in `/opt/blendwise/.deployed-sha`.

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

## 6. Continuous deployment (push to main)

`.github/workflows/deploy.yml` runs `npm test`, then streams `git archive <sha>` over SSH to
`ubuntu@40.160.89.57` and smoke-tests the live site. Same delivery as the tax-manager repo on this host, with
two hardenings:

- The CI key (`blendwise-ci@github-actions`, repo secrets `OVH_SSH_KEY` and `OVH_HOST`) is listed in
  `~ubuntu/.ssh/authorized_keys` with `restrict,command="/opt/blendwise/deploy/ci-receive.sh"`. sshd ignores
  whatever the job asks for and runs only that script, which validates the request (`deploy <sha>`), extracts the
  archive into a staging directory, syncs it into `/opt/blendwise` (keeping `credentials.json`) and runs
  `ovh-deploy.sh`. The key cannot open a shell or read anything else.
- The host's ed25519 public key is pinned in the workflow, so a re-imaged or spoofed host fails closed. If the VPS
  is rebuilt, update `OVH_HOST_KEY` from `ssh-keyscan -t ed25519 40.160.89.57`.

To rotate the CI key: `ssh-keygen -t ed25519 -N "" -f blendwise-ci`, replace the `blendwise-ci@github-actions`
line in `authorized_keys` (keep the `restrict,command=` prefix), then `gh secret set OVH_SSH_KEY < blendwise-ci`.

Manual deploys from a workstation still work with `./deploy/push-to-ovh.sh` (uses the operator key, unrestricted).

## 7. What is deliberately not here
- No origin certificate or Caddy: Cloudflare Universal SSL covers `blendwise.amtocsoft.com` at the edge and the tunnel is encrypted end to end.
- No telemetry or feedback server: the app stores everything on the user's device. Nothing on the host holds user data, so there is nothing to back up.
