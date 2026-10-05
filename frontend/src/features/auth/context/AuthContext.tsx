import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

import type { User } from '../types/auth';
import { getAccessToken, getCurrentUser, setSession, clearSession, subscribe } from '../token-store';
import { logout as logoutRequest } from '../services/auth-api';
import { restoreSession } from '@/lib/api-client';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getCurrentUser);
  const accessToken = useSyncExternalStore(subscribe, getAccessToken);
  const [isRestoring, setIsRestoring] = useState(true);

  // StrictMode runs this twice in dev; restoreSession shares one in-flight refresh,
  // so both runs await the same request instead of rotating the token twice.
  useEffect(() => {
    restoreSession().finally(() => setIsRestoring(false));
  }, []);

  const login = (user: User, accessToken: string) => {
    setSession(user, accessToken);
  };

  // Best-effort: revoke the refresh token server-side, but clear local state
  // regardless of whether that call succeeds.
  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  };

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: user !== null && accessToken !== null,
    isRestoring,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
