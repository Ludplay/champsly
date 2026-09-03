import axios from 'axios';

import { getAccessToken, setAccessToken, clearSession } from '@/features/auth/token-store';

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

// De-dupes concurrent 401s into a single /auth/refresh call.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(
        '/auth/refresh',
        null,
        { baseURL: apiClient.defaults.baseURL, withCredentials: true },
      )
      .then((response) => {
        const token = response.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
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
