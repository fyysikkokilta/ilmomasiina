import type { FormApi, FormState } from "final-form";
import { useForm, useFormState } from "react-final-form";
import { createSelector } from "reselect";

import { AdminEventResponse } from "@tietokilta/ilmomasiina-models";
import i18n from "../../i18n";
import type { Root } from "../store";
import { ConvertedEditorEvent, EditorEvent, EditorEventType } from "./types";

export const defaultEvent = (): EditorEvent => ({
  eventType: EditorEventType.EVENT_WITH_SIGNUP,
  title: "",
  slug: "",
  date: null,
  endDate: null,
  webpageUrl: "",
  facebookUrl: "",
  category: "",
  location: "",
  description: "",
  price: "",
  signupsPublic: false,
  languages: {},
  defaultLanguage: DEFAULT_LANGUAGE,

  registrationStartDate: null,
  registrationEndDate: null,

  openQuotaSize: 0,
  useOpenQuota: false,
  quotas: [],

  nameQuestion: true,
  emailQuestion: true,
  questions: [],

  verificationEmail: "",

  draft: true,
  listed: true,

  updatedAt: "",
});

/** Wraps react-final-form's `useForm()` with correct types.
 *
 * `useForm()` assumes the initial values are `Partial<T>`, but the initial values above are complete.
 */
export function useEditorForm(): FormApi<EditorEvent, EditorEvent> {
  return useForm<EditorEvent>() as FormApi<EditorEvent, EditorEvent>;
}

/** Wraps react-final-form's `useForm()` with correct types.
 *
 * `useFormState()` assumes the initial values are `Partial<T>`, but the initial values above are complete.
 *
 * It's also currently mistyped to allow `values` to be possibly undefined.
 */
export function useEditorFormState(): FormState<EditorEvent, EditorEvent> {
  return useFormState<EditorEvent>() as FormState<EditorEvent, EditorEvent>;
}

/** Determines the event type, which is only a thing in the frontend. */
export function eventType(event: AdminEventResponse): EditorEventType {
  if (event.date === null) {
    return EditorEventType.ONLY_SIGNUP;
  }
  if (event.registrationStartDate === null) {
    return EditorEventType.ONLY_EVENT;
  }
  return EditorEventType.EVENT_WITH_SIGNUP;
}

export const serverEventToEditor = (event: AdminEventResponse): EditorEvent => ({
  ...event,
  eventType: eventType(event),
  date: event.date ? new Date(event.date) : null,
  endDate: event.endDate ? new Date(event.endDate) : null,
  registrationStartDate: event.registrationStartDate ? new Date(event.registrationStartDate) : null,
  registrationEndDate: event.registrationEndDate ? new Date(event.registrationEndDate) : null,
  quotas: event.quotas.map((quota) => ({
    ...quota,
    key: quota.id,
  })),
  useOpenQuota: event.openQuotaSize > 0,
  questions: event.questions.map((question) => ({
    ...question,
    key: question.id,
    options: question.options || [""],
  })),
  languages: Object.fromEntries(
    Object.entries(event.languages).map(([language, locale]) => [
      language,
      {
        ...locale,
        questions: locale.questions.map((question) => ({
          ...question,
          options: question.options || [""],
        })),
      },
    ]),
  ),
});

export const editorEventToServer = (form: EditorEvent): ConvertedEditorEvent => ({
  ...form,
  date: form.eventType === EditorEventType.ONLY_SIGNUP ? null : (form.date?.toISOString() ?? null),
  endDate: form.eventType === EditorEventType.ONLY_SIGNUP ? null : (form.endDate?.toISOString() ?? null),
  registrationStartDate:
    form.eventType === EditorEventType.ONLY_EVENT ? null : (form.registrationStartDate?.toISOString() ?? null),
  registrationEndDate:
    form.eventType === EditorEventType.ONLY_EVENT ? null : (form.registrationEndDate?.toISOString() ?? null),
  openQuotaSize: form.useOpenQuota && form.openQuotaSize ? form.openQuotaSize : 0,
});

export const selectFormData = createSelector(
  (state: Root) => state.editor.isNew,
  (state: Root) => state.editor.event,
  (isNew, event) => {
    if (!event) return defaultEvent();
    const converted = serverEventToEditor(event);

    // For copying events, change the title/slug and remove IDs
    if (isNew) {
      converted.slug = `copy-of-${converted.slug}`;
      converted.title = i18n.t("editor.basic.name.copyPrefix", { lng: converted.defaultLanguage }) + converted.title;
      for (const [lang, languageVersion] of Object.entries(converted.languages)) {
        languageVersion.title = i18n.t("editor.basic.name.copyPrefix", { lng: lang }) + languageVersion.title;
      }
      for (const quota of converted.quotas) {
        quota.id = undefined;
      }
      for (const question of converted.questions) {
        question.id = undefined;
      }
    }

    return converted;
  },
);
