import React, { ComponentType, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { loginToast, resetAuthState } from "../modules/auth/actions";
import paths from "../paths";
import { useTypedDispatch, useTypedSelector } from "../store/reducers";

export default function requireAuth<P extends {}>(WrappedComponent: ComponentType<P>) {
  const RequireAuth = (props: P) => {
    const dispatch = useTypedDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { accessToken } = useTypedSelector((state) => state.auth);

    const expired = accessToken && accessToken.expiresAt < Date.now();
    const needLogin = expired || !accessToken;

    useEffect(() => {
      if (expired) {
        dispatch(resetAuthState());
        loginToast("error", t("auth.loginExpired"), 10000);
        navigate(paths.adminLogin);
      } else if (needLogin) {
        dispatch(resetAuthState());
        navigate(paths.adminLogin);
      }
    }, [needLogin, expired, dispatch, navigate, t]);

    return needLogin ? null : <WrappedComponent {...props} />;
  };

  return RequireAuth;
}
