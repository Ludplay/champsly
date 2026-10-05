import type { User } from './types/auth';

// Plain (non-React) module holding the current access token + user in memory
// only — never localStorage/sessionStorage, so an XSS payload can only read the
// token during a live execution, not pull it out of persistent storage later.
// It's the single source of truth for both the axios interceptors (which run
// outside React's render cycle and need synchronous access) and AuthContext
// (which wraps it for components via useSyncExternalStore).

let accessToken: string | null = null;
let currentUser: User | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function setSession(user: User, token: string): void {
  currentUser = user;
  accessToken = token;
  notify();
}

export function clearSession(): void {
  currentUser = null;
  accessToken = null;
  notify();
}
