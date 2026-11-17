import { STORAGE_KEY, INTRO_DURATION_MS, wantsIntro, markIntroSeen } from './welcome-logic.mjs';

/* First-visit cinematic boot sequence. User-controlled, accessible, entirely local. */
(() => {
  'use strict';
  const modal = document.getElementById('welcome-intro');
  const skip = document.getElementById('welcome-skip');
  const enter = document.getElementById('welcome-enter');
  const replay = document.getElementById('welcome-replay');
  const status = document.getElementById('welcome-status');
  if (!modal || !skip || !enter) return;

  const storage = (() => { try { return window.localStorage; } catch (_) { return null; } })();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const guarded = [document.querySelector('#nav'), document.querySelector('main'),
    document.querySelector('footer'), document.querySelector('#know-trigger'),
    document.querySelector('#know-panel'), document.querySelector('.skip-link')].filter(Boolean);
  let active = false;
  let lastFocus = null;
  let timer = null;
  let stageTimer = null;
  const focusable = () => [skip, enter].filter(button => !button.disabled && !button.hidden);

  function hideIntro() {
    if (!active) return;
    active = false;
    window.clearTimeout(timer);
    window.clearTimeout(stageTimer);
    modal.classList.remove('is-playing');
    modal.hidden = true;
    document.body.classList.remove('welcome-active');
    guarded.forEach(node => { node.inert = false; });
    document.removeEventListener('keydown', trapKeys, true);
    if (lastFocus instanceof HTMLElement && lastFocus.isConnected) lastFocus.focus();
    else document.querySelector('.brand')?.focus();
  }

  function trapKeys(event) {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); hideIntro(); return; }
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  function showIntro(replayed = false) {
    if (active) return;
    lastFocus = document.activeElement;
    markIntroSeen(storage);
    active = true;
    guarded.forEach(node => { node.inert = true; });
    document.body.classList.add('welcome-active');
    modal.hidden = false;
    if (status) status.textContent = replayed ? 'REINITIALIZING PUBLIC INTERFACE' : 'BOOTING PUBLIC INTERFACE';
    modal.classList.remove('is-playing');
    // The forced layout restart is only used on deliberate Replay intro.
    if (replayed) void modal.offsetWidth;
    if (!reduced) modal.classList.add('is-playing');
    document.addEventListener('keydown', trapKeys, true);
    skip.focus({ preventScroll: true });
    if (!reduced) {
      stageTimer = window.setTimeout(() => {
        if (active && status) status.textContent = 'SYSTEM READY · ACCESS GRANTED';
      }, 2100);
      timer = window.setTimeout(hideIntro, INTRO_DURATION_MS);
    } else if (status) status.textContent = 'SYSTEM READY · ACCESS GRANTED';
  }

  skip.addEventListener('click', hideIntro);
  enter.addEventListener('click', hideIntro);
  replay?.addEventListener('click', () => showIntro(true));
  if (wantsIntro(storage, reduced)) showIntro(false);

  // This key is a non-identifying local device flag only; it is never uploaded.
  // A failed or blocked browser storage API fails open to the regular portfolio.
  void STORAGE_KEY;
})();
