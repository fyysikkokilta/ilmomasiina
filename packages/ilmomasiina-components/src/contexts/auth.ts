import { createContext } from 'react';

export interface AuthState {
  loggedIn: boolean;
}

const AuthContext = createContext<AuthState>({
  loggedIn: false,
});

export default AuthContext;
