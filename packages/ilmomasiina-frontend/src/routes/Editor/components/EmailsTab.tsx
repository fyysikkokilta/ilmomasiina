import React from "react";

import { useTranslation } from "react-i18next";

import { FieldRow } from "@tietokilta/ilmomasiina-components";
import useEditorErrors from "./errors";
import Textarea from "./Textarea";

const EmailsTab = () => {
  const { t } = useTranslation();
  const formatError = useEditorErrors();
  return (
    <FieldRow
      name="verificationEmail"
      as={Textarea}
      label={t("editor.emails.verificationEmail")}
      rows={10}
      formatError={formatError}
    />
  );
};

export default EmailsTab;
