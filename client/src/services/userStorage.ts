const PROFILE_KEY = 'connecto_profile';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface UserProfile {
  name: string;
  role: string;
  contact: string;
  tags: string[];
}

interface StoredSession {
  profile?: UserProfile | null;
  userId?: string | null;
  eventId?: string | null;
  sessionTimestamp?: number;
}

function readSession(): StoredSession | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

// ── Profile CRUD ───────────────────────────────────────────────────────────────

export const saveProfile = (profile: UserProfile) => {
  const s = readSession() ?? {};
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    ...s,
    profile,
    sessionTimestamp: Date.now(),
  }));
};

export const loadProfile = (): UserProfile | null => {
  return readSession()?.profile ?? null;
};

// ── User / Event helpers ───────────────────────────────────────────────────────

export const saveUserId = (userId: string) => {
  const s = readSession() ?? {};
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    ...s,
    userId,
    sessionTimestamp: Date.now(),
  }));
};

export const loadUserId = (): string | null => {
  return readSession()?.userId ?? localStorage.getItem('currentUserId');
};

export const saveEventId = (eventId: string) => {
  const s = readSession() ?? {};
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    ...s,
    eventId,
    sessionTimestamp: Date.now(),
  }));
};

export const loadEventId = (): string | null => {
  return readSession()?.eventId ?? localStorage.getItem('currentEventId');
};

// ── Session management ─────────────────────────────────────────────────────────

export const isSessionExpired = (): boolean => {
  const s = readSession();
  if (!s || typeof s.sessionTimestamp !== 'number') return true;
  return Date.now() - s.sessionTimestamp > SESSION_TTL_MS;
};

export const restoreSession = (): void => {
  if (isSessionExpired()) return;
  const s = readSession();
  if (s?.userId)  localStorage.setItem('currentUserId',  s.userId);
  if (s?.eventId) localStorage.setItem('currentEventId', s.eventId);
};

export const clearProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem('currentUserId');
  localStorage.removeItem('currentEventId');
};
