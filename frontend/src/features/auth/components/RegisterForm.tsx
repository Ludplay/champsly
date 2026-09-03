import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { RegisterInput } from '../types/auth';

type RegisterFormProps = {
  submitLabel: string;
  error?: string | null;
  disabled?: boolean;
  onSubmit: (input: RegisterInput) => void | Promise<void>;
};

export function RegisterForm({ submitLabel, error, disabled = false, onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <Input
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          placeholder="Enter your name"
          disabled={disabled}
          required
        />
      </div>

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
          placeholder="At least 8 characters"
          disabled={disabled}
          required
        />
        <p className="text-xs text-slate-500">
          At least 8 characters, with an uppercase letter, a lowercase letter, and a digit.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !name.trim() || !email.trim() || !password}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
