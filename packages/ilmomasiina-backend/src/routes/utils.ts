/** Converts given value to a Date if it is a string, and otherwise just passthroughs the input */
export function toDate<T>(s: T): Date | Exclude<T, string> {
  return typeof s === 'string' ? new Date(s) : s as Exclude<T, string>;
}

/** Utility type that converts fields in the imported API to string. */
export type StringifyApi<T> = {
  [P in keyof T]: (
    // all arrays are stringified recursively
    T[P] extends (infer E)[] ? StringifyApi<E>[]
      // Date | null --> string | null
      // Date --> string
      // (also matches "x: null", but that's an useless type anyway)
      : T[P] extends Date | null ? (null extends T[P] ? string | null : string)
        // basic types: any subset of boolean | number | string | null --> itself
        : T[P] extends boolean | number | string | null ? T[P]
          // other types (essentially, objects) are stringified recursively
          : StringifyApi<T[P]>
  );
};

/** Recursively converts all `Date` objects in the given object to strings. */
export function stringifyDates<T>(obj: T): StringifyApi<T> {
  if (typeof obj !== 'object' || obj === null) {
    return obj as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(stringifyDates) as any;
  }
  return Object.fromEntries(Object.entries(obj).map(([key, val]) => {
    if (val instanceof Date) {
      return [key, val.toISOString()];
    }
    if (typeof val === 'object' && val !== null) {
      return [key, stringifyDates(val)];
    }
    return [key, val];
  })) as any;
}
