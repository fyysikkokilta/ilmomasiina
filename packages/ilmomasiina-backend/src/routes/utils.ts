/** Converts given value to a Date if it is a string, and otherwise just passthroughs the input */
export function toDate<T extends null | undefined>(s: string | T): Date | T {
  return typeof s === "string" ? new Date(s) : s;
}

/** Types a response for the API schema. Fastify's serializer turns the Dates in it into strings. */
export function asApiResponse<T>(value: T): StringifyApi<T> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the conversion happens during serialization
  return value as unknown as StringifyApi<T>;
}

/** Utility type that converts fields in the imported API to string. */
export type StringifyApi<T> = {
  [P in keyof T]: T[P] extends (infer E)[] // all arrays are stringified recursively
    ? StringifyApi<E>[]
    : // Date | null --> string | null
      // Date --> string
      // (also matches "x: null", but that's an useless type anyway)
      T[P] extends Date | null
      ? null extends T[P]
        ? string | null
        : string
      : // basic types: any subset of boolean | number | string | null --> itself
        T[P] extends boolean | number | string | null
        ? T[P]
        : // other types (essentially, objects) are stringified recursively
          StringifyApi<T[P]>;
};
