# Kingez — Systems Engineering Portfolio

[**Live website**](https://kayden-pixel.github.io/) · [Public GitHub](https://github.com/kayden-pixel) · [Discord](https://discord.gg/SdCvw52vzS)

A fast, zero-build portfolio covering Minecraft plugins, Discord automation, local AI assistants, Android software, connected-device tools, document research and Node.js backends.

## V4 — developer command centre and public chat

- Midnight black, deep crimson and baby-blue colour language inspired by a high-tech workshop HUD, with a **CSS arc-reactor motif**, responsive navigation, keyboard support and reduced-motion alternatives.
- A clearly scoped **custom Discord bot commissions** section, offering a **possible one-year Discord Nitro gift arrangement** for agreed work. No checkout, automated payments or promises of unlimited scope.
- **Kingez Knowledge Console:** a floating, keyboard-accessible chatbox that answers questions **only about Kingez, his public projects and work**. It is deterministic, powered by reviewed `data/kingez-public.json`, not a claim of unlimited AI model access. Unknown/off-topic questions get a refusal.
- A shared small answer engine in `assets/public-answers.mjs`; the browser UI is in `assets/portfolio-chat.mjs`. No chat history is written to localStorage, sessionStorage or a database.
- `backend/worker.mjs` is an **optional, not-yet-deployed** public API. It uses the exact same public data, explicit site-origin CORS, body limits, a fail-closed Cloudflare rate-limit binding and read-only answers. Enter its deployed HTTPS `/ask` URL into the `kingez-public-chat-api` meta tag only after provisioning and reviewing the service. If it goes offline, the browser falls back to local answers. GitHub Pages itself does not run the Worker.
- The private KingPro repository has a separate read-only `portfolio_public_lookup` plugin. The plugin fetches only this published JSON **outbound on explicit invocation**; the website cannot call KingPro, open a network listener, read private memory, execute tools or access the user's computer.

### Optional public backend setup

A backend is unnecessary for the included public Q&A widget; the static site works on GitHub Pages alone. To run the optional Cloudflare Worker independently:

1. Install and authenticate Wrangler v4.36+ in your own Cloudflare account.
2. Review `wrangler.jsonc`, choose a unique `ratelimits[0].namespace_id` for your account, and keep the `CHAT_LIMITER` binding enabled.
3. Run `npx wrangler deploy --dry-run` and then `npx wrangler deploy` from the repository root. The deployed Worker will offer `GET /health` and `POST /ask`. It does **not** run Jarvis or forward private data.
4. Only after validating `/health`, rate limits and the allowed origin, set `<meta name="kingez-public-chat-api" content="https://YOUR-WORKER.workers.dev/ask">` in `index.html`. Without it, the browser's local answer engine remains active.

The `Origin` header is not authentication; this is safe only because **all responses are already public**. The Worker limiter is approximate and may not be strict across Cloudflare regions. Do not add LLM API keys to public JavaScript. This project never serves a public endpoint into the private Jarvis runtime.

### Test

```sh
node --check assets/portfolio-chat.mjs
node --check assets/public-answers.mjs
node --check backend/worker.mjs
node --test test/portfolio.test.js test/public-knowledge.test.mjs
```

In the browser, confirm that chat questions about Kingez, Nitro terms, Jarvis and public projects return approved answers; out-of-scope questions refuse; links open safely; closing restores focus; disabled scripts leave all primary portfolio content and commissions visible; reduced-motion users are not forced into animations.

## Studio v3

- Original Kingez **K monogram SVG**, used in the navbar, hero and browser favicon.
- New midnight / electric cyan / iris-purple palette. Responsive motion, interactive buttons, refined typography and hover states.
- **12 featured projects**, clearly labelled as public downloads, public beta, private development, prototype or retired. Public project links are to real GitHub or Modrinth pages.
- **Interactive Systems Lab** explaining KingPro, ModAI, Kydora Home, SA Exam Research Engine, SENSE and OmniPanel. Switchable architecture pipeline, technology chips, technical notes. This visualizer is illustrative, not telemetry.
- **Search + category filters** for projects; dedicated devices category; per-project deep links and copy-link buttons.
- Existing command palette, mobile navigation, responsive design, page reading progress and public GitHub counts remain.
- All user-generated data remains on GitHub Pages' static frontend only; there is **no fake backend**, private credentials or browser-accessible admin system.

## Structure

| File | Purpose |
|---|---|
| `index.html` | All human-readable content, links, existing base CSS and markup |
| `assets/experience.css`, `assets/experience.js` | v2 progressive enhancements |
| `assets/studio-v3.css`, `assets/studio-v3.js` | v3 palette, Systems Lab, search, copy-link interactions |
| `assets/kingez-mark.svg` | Hand-authored editable SVG logo and favicon |
| `test/portfolio.test.js` | Zero-dependency integrity checks |
| `.github/workflows/portfolio-check.yml` | Node syntax and site checks on pushes/PRs |

GitHub Pages is a static site host. Public GitHub counts use GitHub's unauthenticated REST API with a 10-minute session cache and a 5.5-second timeout. Any future authenticated API, contact form, database or private model service needs separate protected backend hosting and secrets.

## Quick verification

Open `index.html` in a browser or run a local HTTP server. With Node.js 22+:

```sh
node --check assets/experience.js
node --check assets/studio-v3.js
node --test test/portfolio.test.js
```

Before shipping changes, validate at phone and desktop widths; open the mobile menu; use Ctrl/⌘+K; switch the six Systems Lab buttons; filter and search projects; expand architecture notes; test copy links; and enable reduced motion. Content and links should remain visible when JavaScript is disabled.

## Featured public work

- [OmniPanel](https://modrinth.com/plugin/omnipanel)
- [Kingez341YT PvP Pack](https://modrinth.com/resourcepack/kingez341yt)
- [SENSE](https://github.com/kayden-pixel/SENSE) — early beta; hardware not fully validated
- [Kydora Home downloads](https://github.com/kayden-pixel/Kydora-Home-Downloads/releases/latest) — applications distributed publicly; code proprietary

The private SA Exam Research Engine, KingPro, ModAI, Orbital Strike and others are described with explicit scope and maturity rather than linked to private repository source. Skystrike Survival is marked as retired.
