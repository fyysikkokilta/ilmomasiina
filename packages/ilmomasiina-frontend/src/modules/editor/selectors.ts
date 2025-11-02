import { createSelector } from "reselect";

import i18n from "../../i18n";
import { AppState } from "../../store/types";
import { defaultEvent, serverEventToEditor } from "./actions";

// eslint-disable-next-line import/prefer-default-export
export const selectFormData = createSelector(
  (state: AppState) => state.editor.isNew,
  (state: AppState) => state.editor.event,
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
