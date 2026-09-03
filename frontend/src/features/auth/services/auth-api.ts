import apiClient from '@/lib/api-client';
import type { AuthResult, RegisterInput, LoginInput, User } from '../types/auth';

export async function register(input: RegisterInput): Promise<AuthResult> {
  const response = await apiClient.post<AuthResult>('/auth/register', input);
  return response.data;
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const response = await apiClient.post<AuthResult>('/auth/login', input);
  return response.data;
}

export async function verifyEmail(token: string): Promise<{ user: User }> {
  const response = await apiClient.post<{ user: User }>('/auth/verify-email', { token });
  return response.data;
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification', { email });
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
