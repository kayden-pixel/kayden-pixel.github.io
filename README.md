# Kingez — Systems Engineering Portfolio

[**Live website**](https://kayden-pixel.github.io/) · [Public GitHub](https://github.com/kayden-pixel) · [Discord](https://discord.gg/SdCvw52vzS)

A fast, zero-build portfolio covering Minecraft plugins, Discord automation, local AI assistants, Android software, connected-device tools, document research and Node.js backends.

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
