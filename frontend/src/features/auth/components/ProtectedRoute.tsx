import type { ReactNode } from 'react';

import LoginPage from '../pages/LoginPage';
import { useAuth } from '../hooks/use-auth';

type ProtectedRouteProps = {
  children: ReactNode;
};

// No router to redirect with, so an unauthenticated visit renders the login
// page in place; once login succeeds, the requested page renders instead.
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
