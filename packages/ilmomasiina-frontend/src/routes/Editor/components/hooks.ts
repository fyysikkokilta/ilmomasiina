import { useDebugValue } from "react";

import { useField } from "react-final-form";

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller chooses the value type
export function useFieldValue<T>(name: string) {
  const { value } = useField<T>(name, { subscription: { value: true } }).input;
  useDebugValue(value);
  return value;
}

export function useFieldError(name: string) {
  const error = useField(name, { subscription: { error: true } }).meta.error as unknown;
  useDebugValue(error);
  return error;
}

export function useFieldTouched(name: string) {
  const { touched } = useField(name, { subscription: { touched: true } }).meta;
  useDebugValue(touched);
  return touched;
}
