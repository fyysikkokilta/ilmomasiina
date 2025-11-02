import React, { ComponentType, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { loginToast } from "../modules/auth";
import useStore from "../modules/store";
import paths from "../paths";

export default function requireAuth<P extends {}>(WrappedComponent: ComponentType<P>) {
  const RequireAuth = (props: P) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { accessToken, resetAuth: resetState } = useStore((state) => state.auth);

    const expired = accessToken && accessToken.expiresAt < Date.now();
    const needLogin = expired || !accessToken;

    useEffect(() => {
      if (expired) {
        resetState();
        loginToast("error", t("auth.loginExpired"), 10000);
        navigate(paths.adminLogin);
      } else if (needLogin) {
        resetState();
        navigate(paths.adminLogin);
      }
    }, [needLogin, expired, resetState, navigate, t]);

    return needLogin ? null : <WrappedComponent {...props} />;
  };

  return RequireAuth;
}
