# Kingez — Systems Engineering Portfolio

[**Live website**](https://kayden-pixel.github.io/) · [Public GitHub](https://github.com/kayden-pixel) · [Discord](https://discord.gg/SdCvw52vzS)

A fast, zero-build portfolio covering Minecraft plugins, Discord automation, local AI assistants, Android software, connected-device tools, document research and Node.js backends.

## V6 — proper multi-page portfolio (no more endless homepage)

The site now uses **seven independent HTML pages**, each with its own URL, metadata, navigation state and section content:

| Destination | URL | What it contains |
| --- | --- | --- |
| Home | [index.html](https://kayden-pixel.github.io/) | Intro, GitHub snapshot, page directory and three selected-project links |
| Projects | [projects.html](https://kayden-pixel.github.io/projects.html) | All 12 projects, filters, search and project deep links |
| Systems | [systems.html](https://kayden-pixel.github.io/systems.html) | Six-system interactive architecture explorer |
| Services | [services.html](https://kayden-pixel.github.io/services.html) | Development services, Minecraft delivery scope and workflow |
| Discord Bots | [commissions.html](https://kayden-pixel.github.io/commissions.html) | Bot commission terms, possible one-year Discord Nitro trade |
| About | [about.html](https://kayden-pixel.github.io/about.html) | Developer profile, birthday (16 June 2001) and technical stack |
| Contact | [contact.html](https://kayden-pixel.github.io/contact.html) | Public contact links and project brief guidance |

**Mechanism:** Original inline base styling moved to `assets/base-v6.css`; new page layouts and responsive navigation live in `assets/pages-v6.css`. Each page reuses the same secure public chatbox, welcome animation, command palette, footer and original visual language. Navigation uses real `*.html` links, with a current-page marker and tested anchors. Every public FAQ response now links to the relevant new page; `backend-vercel/data/kingez-public.json` matches the public knowledge file exactly.

**Deployment:** Github Pages publishes the static HTML/CSS/JS and sitemap directly from the repository. The optional separately hosted backend remains undeployed due to account permissions; the browser's existing no-key, reviewed public Q&A works without it. Jarvis's private desktop tools are never exposed to visitors.

**Validation:**
```bash
node --test test/portfolio.test.js test/public-knowledge.test.mjs test/welcome-backend.test.mjs test/multipage.test.mjs
```
The multi-page test verifies all seven pages exist, their nav links and deep links resolve, repeated page chrome remains functional, the twelve cards only appear on Projects, and the six-system explorer only appears on Systems.

## V5 — welcome sequence, birthday and deployment-ready public API

- First-visit **Kingez Systems boot animation** with original command-centre rings, CSS progress meter, visible Skip/Enter controls and auto-completion after 3.4 seconds. It never blocks the static site if JavaScript is off. For visitors who request reduced motion, it does not auto-run.
- Small local-only `localStorage` flag prevents repeat animations on return visits; access errors fail open to the normal website. **Replay intro** is available in the footer, and the overlay supports Escape, keyboard focus trapping and a manual exit.
- Owner-requested **birthday: 16 June 2001**, displayed in About using a semantic `<time>` element, also added to the approved public portfolio Q&A knowledge for the site and read-only Jarvis plugin.
- A real, **optional** Vercel Node 22 serverless API in `backend-vercel/` using the same reviewed FAQ knowledge. It includes `POST /api/ask` and `GET /api/health`, input limits, exact allowed-origin CORS, per-instance best-effort throttling and no model credentials or private Jarvis access.
- The Vercel API is **not automatically active just because the GitHub Pages site is deployed**. Its own project must be created in a workspace with deploy permission, tested, and its verified URL configured in the site's `kingez-public-chat-api` meta field. Until then, the original static FAQ widget keeps working.

### Backend hosting status and security

On 17 November 2026 the configured Vercel Hobby workspace was discoverable but **rejected project creation (HTTP 403)**. No Vercel production endpoint was created, and the portfolio's API meta setting remains empty. This is a permissions/hosting blocker, **not** a failed public chat: the local curated FAQ functions without an API.

The Vercel handler's in-memory limiter is *per warm function instance*, not a strict distributed/global guarantee; enforce edge-platform rate limits before considering AI model credits, chat persistence, user accounts, payments or other sensitive workloads. It must never proxy unrestricted requests to the private KingPro desktop application.

#### Deploy when hosting access is authorized

1. Create a separate Vercel project named `kingez-public-knowledge-api` linked to `kayden-pixel/kayden-pixel.github.io`, root directory **`backend-vercel`**, Node 22, with `main` as the production branch.
2. Verify both `GET https://YOUR-DEPLOYMENT/api/health` and an allowed-origin `POST /api/ask` response. Verify rejected off-origin requests and public FAQ response restrictions.
3. Configure the site `index.html` `<meta name="kingez-public-chat-api" content="https://YOUR-DEPLOYMENT/api/ask">` only after the production URL is confirmed and HTTPS-enabled. Current browser chat has a local fallback if the optional endpoint becomes unavailable.
4. Leave the GitHub Pages site and the private Jarvis application **separate**. Jarvis reads the public knowledge JSON only on owner invocation.

Do not publish a new Jarvis installer or label its desktop release as tested without compiling and validating that Windows build. The already-merged `portfolio_public_lookup` plugin is source-level integrated, but it needs a local plugin reload or restart on the owner's PC to become available.

### V5 automated checks

```sh
node --test test/portfolio.test.js test/public-knowledge.test.mjs test/welcome-backend.test.mjs
```

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
