import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LoginInput } from '../types/auth';

type LoginFormProps = {
  submitLabel: string;
  error?: string | null;
  disabled?: boolean;
  onSubmit: (input: LoginInput) => void | Promise<void>;
};

export function LoginForm({ submitLabel, error, disabled = false, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          placeholder="you@example.com"
          disabled={disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          placeholder="Your password"
          disabled={disabled}
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !email.trim() || !password}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
