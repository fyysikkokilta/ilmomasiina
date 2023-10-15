export interface AuthState {
  accessToken?: string;
  accessTokenExpires?: string;
  loggedIn: boolean;
}

export type { AuthActions } from './actions';
