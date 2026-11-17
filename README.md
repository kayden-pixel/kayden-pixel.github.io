# Kingez Developer Portfolio

[**Live portfolio**](https://kayden-pixel.github.io/) · [GitHub](https://github.com/kayden-pixel) · [Discord](https://discord.gg/SdCvw52vzS)

A personal developer portfolio for Minecraft/Paper plugins, Discord automation, local AI experiments, Node.js backends and real-time systems.

## Experience v2

- Updated responsive, animated visual design: atmospheric gradients, terminal float, project preview motion, responsive cards and prominent calls to action.
- Filterable portfolio covering Minecraft, Discord, AI/interfaces and backend engineering.
- Searchable navigation palette (Ctrl/⌘ + K or `/`) and keyboard-accessible mobile menu.
- Reading progress and active-section feedback.
- Public GitHub repository/follower counts with a 5.5-second fetch timeout, 10-minute session cache and graceful offline fallback.
- Reduced-motion support and accessible focus states.
- Eight featured projects, with public/private/prototype status labels where relevant.

## Architecture and security

GitHub Pages serves this repository as **static HTML, CSS and JavaScript**. No build tools, database, API tokens or server are needed. `index.html` holds the site content and original base styles. `assets/experience.css` and `assets/experience.js` provide the progressive enhancements.

The GitHub count panel uses GitHub's public, unauthenticated user API. It **is not a private backend**: GitHub Pages cannot execute server-side functions. The panel uses bounded caching, does not expose API credentials and displays an unavailable message if the public API cannot be reached. Future private APIs, contact submissions or paid services would need independent server-side hosting plus secrets and abuse protection.

All portfolio content remains readable without the public GitHub API. JavaScript enhances search/filter/navigation but the project descriptions and links are ordinary HTML.

## Verify locally

Open `index.html` in a browser. To run checks with Node.js 22+:

```sh
node --check assets/experience.js
node --test test/portfolio.test.js
```

GitHub Actions repeats these checks on pushes and pull requests. Also manually verify responsive layouts, keyboard navigation, links and reduced-motion behavior in a browser before release.

## Selected public work

- [OmniPanel](https://modrinth.com/plugin/omnipanel) — Minecraft server administration
- [Kingez341YT PvP Pack](https://modrinth.com/resourcepack/kingez341yt) — PvP-focused texture pack

Private work and experimental projects are identified as such; the site does not claim they are open-source releases.
