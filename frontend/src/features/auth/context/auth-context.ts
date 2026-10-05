import { createContext } from 'react';

import type { User } from '../types/auth';

export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // True until the startup session restore settles; don't treat the user as logged out before then.
  isRestoring: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
