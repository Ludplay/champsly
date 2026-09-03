import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/use-auth';

type ProtectedRouteProps = {
  children: ReactNode;
  onLoginClick: () => void;
};

export function ProtectedRoute({ children, onLoginClick }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-700">
          <p className="text-sm">You need to be logged in to view this page.</p>
          <Button className="mt-4" onClick={onLoginClick}>
            Go to login
          </Button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
