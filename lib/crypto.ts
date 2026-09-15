// Client-side only. Encrypts/decrypts password-vault secrets using a master
// passphrase the user chooses themselves, via PBKDF2 key derivation + AES-GCM
// (Web Crypto API). The passphrase is never sent to or stored on the
// server — only the resulting ciphertext, salt, and IV are persisted in
// Supabase. There is no passphrase-recovery mechanism: if it's forgotten,
// the stored secrets cannot be decrypted again. This is a deliberate
// trade-off for keeping the vault genuinely private.

const PBKDF2_ITERATIONS = 300_000;

function toBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface VaultSecret {
  password: string;
  notes: string;
}

export async function encryptSecret(
  passphrase: string,
  data: VaultSecret
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(JSON.stringify(data))
  );
  return {
    ciphertext: toBase64(ciphertextBuf),
    iv: toBase64(iv.buffer as ArrayBuffer),
    salt: toBase64(salt.buffer as ArrayBuffer),
  };
}

// Throws if the passphrase is wrong or the data is corrupted (AES-GCM's
// built-in authentication tag check fails).
export async function decryptSecret(
  passphrase: string,
  payload: EncryptedPayload
): Promise<VaultSecret> {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const key = await deriveKey(passphrase, salt);
  const ciphertext = fromBase64(payload.ciphertext);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plainBuf)) as VaultSecret;
}
