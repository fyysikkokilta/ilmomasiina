import React, { ChangeEvent, useMemo } from "react";

import { useField } from "react-final-form";
import { useTranslation } from "react-i18next";

import { languageSelected } from "../../../modules/editor/actions";
import { EditorEvent } from "../../../modules/editor/types";
import { useTypedDispatch, useTypedSelector } from "../../../store/reducers";
import useEvent from "../../../utils/useEvent";
import { useFieldValue } from "./hooks";
import SelectBox from "./SelectBox";

type Props = {
  label?: string;
};

const LanguageSelect = ({ label }: Props) => {
  const { t } = useTranslation();
  const {
    input: { value: languages },
  } = useField<EditorEvent["languages"]>("languages");
  const defaultLanguage = useFieldValue<string>("defaultLanguage");
  const selectedLanguage = useTypedSelector((state) => state.editor.selectedLanguage);
  const dispatch = useTypedDispatch();

  const options = useMemo(
    (): [string, string][] => [
      [defaultLanguage, `${t("languageName", { lng: defaultLanguage })} (${t("editor.selectedLanguage.default")})`],
      ...Object.keys(languages)
        .filter((language) => language !== defaultLanguage)
        .map((language): [string, string] => [language, t("languageName", { lng: language })]),
    ],
    [t, languages, defaultLanguage],
  );

  const handleChange = useEvent((evt: ChangeEvent<HTMLSelectElement>) => {
    dispatch(languageSelected(evt.currentTarget.value));
  });

  return (
    <div className="event-editor--selected-language">
      <label htmlFor="selectedLanguage">{label ?? t("editor.selectedLanguage")}</label>
      <SelectBox id="selectedLanguage" options={options} value={selectedLanguage} onChange={handleChange} />
    </div>
  );
};

export default LanguageSelect;
