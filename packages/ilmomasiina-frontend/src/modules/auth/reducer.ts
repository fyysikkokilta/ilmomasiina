import { LOGIN_SUCCEEDED, RESET } from './actionTypes';
import type { AuthActions, AuthState } from './types';

const initialState: AuthState = {
  accessToken: undefined,
  loggedIn: false,
};

function getTokenExpiry(jwt: string): number {
  const parts = jwt.split('.');

  try {
    const payload = JSON.parse(window.atob(parts[1]));

    if (payload.exp) {
      return payload.exp * 1000;
    }
  } catch {
    // eslint-disable-next-line no-console
    console.error('Invalid jwt token received!');
  }

  return 0;
}

export default function reducer(
  state = initialState,
  action: AuthActions,
): AuthState {
  switch (action.type) {
    case RESET:
      return initialState;
    case LOGIN_SUCCEEDED:
      return {
        accessToken: {
          token: action.payload.accessToken,
          expiresAt: getTokenExpiry(action.payload.accessToken),
        },
        loggedIn: true,
      };
    default:
      return state;
  }
}
