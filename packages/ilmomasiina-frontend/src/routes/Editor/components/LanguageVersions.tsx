import React from "react";

import { omit, pick } from "lodash-es";
import { Button, ButtonGroup } from "react-bootstrap";
import { useField, useForm } from "react-final-form";
import { useTranslation } from "react-i18next";

import { knownLanguages } from "@tietokilta/ilmomasiina-components";
import useEvent from "@tietokilta/ilmomasiina-components/dist/utils/useEvent";
import { AdminEventLanguage, QuestionLanguage, QuotaLanguage } from "@tietokilta/ilmomasiina-models";
import { languageSelected } from "../../../modules/editor/actions";
import { EditorEvent, EditorQuestion, EditorQuota } from "../../../modules/editor/types";
import { useTypedDispatch, useTypedSelector } from "../../../store/reducers";

type VersionProps = { language: string };

const LanguageVersion = ({ language }: VersionProps) => {
  const { t } = useTranslation();
  const {
    input: { value: defaultLanguage },
  } = useField<string>("defaultLanguage");
  const {
    input: { value: languages },
  } = useField<EditorEvent["languages"]>("languages");
  const { change, getFieldState, getState } = useForm<EditorEvent>();
  const selectedLanguage = useTypedSelector((state) => state.editor.selectedLanguage);
  const dispatch = useTypedDispatch();

  const isPresent = language in languages;
  const isDefault = language === defaultLanguage;
  const isEditing = selectedLanguage === language;

  const edit = useEvent(() => {
    dispatch(languageSelected(language));
  });

  const setAsDefault = useEvent(() => {
    // If the language is present, we need to swap it with the default.
    if (isPresent) {
      // First, extract all the language version fields from the event, and add the result to languages.
      const oldDefaultLanguage: Required<AdminEventLanguage> = pick(
        getState().values,
        "description",
        "title",
        "price",
        "location",
        "webpageUrl",
        "facebookUrl",
        "verificationEmail",
      );
      change("languages", {
        ...omit(languages, language),
        [defaultLanguage]: oldDefaultLanguage,
      });
      // Then, overwrite the event fields with the new default language.
      const newDefaultLanguage = languages[language];
      for (const key of Object.keys(newDefaultLanguage) as (keyof AdminEventLanguage)[]) {
        change(key, newDefaultLanguage[key]);
      }
      // Do the same for quotas and questions.
      change(
        "quotas",
        getFieldState("quotas")!.value!.map((quota): EditorQuota => {
          const oldDefault: Required<QuotaLanguage> = pick(quota, "title");
          const newDefault = quota.languages[language];
          return {
            ...quota,
            ...newDefault,
            languages: {
              ...omit(quota.languages, language),
              [defaultLanguage]: oldDefault,
            },
          };
        }),
      );
      change(
        "questions",
        getFieldState("questions")!.value!.map((question): EditorQuestion => {
          const oldDefault: Required<QuestionLanguage> = pick(question, "question", "options");
          const newDefault = question.languages[language];
          return {
            ...question,
            ...newDefault,
            options: newDefault.options ?? question.options,
            languages: {
              ...omit(question.languages, language),
              [defaultLanguage]: oldDefault,
            },
          };
        }),
      );
    }
    change("defaultLanguage", language);
    // Finally, start editing the new default language.
    dispatch(languageSelected(language));
  });

  const add = useEvent(() => {
    // Add empty language to event, all quotas and all questions.
    change("languages", { ...languages, [language]: {} });
    change(
      "quotas",
      getFieldState("quotas")!.value!.map((quota) => ({
        ...quota,
        languages: { ...quota.languages, [language]: {} },
      })),
    );
    change(
      "questions",
      getFieldState("questions")!.value!.map((question) => ({
        ...question,
        languages: { ...question.languages, [language]: {} },
      })),
    );
    // Finally, start editing the new language.
    dispatch(languageSelected(language));
  });

  const remove = useEvent(() => {
    // Remove language from event, all quotas and all questions.
    change("languages", omit(languages, language));
    change(
      "quotas",
      getFieldState("quotas")!.value!.map((quota) => ({
        ...quota,
        languages: omit(quota.languages, language),
      })),
    );
    change(
      "questions",
      getFieldState("questions")!.value!.map((question) => ({
        ...question,
        languages: omit(question.languages, language),
      })),
    );
    // Switch to default language if we removed the active one.
    if (isEditing) dispatch(languageSelected(defaultLanguage));
  });

  const labels: string[] = [];
  if (isDefault) labels.push(t("editor.basic.languages.default"));
  if (isEditing) labels.push(t("editor.basic.languages.editing"));

  return (
    <div className="event-editor--language-version">
      <span>
        {t("languageName", { lng: language })}
        {labels.length > 0 && <span className="text-muted"> ({labels.join(", ")})</span>}
      </span>
      <ButtonGroup size="sm">
        {!isPresent && !isDefault && (
          <Button variant="primary" size="sm" onClick={add}>
            {t("editor.basic.languages.add")}
          </Button>
        )}
        {(isDefault || isPresent) && !isEditing && (
          <Button variant="primary" size="sm" onClick={edit}>
            {t("editor.basic.languages.edit")}
          </Button>
        )}
        {!isDefault && (
          <Button variant="primary" size="sm" onClick={setAsDefault}>
            {t("editor.basic.languages.setDefault")}
          </Button>
        )}
        {isPresent && !isDefault && (
          <Button variant="danger" size="sm" onClick={remove}>
            {t("editor.basic.languages.delete")}
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
};

const LanguageVersions = () => (
  <div className="event-editor--language-versions">
    {knownLanguages.map((language) => (
      <LanguageVersion key={language} language={language} />
    ))}
  </div>
);

export default LanguageVersions;
