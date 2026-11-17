/* Portfolio Experience v2: accessible client-side enhancements for GitHub Pages. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = $('#nav');
  const navInner = $('.nav-inner');
  const progress = $('#scroll-progress');
  const mobileButton = $('#mobile-menu');
  const navLinks = $('#nav-links');

  // Keep scroll work on animation frames rather than doing layout every event.
  let ticking = false;
  function drawScroll() {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = max ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 16);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(drawScroll); }
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(drawScroll); }
  }, { passive: true });
  drawScroll();

  function closeMobile() {
    if (!navInner || !mobileButton) return;
    navInner.classList.remove('is-open');
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-label', 'Open navigation');
  }
  if (mobileButton && navInner) {
    mobileButton.addEventListener('click', () => {
      const open = !navInner.classList.contains('is-open');
      navInner.classList.toggle('is-open', open);
      mobileButton.setAttribute('aria-expanded', String(open));
      mobileButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    $$('#nav-links a').forEach(link => link.addEventListener('click', closeMobile));
    document.addEventListener('pointerdown', event => {
      if (navInner.classList.contains('is-open') && !navInner.contains(event.target)) closeMobile();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) closeMobile();
    });
  }

  // Accessible active-section feedback; only real sections count.
  const sectionLinks = $$('#nav-links a[href^="#"]');
  const tracked = sectionLinks.map(link => {
    const section = $(link.getAttribute('href'));
    return section ? { link, section } : null;
  }).filter(Boolean);
  if ('IntersectionObserver' in window && tracked.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      tracked.forEach(({ link, section }) => {
        const active = section === visible.target;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: [0, .1, .3, .6] });
    tracked.forEach(({ section }) => sectionObserver.observe(section));
  }

  // Filter existing static projects; their content stays accessible without JS.
  const projectCards = $$('#work article.project');
  const filterButtons = $$('.filter-pill[data-filter]');
  const projectCount = $('#project-count');
  function applyFilter(filter) {
    let shown = 0;
    projectCards.forEach(card => {
      const categories = (card.dataset.categories || '').split(/\s+/).filter(Boolean);
      const match = filter === 'all' || categories.includes(filter);
      card.hidden = !match;
      if (match) {
        shown++;
        card.classList.add('visible');
      }
    });
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === filter;
      button.setAttribute('aria-pressed', String(selected));
    });
    if (projectCount) projectCount.textContent = shown + (shown === 1 ? ' project' : ' projects');
  }
  filterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  if (projectCards.length && filterButtons.length) applyFilter('all');

  // Searchable keyboard navigation palette, no dependencies or tracking.
  const dialog = $('#command-palette');
  const search = $('#command-search');
  const commandItems = $$('.command-item', dialog || document);
  const empty = $('#command-empty');
  const opener = $('#command-trigger');
  const closer = $('#command-close');
  let previousFocus = null;
  function findCommands() {
    if (!search) return;
    const value = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    commandItems.forEach(item => {
      const matches = (item.textContent || '').toLocaleLowerCase().includes(value);
      item.hidden = !matches;
      if (matches) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
  }
  function openPalette() {
    if (!dialog || !('showModal' in dialog) || dialog.open) return;
    previousFocus = document.activeElement;
    dialog.showModal();
    if (search) {
      search.value = '';
      findCommands();
      search.focus();
    }
  }
  function closePalette() { if (dialog && dialog.open) dialog.close(); }
  if (opener) opener.addEventListener('click', openPalette);
  if (closer) closer.addEventListener('click', closePalette);
  if (search) search.addEventListener('input', findCommands);
  commandItems.forEach(item => item.addEventListener('click', () => {
    closePalette();
  }));
  if (dialog) {
    dialog.addEventListener('close', () => {
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) closePalette();
    });
  }
  document.addEventListener('keydown', event => {
    const element = event.target;
    const typing = element instanceof HTMLElement && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog && dialog.open) closePalette(); else openPalette();
    } else if (event.key === '/' && !typing && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault(); openPalette();
    } else if (event.key === 'Escape') closeMobile();
  });

  // Fine pointer-only ambient interaction. Never block keyboard or touch.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (finePointer.matches && !reduceMotion.matches) {
    $$('.card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', (event.clientX - bounds.left) + 'px');
        card.style.setProperty('--spot-y', (event.clientY - bounds.top) + 'px');
      }, { passive: true });
    });
    $$('.hero-actions .button').forEach(button => {
      button.addEventListener('pointermove', event => {
        const bounds = button.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
        const y = ((event.clientY - bounds.top) / bounds.height - .5) * 7;
        button.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      }, { passive: true });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; }, { passive: true });
      button.addEventListener('blur', () => { button.style.transform = ''; });
    });
  }

  // GitHub Pages has no backend: read a PUBLIC GitHub profile with bounded cache and timeout.
  const repoStat = $('[data-github-stat="repos"]');
  const followersStat = $('[data-github-stat="followers"]');
  const status = $('#github-data-status');
  const CACHE_KEY = 'kingez-public-github-v2';
  const FRESH_MS = 10 * 60 * 1000;
  function showProfile(data, label) {
    if (!data || !Number.isFinite(data.public_repos) || !Number.isFinite(data.followers)) return false;
    if (repoStat) repoStat.textContent = data.public_repos.toLocaleString();
    if (followersStat) followersStat.textContent = data.followers.toLocaleString();
    if (status) status.textContent = label;
    return true;
  }
  let cached = null;
  try {
    const entry = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (entry && entry.data && typeof entry.time === 'number') cached = entry;
  } catch (_) { /* Restricted storage must never break the portfolio. */ }
  if (cached) showProfile(cached.data, 'Showing previously fetched public GitHub numbers.');
  if (!cached || Date.now() - cached.time > FRESH_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5500);
    fetch('https://api.github.com/users/kayden-pixel', {
      headers: { 'Accept': 'application/vnd.github+json' },
      signal: controller.signal
    }).then(response => {
      if (!response.ok) throw new Error('GitHub profile unavailable');
      return response.json();
    }).then(data => {
      const profile = { public_repos: data.public_repos, followers: data.followers };
      if (!showProfile(profile, 'Live public GitHub profile data; updates may be cached for 10 minutes.')) throw new Error('Unexpected GitHub response');
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: profile })); } catch (_) {}
    }).catch(() => {
      if (!cached && status) status.textContent = 'GitHub numbers are temporarily unavailable. The site still works offline.';
    }).finally(() => clearTimeout(timeout));
  }
})();
