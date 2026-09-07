// Passphrase hashing for the admin gate, using Web Crypto PBKDF2-SHA256.
// This protects against casual access on a shared device only; see docs/compliance.md.

const ITERATIONS = 100000;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function derive(passphrase, saltBytes, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations }, key, 256);
  return toHex(bits);
}

export async function hashPassphrase(passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(passphrase, salt, ITERATIONS);
  return { salt: toHex(salt), hash, iterations: ITERATIONS };
}

export async function verifyPassphrase(passphrase, record) {
  if (!record || !record.salt || !record.hash) return false;
  const hash = await derive(passphrase, fromHex(record.salt), record.iterations || ITERATIONS);
  if (hash.length !== record.hash.length) return false;
  // constant-time compare
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ record.hash.charCodeAt(i);
  return diff === 0;
}
