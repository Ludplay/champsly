import { useState } from 'react';
import axios from 'axios';

import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../hooks/use-auth';
import { register as registerRequest } from '../services/auth-api';
import type { RegisterInput } from '../types/auth';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && typeof err.response?.data?.error === 'string') {
    return err.response.data.error;
  }
  return fallback;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'form' | 'check-email'>('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleRegister = async (input: RegisterInput) => {
    setLoading(true);
    setFormError(null);

    try {
      const result = await registerRequest(input);
      login(result.user, result.accessToken);
      setRegisteredEmail(result.user.email);
      setMode('check-email');
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Champsly</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Create an account</h1>

        {mode === 'check-email' ? (
          <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>You're in — {registeredEmail} is now logged in.</p>
            <p>We've also sent a verification link to that address. Check your email whenever you get a chance.</p>
          </div>
        ) : (
          <div className="mt-6">
            <RegisterForm
              submitLabel={loading ? 'Creating account…' : 'Create account'}
              error={formError}
              disabled={loading}
              onSubmit={handleRegister}
            />
          </div>
        )}
      </div>
    </main>
  );
}
