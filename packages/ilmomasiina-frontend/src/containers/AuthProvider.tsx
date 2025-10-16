import React, { createContext, PropsWithChildren, useEffect } from "react";

import { renewLogin } from "../modules/auth/actions";
import { useTypedDispatch, useTypedSelector } from "../store/reducers";

export interface AuthState {
  loggedIn: boolean;
}

export const AuthContext = createContext<AuthState>({
  loggedIn: false,
});

const LOGIN_RENEW_INTERVAL = 60 * 1000;

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const auth = useTypedSelector((state) => state.auth);
  const dispatch = useTypedDispatch();

  useEffect(() => {
    // Renew login immediately on page load if necessary.
    dispatch(renewLogin());
    // Then, check every minute and renew if necessary.
    const timer = window.setInterval(() => dispatch(renewLogin()), LOGIN_RENEW_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [dispatch]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
