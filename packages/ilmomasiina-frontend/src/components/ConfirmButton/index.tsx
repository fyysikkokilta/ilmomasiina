import React, { ComponentPropsWithoutRef, MouseEvent, ReactNode, useCallback, useEffect, useState } from "react";

import { Button } from "react-bootstrap";

// react-bootstrap types onClick loosely, so narrow it to a button click handler.
type Props = Omit<ComponentPropsWithoutRef<typeof Button>, "onClick"> & {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** The interval within which the button must be repressed. */
  confirmDelay?: number;
  /** The button contents shown when waiting for a confirmation press. */
  confirmLabel?: ReactNode;
};

/** Button that requires pressing twice within a given interval. */
export default function ConfirmButton({ confirmDelay, confirmLabel, onClick, children, ...props }: Props) {
  const [confirming, setConfirming] = useState(false);

  // When confirming is set, clear it after the delay.
  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), confirmDelay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [confirming, confirmDelay]);

  const handler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (confirming || !confirmDelay) {
        setConfirming(false);
        onClick?.(e);
      } else {
        e.preventDefault();
        setConfirming(true);
      }
    },
    [confirming, confirmDelay, onClick],
  );

  return (
    <Button onClick={handler} {...props}>
      {confirming ? (confirmLabel ?? children) : children}
    </Button>
  );
}
