import axios from 'axios';

import { getAccessToken, setSession, clearSession } from '@/features/auth/token-store';
import type { User } from '@/features/auth/types/auth';

// The one shared axios instance every feature's *-api.ts file uses, so the
// interceptor logic below only has to exist once instead of once per feature.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach the current access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type RefreshResponse = {
  user: User;
  accessToken: string;
};

// De-dupes concurrent refreshes (parallel 401s, the startup restore) into a single
// /auth/refresh call. That matters beyond saving a request: refresh tokens rotate,
// and the backend treats a second use of the same token as theft and revokes the
// whole chain — so two concurrent calls would log the user out.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>(
        '/auth/refresh',
        null,
        { baseURL: apiClient.defaults.baseURL, withCredentials: true },
      )
      .then((response) => {
        const { user, accessToken } = response.data;
        setSession(user, accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// The session lives in memory only, so a page load starts logged out; this trades
// the httpOnly refresh cookie for a fresh session. Resolves false when there's no
// valid cookie (never logged in, logged out, expired) — that's not an error.
export async function restoreSession(): Promise<boolean> {
  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
}

// On a 401, refresh once and retry. A 401 on /auth/* itself is never retried
// (that would loop) — it clears the session instead.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && isAuthRoute) {
      clearSession();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
