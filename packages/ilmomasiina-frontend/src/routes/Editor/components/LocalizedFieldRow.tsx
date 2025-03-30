import React, { ComponentType, forwardRef, useState } from "react";

import { OverlayTrigger, Tooltip, TooltipProps } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import FieldRow, { FieldRowProps } from "@tietokilta/ilmomasiina-components/dist/components/FieldRow";
import { useTypedSelector } from "../../../store/reducers";
import { useFieldValue } from "./hooks";

const LocalizedTooltip = forwardRef<HTMLElement, Omit<TooltipProps, "id">>((props, ref) => {
  const { t } = useTranslation();
  const [id] = useState(`tooltip${Math.random()}`);
  return (
    <Tooltip {...props} ref={ref} id={id}>
      {t("editor.localized")}
    </Tooltip>
  );
});

const localizedIcon = (
  <OverlayTrigger placement="right" overlay={(props) => <LocalizedTooltip {...props} />}>
    {(props) => <span {...props}>🌐</span>}
  </OverlayTrigger>
);

type As = keyof JSX.IntrinsicElements | ComponentType<any>;

type Props<C extends As> = FieldRowProps<C> & {
  /** Field `name` with the language record key marked with `{}`. */
  localizedName: string;
  /** If true, show the unlocalized value as placeholder. */
  defaultAsPlaceholder?: boolean;
};

/** FieldRow that supports optionally rendering */
export default function LocalizedFieldRow<C extends As>({
  localizedName,
  name: defaultName,
  required,
  label,
  defaultAsPlaceholder,
  ...props
}: Props<C>) {
  const selectedLanguage = useTypedSelector((state) => state.editor.selectedLanguage);
  const defaultLanguage = useFieldValue<string>("defaultLanguage");
  const defaultValue = useFieldValue<string>(defaultName);
  const { t } = useTranslation();

  const isDefaultLanguage = selectedLanguage === defaultLanguage;
  const name = isDefaultLanguage ? defaultName : localizedName.replace("{}", selectedLanguage);

  const placeholder =
    !isDefaultLanguage && defaultAsPlaceholder
      ? { placeholder: `${t("editor.inheritedFromDefaultLanguage")}${defaultValue}` }
      : {};

  return (
    <FieldRow
      name={name}
      // Ensure fields in other languages are not required
      required={required && isDefaultLanguage}
      label={
        <>
          {localizedIcon} {label}
        </>
      }
      {...placeholder}
      {...props}
    />
  );
}
