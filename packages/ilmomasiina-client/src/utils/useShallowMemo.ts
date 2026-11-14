import { useState } from "react";

/**
 * Modified from https://github.com/reduxjs/react-redux/blob/master/src/utils/shallowEqual.ts
 * @copyright 2015-present Dan Abramov
 * @license MIT
 */
function shallowEqual(a: unknown, b: unknown) {
  if (Object.is(a, b)) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;

  const entriesA = Object.entries(a);
  const valuesB = new Map(Object.entries(b));

  if (entriesA.length !== valuesB.size) return false;

  for (const [key, value] of entriesA) {
    if (!valuesB.has(key) || !Object.is(value, valuesB.get(key))) return false;
  }
  return true;
}

/** Returns the given object. Returns a previously used object, if shallow-equal to the current one. */
export default function useShallowMemo<T>(value: T): T {
  const [memo, setMemo] = useState(value);
  if (shallowEqual(memo, value)) return memo;
  // Store the new value; React re-renders immediately with it, as with any state set during render.
  setMemo(value);
  return value;
}
