import { useEffect, useState } from 'react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyEmail, resendVerification } from '../services/auth-api';

type VerifyState = 'verifying' | 'success' | 'error' | 'no-token';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && typeof err.response?.data?.error === 'string') {
    return err.response.data.error;
  }
  return fallback;
}

export default function VerifyEmailPage() {
  // Read once, synchronously, via lazy initializers — no effect needed just to
  // know whether a token is present.
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token'));
  const [state, setState] = useState<VerifyState>(() => (token ? 'verifying' : 'no-token'));
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setVerifyError(extractErrorMessage(err, 'This verification link is invalid or has expired.'));
        setState('error');
      });
  }, [token]);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResendLoading(true);
    setResendMessage(null);

    try {
      await resendVerification(resendEmail.trim());
      setResendMessage('If that email is pending verification, a new link has been sent.');
    } catch {
      setResendMessage('Could not send a new link right now. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Champsly</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Verify your email</h1>

        {state === 'verifying' ? (
          <p className="mt-6 text-sm text-slate-500">Verifying…</p>
        ) : null}

        {state === 'success' ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Your email is verified.
          </div>
        ) : null}

        {(state === 'error' || state === 'no-token') ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-destructive">
              {state === 'no-token' ? 'No verification token found in this link.' : verifyError}
            </p>

            <form onSubmit={handleResend} className="space-y-2 border-t border-slate-200 pt-4">
              <label className="block text-sm font-medium text-slate-700">Resend verification email</label>
              <Input
                type="email"
                value={resendEmail}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setResendEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={resendLoading}
                required
              />
              <Button type="submit" disabled={resendLoading || !resendEmail.trim()}>
                {resendLoading ? 'Sending…' : 'Resend link'}
              </Button>
              {resendMessage ? <p className="text-sm text-slate-600">{resendMessage}</p> : null}
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}
