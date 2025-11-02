import { toast } from "react-toastify";

import { apiFetch } from "@tietokilta/ilmomasiina-client";
import { AdminLoginResponse } from "@tietokilta/ilmomasiina-models";
import type { DispatchAction, GetState } from "../../store/types";
import { LOGIN_SUCCEEDED, RESET } from "./actionTypes";

export const loginSucceeded = (payload: AdminLoginResponse) =>
  <const>{
    type: LOGIN_SUCCEEDED,
    payload,
  };

export const resetAuthState = () =>
  <const>{
    type: RESET,
  };

export type AuthActions = ReturnType<typeof loginSucceeded> | ReturnType<typeof resetAuthState>;

/** ID of latest login/auth related toast shown. Only used by `loginToast`. */
let loginToastId = 0;

export const loginToast = (type: "success" | "error", text: string, autoClose: number) => {
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
  return true;
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
