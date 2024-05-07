import { ApiError, apiFetch, FetchOptions } from '@tietokilta/ilmomasiina-components';
import { ErrorCode } from '@tietokilta/ilmomasiina-models';
import { loginExpired } from './modules/auth/actions';
import type { DispatchAction } from './store/types';

/** Wrapper for apiFetch that checks for Unauthenticated responses and dispatches a loginExpired
 * action if necessary.
 */
export default async function adminApiFetch(uri: string, opts: FetchOptions, dispatch: DispatchAction) {
  try {
    return await apiFetch(uri, opts);
  } catch (err) {
    if (err instanceof ApiError && err.code === ErrorCode.BAD_SESSION) {
      dispatch(loginExpired());
    }
    throw err;
  }
}
