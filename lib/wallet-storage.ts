/**
 * Wojakcoin Wallet Storage — 100% Local Storage (Client-Side Only)
 *
 * All wallet data lives exclusively in the user's browser localStorage.
 * Nothing is ever sent to or stored on any server.
 *
 * WIF is encrypted with AES-GCM (PBKDF2 key derivation).
 * When crypto.subtle is available: uses Web Crypto API.
 * When blocked (e.g. SES/wallet extensions): uses @noble/ciphers + @noble/hashes fallback.
 */

import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { gcm } from "@noble/ciphers/aes.js";
import { randomBytes } from "@noble/ciphers/utils.js";

const STORAGE_KEY = "wojak_wallet";
const PBKDF2_ITERATIONS = 100_000;
const SALT_LEN = 16;
const IV_LEN = 12;

function hasWebCrypto(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { crypto?: { subtle?: unknown } };
  return !!w.crypto?.subtle;
}

async function deriveKeyWebCrypto(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function deriveKeyNoble(password: string, salt: Uint8Array): Uint8Array {
  const enc = new TextEncoder();
  return pbkdf2(sha256, enc.encode(password), salt, {
    c: PBKDF2_ITERATIONS,
    dkLen: 32,
  });
}

export async function saveWallet(wif: string, password: string): Promise<void> {
  if (typeof window === "undefined") return;

  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const plainBytes = new TextEncoder().encode(wif);

  if (hasWebCrypto()) {
    try {
      const key = await deriveKeyWebCrypto(password, salt);
      const ct = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv as unknown as BufferSource, tagLength: 128 },
        key,
        plainBytes
      );
      const payload = {
        s: [...salt],
        i: [...iv],
        c: [...new Uint8Array(ct)],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return;
    } catch {
      /* fall through to noble */
    }
  }

  const key = deriveKeyNoble(password, salt);
  const cipher = gcm(key, iv);
  const ct = cipher.encrypt(plainBytes);
  const payload = {
    s: [...salt],
    i: [...iv],
    c: [...ct],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function loadWallet(password: string): Promise<string> {
  const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (!raw) throw new Error("No wallet found");

  const parsed = JSON.parse(raw) as { p?: number; w?: string; s?: number[]; i?: number[]; c?: number[] };

  if (parsed.p === 1 && typeof parsed.w === "string") {
    return decodeURIComponent(escape(atob(parsed.w)));
  }

  const { s, i, c } = parsed;
  if (!s || !i || !c) throw new Error("Invalid wallet data");

  const salt = new Uint8Array(s);
  const iv = new Uint8Array(i);
  const ciphertext = new Uint8Array(c);

  if (hasWebCrypto()) {
    try {
      const key = await deriveKeyWebCrypto(password, salt);
      const dec = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as unknown as BufferSource, tagLength: 128 },
        key,
        ciphertext
      );
      return new TextDecoder().decode(dec);
    } catch {
      /* fall through to noble */
    }
  }

  const key = deriveKeyNoble(password, salt);
  const cipher = gcm(key, iv);
  const plainBytes = cipher.decrypt(ciphertext);
  return new TextDecoder().decode(plainBytes);
}

export function hasWallet(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem(STORAGE_KEY);
}

export function deleteWallet(): void {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

/** Storage is always client-side localStorage; never on server */
export const STORAGE_BACKEND = "localStorage" as const;

/** True if stored wallet is encrypted; false if plain (crypto.subtle was unavailable) */
export function isWalletEncrypted(): boolean {
  const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (!raw) return true;
  try {
    const p = JSON.parse(raw) as { p?: number };
    return p.p !== 1;
  } catch {
    return true;
  }
}
