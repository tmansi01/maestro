/**
 * Runtime platform detection helpers.
 * Visual designs remain 100% identical across Chrome on MacBook, Google Chromebook, and Amazon Fire Tablet.
 * Any Fire Tablet workarounds (e.g., bumper-case safe padding or Silk TTS non-blocking fallback)
 * are strictly gated behind `isFireTablet()`.
 */

export function isFireTablet(userAgent?: string): boolean {
  const ua =
    userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  // Amazon Fire tablets identify via "Silk/" browser or "AFT" model codes (AFTM, AFTT, KFONWI, etc.)
  return /\b(Silk|AFT[A-Z0-9]+|KF[A-Z0-9]+|Kindle Fire)\b/i.test(ua);
}

export function isChromebook(userAgent?: string): boolean {
  const ua =
    userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /\bCrOS\b/i.test(ua);
}

export function getPlatformLabel(): 'fire-tablet' | 'chromebook' | 'mac-or-desktop' {
  if (isFireTablet()) return 'fire-tablet';
  if (isChromebook()) return 'chromebook';
  return 'mac-or-desktop';
}
