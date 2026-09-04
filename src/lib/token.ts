const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Unique QR token embedded in the QR code / verify URL, e.g. RP-8F3K2D9Q */
export function generateQrToken(): string {
  return `RP-${randomSegment(8)}`;
}

/** Human-typed professional card number, e.g. 738041562 */
export function generateCardNumber(): string {
  let out = "";
  for (let i = 0; i < 9; i++) {
    out += Math.floor(Math.random() * 10);
  }
  return out;
}
