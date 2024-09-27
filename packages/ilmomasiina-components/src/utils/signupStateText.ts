import { useTranslation } from "react-i18next";

import { useEventDateTimeFormatter } from "./dateFormat";

export enum SignupState {
  disabled = "disabled",
  not_opened = "not_opened",
  open = "open",
  closed = "closed",
}

export type SignupStateInfo =
  | { state: SignupState.disabled }
  | { state: SignupState.not_opened; opens: Date }
  | { state: SignupState.open; closes: Date }
  | { state: SignupState.closed; closed: Date };

export function signupState(starts: string | null, closes: string | null): SignupStateInfo {
  if (starts === null || closes === null) {
    return { state: SignupState.disabled };
  }

  const signupOpens = new Date(starts);
  const signupCloses = new Date(closes);
  const now = new Date();

  if (now < signupOpens) {
    return { state: SignupState.not_opened, opens: signupOpens };
  }

  if (now < signupCloses) {
    return { state: SignupState.open, closes: signupCloses };
  }

  return { state: SignupState.closed, closed: signupCloses };
}

export interface SignupStateText {
  class: string;
  shortLabel: string;
  fullLabel?: string;
}

export function useSignupStateText(state: SignupStateInfo): SignupStateText {
  const { t } = useTranslation();
  const eventDateFormat = useEventDateTimeFormatter();

  switch (state.state) {
    case SignupState.disabled:
      return {
        shortLabel: t("signupState.disabled"),
        class: "ilmo--signup-disabled",
      };
    case SignupState.not_opened:
      return {
        shortLabel: t("signupState.notOpened.short", {
          date: eventDateFormat.format(new Date(state.opens)),
        }),
        fullLabel: t("signupState.notOpened", {
          date: eventDateFormat.format(new Date(state.opens)),
        }),
        class: "ilmo--signup-not-opened",
      };
    case SignupState.open:
      return {
        shortLabel: t("signupState.open.short", {
          date: eventDateFormat.format(new Date(state.closes)),
        }),
        fullLabel: t("signupState.open", {
          date: eventDateFormat.format(new Date(state.closes)),
        }),
        class: "ilmo--signup-opened",
      };
    case SignupState.closed:
      return {
        shortLabel: t("signupState.closed.short", {
          date: eventDateFormat.format(new Date(state.closed)),
        }),
        fullLabel: t("signupState.closed", {
          date: eventDateFormat.format(new Date(state.closed)),
        }),
        class: "ilmo--signup-closed",
      };
    default:
      throw new Error("invalid state");
  }
}
