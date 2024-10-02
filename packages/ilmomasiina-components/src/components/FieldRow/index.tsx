import React, { ComponentPropsWithoutRef, ComponentType, JSX, ReactNode } from "react";

import identity from "lodash-es/identity";
import { Form, FormControlProps } from "react-bootstrap";
import { useField, UseFieldConfig } from "react-final-form";

import BaseFieldRow, { BaseFieldRowProps } from "../BaseFieldRow";

type BaseProps = Omit<BaseFieldRowProps, "error" | "children"> &
  Pick<UseFieldConfig<any>, "type"> & {
    /** The name of the field in the data. */
    name: string;
    /** Passed as `controlId` if no `controlId` is separately set. */
    id?: string;
    /** Formats a field error. */
    formatError?: (error: any) => ReactNode;
    /** Passed as `label` to the field component. Intended for checkboxes. */
    checkLabel?: ReactNode;
    /** useField() config. */
    config?: UseFieldConfig<any>;
  };

// These typings do the best attempt we can do with merged props.
// Ideally, with TypeScript, we should provide a render function, but I'll defer that change
// to when we get rid of react-bootstrap altogether.

// react-bootstrap's typing for Form.Control is extremely broad, so only allow <input> props.
type InputProps = ComponentPropsWithoutRef<"input">;

// Props with neither `children` nor `as`, assume `Form.Control`.
type PropsWithFormControl = BaseProps & {
  children?: undefined;
  as?: undefined;
} & Omit<FormControlProps & InputProps, keyof BaseProps | "as" | "children">;

// Props with `children` given, no extra props to pass through.
type PropsWithChildren = BaseProps & {
  /** If given, this is used as the field. */
  children: ReactNode;
  as?: undefined;
};

type As = keyof JSX.IntrinsicElements | ComponentType<any>;

// Props with a custom `as` component.
type PropsWithAs<C extends As> = BaseProps & {
  /** The component or element to use as the field. */
  as: C;
  children?: undefined;
} & Omit<ComponentPropsWithoutRef<C>, keyof BaseProps | "as" | "children">;

type Props<C extends As> = PropsWithFormControl | PropsWithChildren | PropsWithAs<C>;

/** react-final-field field row component */
export default function FieldRow<C extends As>({
  name,
  label = "",
  help,
  required = false,
  formatError,
  extraFeedback,
  checkAlign,
  checkLabel,
  as,
  children,
  type,
  id,
  controlId = id ?? name,
  config,
  ...props
}: Props<C>) {
  const {
    input,
    meta: { error: validationError, submitError, invalid },
  } = useField(name, {
    type,
    // react-final-form replaces empty strings by undefined for whatever reason.
    // Override the default (but allow config to override this).
    parse: identity,
    ...config,
  });
  const error = submitError || validationError;

  let field: ReactNode;
  if (children) {
    field = children;
  } else {
    // Checkboxes have two labels: in the left column and next to the checkbox. Form.Check handles the latter for us
    // and calls it "label", but we still want to call the other one "label" for all other types of field. Therefore
    // we pass "checkLabel" to the field here.
    const overrideProps = checkLabel !== undefined ? { label: checkLabel } : {};
    const Component = (as ?? Form.Control) as ComponentType<any>;
    field = <Component required={required} isInvalid={invalid} {...props} id={id} {...input} {...overrideProps} />;
  }

  return (
    <BaseFieldRow
      controlId={controlId}
      label={label}
      help={help}
      required={required}
      error={invalid && (formatError ? formatError(error) : error)}
      extraFeedback={extraFeedback}
      checkAlign={checkAlign}
    >
      {field}
    </BaseFieldRow>
  );
}
