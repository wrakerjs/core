/**
 * Generate a random uuid v4
 *
 * @returns {string} uuid
 *
 * @see https://stackoverflow.com/a/2117523/12828306
 * @license "CC BY-SA 4.0"
 */

export function uuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}
