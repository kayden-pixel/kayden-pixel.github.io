export const STORAGE_KEY = 'kingez-intro-seen-v1';
export const INTRO_DURATION_MS = 3400;
export function wantsIntro(storage, reducedMotion) {
  if (reducedMotion || !storage || typeof storage.getItem !== 'function') return false;
  try { return storage.getItem(STORAGE_KEY) !== '1'; } catch (_) { return false; }
}
export function markIntroSeen(storage) {
  if (!storage || typeof storage.setItem !== 'function') return false;
  try { storage.setItem(STORAGE_KEY, '1'); return true; } catch (_) { return false; }
}
