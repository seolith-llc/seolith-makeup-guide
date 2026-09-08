# Prompt 2026-09-08T02:12:48.898Z

- Session: `3c6e4d7e-aa3b-4b00-86e8-e9f52ea12bec`
- Saved by: scripts/prompt-history.mjs (UserPromptSubmit hook)

## Request

set the cloudflare cache rule for me. Also merge to main should trigger a deploy.

## Response

Two things to set up. For the Cloudflare rule I need the dashboard (the tunnel certificate can't edit cache rules), so I'll open the login for you. For deploy-on-merge I'll check how the tax-manager stack on the same VPS handles it first, so the runner setup is consistent.

---

The first automated deploy passed all three stages (tests, archive-and-deploy over the forced command, smoke test on the live site). Now the Cloudflare rule via your real Chrome.

---

The Cloudflare sign-in page is open in your Chrome (Browser 2), and this time the bot check passed. Please sign in there; the page will land directly on the Cache Rules screen for amtocsoft.com. Tell me when you're in and I'll create the rule.

While waiting, here is where the deploy-on-merge work stands, all committed and pushed:

- **Workflow** [.github/workflows/deploy.yml](.github/workflows/deploy.yml): on push to `main` it runs `npm test`, streams `git archive` of the commit over SSH to the VPS, then smoke-tests the live site. The first run succeeded end to end.
- **Hardened delivery**: the CI key in the repo secrets is pinned in the host's `authorized_keys` to a single forced command, [deploy/ci-receive.sh](deploy/ci-receive.sh). I verified it refuses a shell and a malformed request, and only accepts `deploy <sha>` with an archive on stdin. The host's SSH fingerprint is pinned in the workflow so a rebuilt host fails closed.
- **Runbook** [docs/deploy-ovh.md](docs/deploy-ovh.md) now covers the CI path and how to rotate the key.

_Completed 2026-09-08T02:35:04.879Z_
