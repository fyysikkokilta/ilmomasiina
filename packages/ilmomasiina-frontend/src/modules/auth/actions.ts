import { push } from "connected-react-router";
import { toast } from "react-toastify";

import { apiFetch } from "@tietokilta/ilmomasiina-components";
import { AdminLoginResponse } from "@tietokilta/ilmomasiina-models";
import i18n from "../../i18n";
import appPaths from "../../paths";
import type { DispatchAction, GetState } from "../../store/types";
import { LOGIN_SUCCEEDED, RESET } from "./actionTypes";

export const loginSucceeded = (payload: AdminLoginResponse) =>
  <const>{
    type: LOGIN_SUCCEEDED,
    payload,
  };

export const resetState = () =>
  <const>{
    type: RESET,
  };

export type AuthActions = ReturnType<typeof loginSucceeded> | ReturnType<typeof resetState>;

/** ID of latest login/auth related toast shown. Only used by `loginToast`. */
let loginToastId = 0;

const loginToast = (type: "success" | "error", text: string, autoClose: number) => {
  // If the previous login/auth related toast is still visible, update it instead of spamming a new one.
  // Otherwise, increment the ID and show a new one.
  if (toast.isActive(`loginState${loginToastId}`)) {
    toast.update(`loginState${loginToastId}`, {
      render: text,
      autoClose,
      type,
    });
  } else {
    loginToastId += 1;
    toast(text, { autoClose, type, toastId: `loginState${loginToastId}` });
  }
};

export const login = (email: string, password: string) => async (dispatch: DispatchAction) => {
  const sessionResponse = await apiFetch<AdminLoginResponse>("authentication", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
  dispatch(loginSucceeded(sessionResponse));
  dispatch(push(appPaths.adminEventsList));
  loginToast("success", i18n.t("auth.loginSuccess"), 2000);
  return true;
};

export const createInitialUser = (email: string, password: string) => async (dispatch: DispatchAction) => {
  const sessionResponse = await apiFetch<AdminLoginResponse>("users", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
  dispatch(loginSucceeded(sessionResponse));
  dispatch(push(appPaths.adminEventsList));
  loginToast("success", i18n.t("initialSetup.success"), 2000);
  return true;
};

export const redirectToLogin = () => (dispatch: DispatchAction) => {
  dispatch(resetState());
  dispatch(push(appPaths.adminLogin));
};

export const logout = () => async (dispatch: DispatchAction) => {
  dispatch(resetState());
  dispatch(redirectToLogin());
  loginToast("success", i18n.t("auth.logoutSuccess"), 2000);
};

export const loginExpired = () => (dispatch: DispatchAction) => {
  loginToast("error", i18n.t("auth.loginExpired"), 10000);
  dispatch(redirectToLogin());
};

const RENEW_LOGIN_THRESHOLD = 5 * 60 * 1000;

export const renewLogin = () => async (dispatch: DispatchAction, getState: GetState) => {
  const { accessToken } = getState().auth;
  if (!accessToken || Date.now() < accessToken.expiresAt - RENEW_LOGIN_THRESHOLD || Date.now() > accessToken.expiresAt)
    return;

  try {
    if (accessToken) {
      const sessionResponse = await apiFetch<AdminLoginResponse>("authentication/renew", {
        method: "POST",
        body: { accessToken },
        headers: { Authorization: accessToken.token },
      });
      if (sessionResponse) {
        dispatch(loginSucceeded(sessionResponse));
      }
    }
  } catch (err) {
    // Ignore errors from login renewal - loginExpired() will trigger via requireAuth.
  }
};
