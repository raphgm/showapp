// ─── Secure Vault Service ─────────────────────────────────────────────
// Real encryption at rest (AES-256-GCM via Web Crypto API) and
// Firebase Realtime Database auto-sync for capture metadata.
//
// Architecture:
// • Captures are encrypted with AES-256-GCM before writing to localStorage.
// • A per-user encryption key is derived from the UID + a salt using PBKDF2.
// • Capture metadata (id, type, createdAt, title) is synced to Firebase RTDB.
// • Capture image data (base64 URLs) stays local — too large for RTDB limits.
// • On login, cloud metadata merges with local encrypted data for consistency.

import {
  getDatabase,
  ref,
  set,
  onValue,
  off,
  remove,
} from 'firebase/database';
import type { Capture } from '../types';

// ─── Encryption Constants ─────────────────────────────────────────────

const VAULT_SALT = 'ShowApp-SecureVault-2025';
const VAULT_IV_LENGTH = 12; // 96-bit IV for AES-GCM
const VAULT_KEY_ITERATIONS = 100_000;
const VAULT_PREFIX = 'vault';

// ─── Key Derivation ───────────────────────────────────────────────────

/** Derive a 256-bit AES-GCM key from user UID using PBKDF2. */
async function deriveKey(uid: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(uid),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(VAULT_SALT),
      iterations: VAULT_KEY_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ─── Encryption / Decryption ──────────────────────────────────────────

/** Encrypt a string with AES-256-GCM. Returns base64(iv + ciphertext). */
export async function encryptData(plaintext: string, uid: string): Promise<string> {
  const key = await deriveKey(uid);
  const iv = crypto.getRandomValues(new Uint8Array(VAULT_IV_LENGTH));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );

  // Combine IV + ciphertext into a single buffer
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Encode as base64 for safe localStorage storage
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt base64(iv + ciphertext) back to plaintext. */
export async function decryptData(encrypted: string, uid: string): Promise<string> {
  const key = await deriveKey(uid);

  // Decode base64
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  // Split IV and ciphertext
  const iv = combined.slice(0, VAULT_IV_LENGTH);
  const ciphertext = combined.slice(VAULT_IV_LENGTH);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}

// ─── Encrypted Persistence ───────────────────────────────────────────

function vaultKey(uid: string, namespace: string): string {
  return `${VAULT_PREFIX}:${uid}:${namespace}`;
}

/** Save data encrypted to localStorage. */
export async function vaultSave<T>(uid: string, namespace: string, data: T): Promise<void> {
  try {
    const json = JSON.stringify(data);
    const encrypted = await encryptData(json, uid);
    localStorage.setItem(vaultKey(uid, namespace), encrypted);
  } catch (e) {
    console.error('[Vault] Encryption/save failed:', e);
  }
}

/** Load and decrypt data from localStorage. */
export async function vaultLoad<T>(uid: string, namespace: string): Promise<T | null> {
  try {
    const encrypted = localStorage.getItem(vaultKey(uid, namespace));
    if (!encrypted) return null;
    const json = await decryptData(encrypted, uid);
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('[Vault] Decrypt/load failed:', e);
    return null;
  }
}

/** Remove encrypted data from localStorage. */
export function vaultRemove(uid: string, namespace: string): void {
  try {
    localStorage.removeItem(vaultKey(uid, namespace));
  } catch {
    // ignore
  }
}

// ─── Encrypted Capture Helpers ────────────────────────────────────────

const CAPTURES_NS = 'captures';

/** Save captures encrypted to localStorage. */
export async function vaultSaveCaptures(uid: string, captures: Capture[]): Promise<void> {
  await vaultSave(uid, CAPTURES_NS, captures);
}

/** Load captures from encrypted localStorage. */
export async function vaultLoadCaptures(uid: string): Promise<Capture[]> {
  return (await vaultLoad<Capture[]>(uid, CAPTURES_NS)) ?? [];
}

// ─── Firebase Cloud Sync ──────────────────────────────────────────────
//
// Only metadata is synced (id, type, createdAt, title).
// Image data URIs are too large for RTDB (max ~10 MB per write).

export interface CaptureMetadata {
  id: string;
  type: string;
  createdAt: string;
  title?: string;
}

function captureToMetadata(capture: Capture): CaptureMetadata {
  return {
    id: capture.id,
    type: capture.type,
    createdAt: capture.createdAt,
    ...(capture.title ? { title: capture.title } : {}),
  };
}

/** Push capture metadata array to Firebase RTDB. */
export async function syncCapturesToCloud(uid: string, captures: Capture[]): Promise<void> {
  try {
    const db = getDatabase();
    const metadataList = captures.map(captureToMetadata);
    await set(ref(db, `users/${uid}/vault/captures`), metadataList);
  } catch (e) {
    console.error('[Vault] Cloud sync failed:', e);
  }
}

/** One-time fetch of capture metadata from Firebase RTDB. */
export async function loadCapturesFromCloud(uid: string): Promise<CaptureMetadata[]> {
  return new Promise((resolve) => {
    const db = getDatabase();
    const capturesRef = ref(db, `users/${uid}/vault/captures`);
    onValue(
      capturesRef,
      (snapshot) => {
        off(capturesRef);
        const data = snapshot.val();
        resolve(data ? (Array.isArray(data) ? data : Object.values(data)) : []);
      },
      () => {
        off(capturesRef);
        resolve([]);
      },
    );
  });
}

/** Subscribe to real-time capture metadata changes from Firebase. */
export function subscribeToCaptureSync(
  uid: string,
  callback: (metadata: CaptureMetadata[]) => void,
): () => void {
  const db = getDatabase();
  const capturesRef = ref(db, `users/${uid}/vault/captures`);

  onValue(capturesRef, (snapshot) => {
    const data = snapshot.val();
    const list: CaptureMetadata[] = data
      ? (Array.isArray(data) ? data : Object.values(data))
      : [];
    callback(list);
  });

  // Return unsubscribe function
  return () => off(capturesRef);
}

/** Delete all vault data from Firebase for a user. */
export async function clearCloudVault(uid: string): Promise<void> {
  try {
    const db = getDatabase();
    await remove(ref(db, `users/${uid}/vault`));
  } catch (e) {
    console.error('[Vault] Cloud vault clear failed:', e);
  }
}

// ─── Vault Status ─────────────────────────────────────────────────────

export interface VaultStatus {
  encrypted: boolean;
  synced: boolean;
  lastSyncedAt: string | null;
  captureCount: number;
}

/** Save vault status metadata to Firebase. */
export async function updateVaultStatus(uid: string, status: Partial<VaultStatus>): Promise<void> {
  try {
    const db = getDatabase();
    await set(ref(db, `users/${uid}/vault/status`), {
      ...status,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Vault] Status update failed:', e);
  }
}

/** Subscribe to vault status from Firebase. */
export function subscribeToVaultStatus(
  uid: string,
  callback: (status: VaultStatus | null) => void,
): () => void {
  const db = getDatabase();
  const statusRef = ref(db, `users/${uid}/vault/status`);

  onValue(statusRef, (snapshot) => {
    callback(snapshot.val() as VaultStatus | null);
  });

  return () => off(statusRef);
}

// ─── Migration Helper ─────────────────────────────────────────────────
// Migrate unencrypted captures from old persistence to encrypted vault.

export async function migrateToVault(uid: string): Promise<Capture[]> {
  // Check for old unencrypted captures
  const oldKey = `show:${uid}:captures`;
  const raw = localStorage.getItem(oldKey);
  if (!raw) return [];

  try {
    const captures = JSON.parse(raw) as Capture[];
    if (captures.length > 0) {
      // Save encrypted
      await vaultSaveCaptures(uid, captures);
      // Sync metadata to cloud
      await syncCapturesToCloud(uid, captures);
      // Remove old unencrypted data
      localStorage.removeItem(oldKey);
      // Update vault status
      await updateVaultStatus(uid, {
        encrypted: true,
        synced: true,
        lastSyncedAt: new Date().toISOString(),
        captureCount: captures.length,
      });
      console.log(`[Vault] Migrated ${captures.length} captures to encrypted storage`);
    }
    return captures;
  } catch {
    return [];
  }
}
