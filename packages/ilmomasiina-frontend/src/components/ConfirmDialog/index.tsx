import React, { ReactNode, useCallback, useState } from "react";

import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type PendingConfirm = {
  message: ReactNode;
  resolve: (confirmed: boolean) => void;
};

/**
 * Promise-based replacement for `window.confirm()`.
 *
 * Render the returned `dialog` somewhere in the component, then `await confirm(message)`.
 */
export default function useConfirmDialog() {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (message: ReactNode) => new Promise<boolean>((resolve) => setPending({ message, resolve })),
    [],
  );

  const close = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  const dialog = (
    <Modal show={pending !== null} onHide={() => close(false)} centered>
      <Modal.Body>{pending?.message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => close(false)}>
          {t("confirmDialog.cancel")}
        </Button>
        <Button variant="danger" onClick={() => close(true)}>
          {t("confirmDialog.confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return { confirm, dialog };
}
