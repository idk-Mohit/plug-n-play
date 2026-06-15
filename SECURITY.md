# Security Policy

Plug & Play is **local-first**. Your data lives in your browser. There are no servers in this project that store, process, or analyze your data.

## Threat model

| Asset | Where it lives | How it's protected |
|---|---|---|
| Your datasets | Browser IndexedDB / OPFS | Same-origin policy; never sent over the network unless you explicitly share |
| Your dashboard configs | Browser `localStorage` / IndexedDB | Same as above |
| Shareable state (future) | URL `#fragment` (not query string) | Fragment is never sent to any server; recipient parses it locally |
| Future collaboration sessions | End-to-end encrypted P2P (WebRTC) | Optional, opt-in, with optional self-hosted signaling |

**Out of scope:** an attacker with physical access to your device, a malicious browser extension, or a compromised operating system. The standard browser security model applies.

## What we collect

**Nothing.** No analytics, no error tracking, no telemetry, no remote logs. During normal operation the app makes no network calls other than to fetch its own static assets.

If you find a network request to a domain you don't control, that is a bug. Please report it (see below).

## Supply chain

- Dependencies are pinned to exact versions (no `^`, no `~`). `.npmrc` enforces `save-exact=true`.
- The lockfile (`pnpm-lock.yaml`) is committed and reviewed on every change.
- `pnpm audit` is run on every dependency change; `high` / `critical` advisories block merge.
- After the **Mini Shai-Hulud** npm campaign (TeamPCP, May–Jun 2026), we additionally:
  - Audit `preinstall` / `postinstall` scripts of any new dependency.
  - Inspect the published tarball for unexpectedly large minified payloads.
  - Pin to known-good versions verified against advisories.
- Full dependency policy: [`.cursor/rules/55-dependency-policy.mdc`](.cursor/rules/55-dependency-policy.mdc).

## Self-hosting

The entire app is a static site. To run it yourself:

```bash
git clone https://github.com/idk-Mohit/plug-n-play.git
cd plug-n-play
pnpm install
pnpm build
# Serve dist/ from any static host: Cloudflare Pages, Netlify, GitHub Pages, nginx, etc.
```

You can:

1. **Audit the source.** There is no backend to inspect — the entire surface is in this repo.
2. **Verify the deployed bundle.** Subresource Integrity (SRI) hashes and content-addressable hosting (e.g., Cloudflare Pages, IPFS) let you prove the served code matches the source.
3. **Run on an air-gapped machine.** No build-time or runtime network calls are required after `pnpm install`.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for security reports.

- Open a [private security advisory](https://github.com/idk-Mohit/plug-n-play/security/advisories/new) on the repo, **or**
- Email the maintainer directly (contact via GitHub profile).

We aim to acknowledge within **7 days** and ship a fix or mitigation within **30 days** for confirmed issues.

## What "local-first" means in practice

- **No login. No account. No accounts database to leak.**
- **No network call** to any server we control during normal use.
- **All compute** happens in your browser — main thread, web workers, WASM.
- **Future collaboration** features will use end-to-end encrypted, peer-to-peer transport (WebRTC) with optional self-hosted signaling. They will be opt-in and clearly disclosed before any peer connection is established.
- **Live data sources** (databases, APIs) — when added — will connect from *your* browser, with credentials that never leave your device.

## Cross-references

- Security/privacy rules in code: [`.cursor/rules/50-security-privacy.mdc`](.cursor/rules/50-security-privacy.mdc)
- Dependency policy: [`.cursor/rules/55-dependency-policy.mdc`](.cursor/rules/55-dependency-policy.mdc)
- Data handling discipline: [`.cursor/rules/80-data-handling.mdc`](.cursor/rules/80-data-handling.mdc)
