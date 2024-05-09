export interface AccessToken {
  token: string;
  expiresAt: number; // Unix timestamp
}
export interface AuthState {
  accessToken?: AccessToken;
  loggedIn: boolean;
}

export type { AuthActions } from './actions';
