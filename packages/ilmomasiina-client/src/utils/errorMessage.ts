import { toApiError } from "../api";

function errorString<TKey = string>(
  part: "title" | "description",
  thrown: unknown,
  prefix: string | undefined,
): TKey[] {
  const error = toApiError(thrown);
  // First try e.g. errors.SignupsClosed, then errors.403, then errors.default
  const types: string[] = [];
  if (error.code) types.push(error.code);
  if (error.status) types.push(String(error.status));
  types.push("default");

  // First try e.g. editSignup.errors.default, then errors.default
  const prefixes: string[] = [];
  if (prefix) prefixes.push(prefix);
  prefixes.push("errors");

  // Order, same examples:
  // - editSignup.errors.SignupsClosed
  // - errors.SignupsClosed
  // - editSignup.errors.403
  // - errors.403
  // - editSignup.errors.default
  // - errors.default
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the keys are built from the caller's translation key type
  return types.flatMap((type) => prefixes.map((pre) => `${pre}.${type}.${part}`)) as TKey[];
}

/** Returns possible localization keys, in priority order, for an error title.
 *
 * @param error The error thrown, usually an `ApiError`.
 * @param prefix Optional translation key prefix that specializes the error message to the relevant app function.
 * Don't end this with a period.
 */
export function errorTitle<TKey = string>(error: unknown, prefix?: string): TKey[] {
  return errorString("title", error, prefix);
}

/** Returns possible localization keys, in priority order, for an error description.
 *
 * @param error The error thrown, usually an `ApiError`.
 * @param prefix Optional translation key prefix that specializes the error message to the relevant app function.
 * Don't end this with a period.
 */
export function errorDesc<TKey = string>(error: unknown, prefix?: string): TKey[] {
  return errorString("description", error, prefix);
}
