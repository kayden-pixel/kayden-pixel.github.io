/* Kingez Studio v3: zero-dependency interactive system explorer and project discovery. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Static descriptions of verified/owner-described project architecture.
  // No runtime status metrics are fabricated here; project maturity is labelled.
  const systems = {
    kingpro: {
      eyebrow: 'DESKTOP AI / PRIVATE SOURCE',
      title: 'KingPro · Personal AI Command Center',
      description: 'A Windows-first assistant that coordinates voice input, multiple AI models, capability plugins, trusted tools and computer controls. Individual actions are permission-scoped rather than unrestricted.',
      highlights: [
        'Voice and text pipelines remain separate so text can continue when live voice disconnects.',
        'Model routing and tool invocation share a controlled context, with approvals for sensitive actions.',
        'Python plugins can be loaded independently without coupling every capability to the core UI.'
      ],
      tech: ['Python', 'PyQt6', 'Local tools', 'Model routing'],
      stages: ['Input & voice', 'Model router', 'Permission gates', 'Local tools'],
      caption: 'Conceptual architecture — not a live system telemetry view.',
      note: 'Current development is private. Features depend on configured providers and trusted local permissions.'
    },
    modai: {
      eyebrow: 'DISCORD SECURITY / PRIVATE DEVELOPMENT',
      title: 'ModAI · Moderation & Incident Intelligence',
      description: 'A Discord-focused moderation architecture with incident records, enforcement boundaries, anti-raid/anti-nuke safeguards and auditability across a panel-oriented control surface.',
      highlights: [
        'Signals are merged into incidents rather than treating each event as a separate untraceable action.',
        'Policy versions and evidence support decisions that moderators can investigate and review.',
        'Permission hierarchy and owner protection constrain high-impact moderation actions.'
      ],
      tech: ['Discord', 'Event processing', 'Policy', 'Audit logs'],
      stages: ['Discord events', 'Risk & policy', 'Incident review', 'Safe actions'],
      caption: 'Architecture overview; this portfolio is not connected to moderation data.',
      note: 'Private system — diagrams describe architecture, not guaranteed incident detection.'
    },
    kydora: {
      eyebrow: 'CROSS-DEVICE SYSTEM / RELEASED APP',
      title: 'Kydora Home · Connected Devices',
      description: 'A Windows and Android device-connectivity system with approved pairing, trusted-home roles and encrypted file transfer. Its public release repository distributes installers and verification information; the source is private.',
      highlights: [
        'Pairing uses explicit device approval, with Home invitations requiring acceptance.',
        'Remote reachability uses Tailscale between trusted endpoints, not an exposed public file server.',
        'Release assets include SHA-256 hashes so downloaded files can be checked.'
      ],
      tech: ['Windows', 'Android', 'Tailscale', 'Encryption'],
      stages: ['Approve device', 'Secure routing', 'Transfer data', 'Verify & receive'],
      caption: 'Release architecture simplified for this portfolio.',
      note: 'Public downloads are available; device setup and network connectivity remain required.'
    },
    exam: {
      eyebrow: 'EDUCATION ENGINE / LOCAL PROTOTYPE',
      title: 'SA Exam Research · Source-Grounded Study',
      description: 'A local research pipeline for South African exam PDFs. Papers are indexed with source metadata, then queried and analyzed through a local API and React dashboard; it is not yet a trained educational language model.',
      highlights: [
        'PDF content, provenance and duplicate checks are stored in a local SQLite/FTS5 index.',
        'Rule-based question analysis extracts structure, marks and review flags from indexed papers.',
        'FastAPI and React expose a local control dashboard without sending paper data to a cloud LLM.'
      ],
      tech: ['Python', 'SQLite FTS5', 'FastAPI', 'React'],
      stages: ['Import PDFs', 'Index & cite', 'Analyze questions', 'Local dashboard'],
      caption: 'Phase-by-phase data pipeline; predictions require reviewed labels and backtests.',
      note: 'Private development. Training controls are not implemented; no exam predictions are guaranteed.'
    },
    sense: {
      eyebrow: 'ANDROID / OPEN SOURCE BETA',
      title: 'SENSE · Local-first Android Sensing',
      description: 'An Android exploration of local sensing, optional shared presence, audio communication and privacy-aware UI. A service API and LiveKit authorization exist, while physical-device calibration is still in beta.',
      highlights: [
        'Kotlin/Compose app with device-local settings, authentication and contextual permissions.',
        'Shared flows use an HTTPS service; audio rooms use LiveKit where configured.',
        'Radar and camera features explicitly distinguish experimental readings from verified accuracy.'
      ],
      tech: ['Kotlin', 'Compose', 'Cloudflare', 'LiveKit'],
      stages: ['Device inputs', 'Local privacy', 'Optional service', 'User interface'],
      caption: 'A simplified beta architecture; not a claim of validated hardware precision.',
      note: 'Early beta. Two-device hardware testing and calibration remain incomplete.'
    },
    omnipanel: {
      eyebrow: 'MINECRAFT ADMIN / PUBLIC RELEASE',
      title: 'OmniPanel · Operations for Paper Servers',
      description: 'A server-management plugin that combines command routing, inventory UIs, ranks, diagnostics, punishment flows, regions, integrations and administration within one coherent Paper/Purpur workflow.',
      highlights: [
        'Event handlers and permission checks feed guarded staff and player operations.',
        'A central UI surfaces server features without scattering them across many commands.',
        'Integrations connect established server plugins rather than replacing the entire ecosystem.'
      ],
      tech: ['Java 21', 'Paper API', 'Permissions', 'WorldGuard'],
      stages: ['Player events', 'Access checks', 'Admin modules', 'Paper server'],
      caption: 'Illustrative integration flow, not a real-time server monitor.',
      note: 'Public download is available on Modrinth; supported versions depend on release.'
    }
  };

  const tabs = $$('.lab-tab[data-system]');
  const eyebrow = $('#lab-eyebrow');
  const title = $('#lab-title');
  const description = $('#lab-description');
  const highlights = $('#lab-highlights');
  const tech = $('#lab-tech');
  const nodes = $$('[data-lab-node]');
  const caption = $('#lab-caption');
  const note = $('#lab-note');
  const content = $('#lab-content');

  function renderSystem(key, animate = true) {
    const entry = systems[key];
    if (!entry || !title || !description || !highlights || !tech || nodes.length !== 4) return;
    tabs.forEach(button => {
      const selected = button.dataset.system === key;
      button.setAttribute('aria-pressed', String(selected));
    });
    eyebrow.textContent = entry.eyebrow;
    title.textContent = entry.title;
    description.textContent = entry.description;
    highlights.replaceChildren();
    entry.highlights.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line;
      highlights.appendChild(li);
    });
    tech.replaceChildren();
    entry.tech.forEach(name => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = name;
      tech.appendChild(span);
    });
    entry.stages.forEach((line, i) => { nodes[i].textContent = line; });
    caption.textContent = entry.caption;
    note.textContent = entry.note;
    if (animate && content && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      content.classList.remove('lab-swap');
      void content.offsetWidth;
      content.classList.add('lab-swap');
    }
  }
  tabs.forEach((button, i) => {
    button.addEventListener('click', () => renderSystem(button.dataset.system));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = i;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      renderSystem(tabs[next].dataset.system);
    });
  });
  if (tabs.length) renderSystem('kingpro', false);

  // Extend v2's category filters with a fast local text search.
  // v2 listeners run first; this listener then intersects category + text.
  const projectCards = $$('#work article.project');
  const filterButtons = $$('.filter-pill[data-filter]');
  const search = $('#project-search');
  const count = $('#project-count');
  const noMatches = $('#project-empty');

  function refreshProjects() {
    const selected = filterButtons.find(button => button.getAttribute('aria-pressed') === 'true');
    const category = selected ? selected.dataset.filter : 'all';
    const query = search ? search.value.trim().toLocaleLowerCase() : '';
    let shown = 0;
    projectCards.forEach(card => {
      const categories = (card.dataset.categories || '').split(/\s+/);
      const matchesCategory = category === 'all' || categories.includes(category);
      const matchesText = !query || (card.textContent || '').toLocaleLowerCase().includes(query);
      const visible = matchesCategory && matchesText;
      card.hidden = !visible;
      if (visible) {
        shown++;
        card.classList.add('visible');
      }
    });
    if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
    if (noMatches) noMatches.hidden = shown !== 0;
  }
  filterButtons.forEach(button => button.addEventListener('click', refreshProjects));
  if (search) {
    search.addEventListener('input', refreshProjects);
    search.addEventListener('keydown', event => {
      if (event.key === 'Escape' && search.value) { search.value = ''; refreshProjects(); }
    });
  }
  refreshProjects();

  // Share deep links to actual portfolio sections, no third-party service.
  const copiedStatus = $('#copy-status');
  projectCards.forEach((card, index) => {
    const target = card.id || 'project-' + (index + 1);
    card.id = target;
    let buttons = $('.project-actions', card);
    if (!buttons) {
      buttons = document.createElement('div');
      buttons.className = 'project-actions';
      const note = $('.proof-note', card);
      if (note) note.before(buttons);
      else $('.project-copy', card)?.appendChild(buttons);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-link copy-project-link';
    button.textContent = 'Copy project link';
    button.setAttribute('aria-label', 'Copy link to ' + ($('h3', card)?.textContent || 'project'));
    button.addEventListener('click', async () => {
      const value = window.location.href.split('#')[0] + '#' + encodeURIComponent(target);
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        button.textContent = 'Copied ✓';
        if (copiedStatus) copiedStatus.textContent = 'Project link copied.';
      } catch (_) {
        button.textContent = 'Copy not available';
        if (copiedStatus) copiedStatus.textContent = 'Clipboard unavailable. Use the address bar to share this page.';
      }
      window.setTimeout(() => { button.textContent = 'Copy project link'; }, 1800);
    });
    buttons.appendChild(button);
  });
})();
