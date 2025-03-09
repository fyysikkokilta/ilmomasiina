import React from "react";

import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type Props = {
  disabled: boolean;
  setEmails: (memberships: string[]) => void;
};

const CheckMembershipsTextArea = ({ disabled, setEmails }: Props) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmails(
      e.target.value
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email),
    );
  };

  return (
    <div className="check-memberships-text-area">
      <Form.Label htmlFor="check-memberships">{t("editor.checkMemberships.label")}</Form.Label>
      <Form.Control
        as="textarea"
        id="check-memberships"
        onChange={handleChange}
        placeholder={t(!disabled ? "editor.checkMemberships.placeholder" : "editor.checkMemberships.disabled")}
        disabled={disabled}
      />
    </div>
  );
};

export default CheckMembershipsTextArea;
