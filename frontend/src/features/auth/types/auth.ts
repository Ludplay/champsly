// Mirrors the `user` shape returned by the backend's register/login/refresh
// endpoints (backend/src/interactors/auth/*.bs.ts).

export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  accessTokenExpiresAt: string;
}
