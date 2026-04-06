
// ─── Persistence Service ──────────────────────────────────────────────
// localStorage-based persistence scoped to Firebase user UID.
// All data is stored as JSON under keys like `show:<uid>:<namespace>`.

const PREFIX = 'show';

function key(uid: string, namespace: string): string {
  return `${PREFIX}:${uid}:${namespace}`;
}

// ─── Generic helpers ──────────────────────────────────────────────────

export function save<T>(uid: string, namespace: string, data: T): void {
  try {
    localStorage.setItem(key(uid, namespace), JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function load<T>(uid: string, namespace: string): T | null {
  try {
    const raw = localStorage.getItem(key(uid, namespace));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function remove(uid: string, namespace: string): void {
  try {
    localStorage.removeItem(key(uid, namespace));
  } catch {
    // ignore
  }
}

// ─── Namespace constants ──────────────────────────────────────────────

export const NS = {
  VIDEOS: 'videos',
  CAPTURES: 'captures',
  SNIPPETS: 'snippets',
  USER_PROFILE: 'userProfile',
  WORKSPACE: 'workspace',
  ROUTE: 'route',
  SETTINGS: 'settings',
  SCHEDULED_SNAPS: 'scheduledSnaps',
  SCHEDULED_STREAMS: 'scheduledStreams',
  SNAP_CHECKLIST: 'snapChecklist',
  STREAM_CHECKLIST: 'streamChecklist',
} as const;

// ─── Convenience wrappers ─────────────────────────────────────────────

import type { Video, Capture, CodeSnippet, UserProfile, Workspace } from '../types';

export const saveVideos = (uid: string, videos: Video[]) => save(uid, NS.VIDEOS, videos);
export const loadVideos = (uid: string): Video[] => load<Video[]>(uid, NS.VIDEOS) ?? [];

export const saveCaptures = (uid: string, captures: Capture[]) => save(uid, NS.CAPTURES, captures);
export const loadCaptures = (uid: string): Capture[] => load<Capture[]>(uid, NS.CAPTURES) ?? [];

export const saveSnippets = (uid: string, snippets: CodeSnippet[]) => save(uid, NS.SNIPPETS, snippets);
export const loadSnippets = (uid: string): CodeSnippet[] => load<CodeSnippet[]>(uid, NS.SNIPPETS) ?? [];

export const saveUserProfile = (uid: string, profile: UserProfile) => save(uid, NS.USER_PROFILE, profile);
export const loadUserProfile = (uid: string): UserProfile | null => load<UserProfile>(uid, NS.USER_PROFILE);

export const saveWorkspace = (uid: string, ws: Workspace) => save(uid, NS.WORKSPACE, ws);
export const loadWorkspace = (uid: string): Workspace | null => load<Workspace>(uid, NS.WORKSPACE);

export const saveRoute = (uid: string, route: string) => save(uid, NS.ROUTE, route);
export const loadRoute = (uid: string): string | null => load<string>(uid, NS.ROUTE);
