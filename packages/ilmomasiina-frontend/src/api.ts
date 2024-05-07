import { ApiError, apiFetch, FetchOptions } from '@tietokilta/ilmomasiina-components';
import { ErrorCode } from '@tietokilta/ilmomasiina-models';
import { loginExpired } from './modules/auth/actions';
import { AccessToken } from './modules/auth/types';
import type { DispatchAction } from './store/types';

interface AdminApiFetchOptions extends FetchOptions {
  accessToken?: AccessToken;
}

/** Wrapper for apiFetch that checks for Unauthenticated responses and dispatches a loginExpired
 * action if necessary.
 */
export default async function adminApiFetch(uri: string, opts: AdminApiFetchOptions, dispatch: DispatchAction) {
  try {
    const { accessToken } = opts;
    if (!accessToken) {
      throw new ApiError(401, { isUnauthenticated: true });
    }
    return await apiFetch(uri, { ...opts, headers: { ...opts.headers, Authorization: accessToken.token } });
  } catch (err) {
    if (err instanceof ApiError && err.code === ErrorCode.BAD_SESSION) {
      dispatch(loginExpired());
    }
    throw err;
  }
}
