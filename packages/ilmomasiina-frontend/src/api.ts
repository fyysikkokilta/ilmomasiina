import { ApiError, apiFetch, FetchOptions } from "@tietokilta/ilmomasiina-client";
import { ErrorCode } from "@tietokilta/ilmomasiina-models";
import i18n from "./i18n";
import { AccessToken, loginToast } from "./modules/auth";
import useStore from "./modules/store";

interface AdminApiFetchOptions extends FetchOptions {
  accessToken?: AccessToken;
}

/** Wrapper for apiFetch that checks for Unauthenticated responses and resets the login state if necessary. */
export default async function adminApiFetch<T = unknown>(uri: string, opts: AdminApiFetchOptions) {
  try {
    const { accessToken } = opts;
    if (!accessToken) {
      throw new ApiError(401, { isUnauthenticated: true });
    }
    return await apiFetch<T>(uri, {
      ...opts,
      headers: { ...opts.headers, Authorization: accessToken.token },
    });
  } catch (err) {
    if (err instanceof ApiError && err.code === ErrorCode.BAD_SESSION) {
      loginToast("error", i18n.t("auth.loginExpired"), 10000);
      useStore.getState().auth.resetAuth();
    }
    throw err;
  }
}
