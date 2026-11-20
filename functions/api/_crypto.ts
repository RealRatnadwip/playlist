/**
 * Web Crypto API utilities for Cloudflare Edge runtime
 * Zero-dependency password hashing, AES-GCM encryption, and token generation
 */

// Buffer to Hex converter
export function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Hex to Buffer converter
export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Constant-time string comparison to prevent timing attacks
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Generate random secure token string
export function generateRandomToken(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}

// Compute SHA-256 hash of a token
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hash);
}

// PBKDF2 Password Hashing
export async function hashPassword(password: string, providedSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = providedSalt || generateRandomToken(16);
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return {
    hash: bufferToHex(derivedKey),
    salt,
  };
}

// Verify PBKDF2 Password
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqual(hash, storedHash);
}

// Key derivation for AES-GCM from secret string
async function getAesGcmKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

// AES-256-GCM encryption
export async function encryptData(plainText: string, secretKey: string): Promise<string> {
  const key = await getAesGcmKey(secretKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );

  const ivHex = bufferToHex(iv.buffer);
  const encryptedHex = bufferToHex(encrypted);
  return `${ivHex}:${encryptedHex}`;
}

// AES-256-GCM decryption
export async function decryptData(encryptedString: string, secretKey: string): Promise<string> {
  const [ivHex, encryptedHex] = encryptedString.split(':');
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted string format');

  const key = await getAesGcmKey(secretKey);
  const iv = hexToBuffer(ivHex);
  const data = hexToBuffer(encryptedHex);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

