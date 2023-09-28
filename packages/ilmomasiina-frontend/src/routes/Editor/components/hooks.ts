import { useField } from 'react-final-form';

export function useFieldValue<T>(name: string) {
  return useField<T>(name, { subscription: { value: true } }).input.value;
}

export function useFieldTouched(name: string) {
  return useField(name, { subscription: { touched: true } }).meta.touched;
}
