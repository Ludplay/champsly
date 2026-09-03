import { useState } from 'react';
import axios from 'axios';

import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/use-auth';
import { login as loginRequest } from '../services/auth-api';
import type { LoginInput } from '../types/auth';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && typeof err.response?.data?.error === 'string') {
    return err.response.data.error;
  }
  return fallback;
}

export default function LoginPage() {
  const { user, isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (input: LoginInput) => {
    setLoading(true);
    setFormError(null);

    try {
      const result = await loginRequest(input);
      login(result.user, result.accessToken);
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not log in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Champsly</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Log in</h1>

        {isAuthenticated ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Logged in as {user?.name}. Switch tabs above to continue.
          </div>
        ) : (
          <div className="mt-6">
            <LoginForm
              submitLabel={loading ? 'Logging in…' : 'Log in'}
              error={formError}
              disabled={loading}
              onSubmit={handleLogin}
            />
          </div>
        )}
      </div>
    </main>
  );
}
