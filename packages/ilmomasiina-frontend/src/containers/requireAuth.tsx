import React, { ComponentType, useEffect } from "react";

import { loginExpired, redirectToLogin } from "../modules/auth/actions";
import { useTypedDispatch, useTypedSelector } from "../store/reducers";

export default function requireAuth<P extends {}>(WrappedComponent: ComponentType<P>) {
  const RequireAuth = (props: P) => {
    const dispatch = useTypedDispatch();

    const { accessToken } = useTypedSelector((state) => state.auth);

    const expired = accessToken && accessToken.expiresAt < Date.now();
    const needLogin = expired || !accessToken;

    useEffect(() => {
      if (expired) {
        dispatch(loginExpired());
      } else if (needLogin) {
        dispatch(redirectToLogin());
      }
    }, [needLogin, expired, dispatch]);

    return needLogin ? null : <WrappedComponent {...props} />;
  };

  return RequireAuth;
}
