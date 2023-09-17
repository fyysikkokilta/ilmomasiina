import moment, { Moment } from 'moment-timezone';
import { useTranslation } from 'react-i18next';

export enum SignupState {
  disabled = 'disabled',
  not_opened = 'not_opened',
  open = 'open',
  closed = 'closed',
}

export type SignupStateInfo =
  | { state: SignupState.disabled }
  | { state: SignupState.not_opened, opens: Moment }
  | { state: SignupState.open, closes: Moment }
  | { state: SignupState.closed };

export function signupState(starts: string | null, closes: string | null): SignupStateInfo {
  if (starts === null || closes === null) {
    return { state: SignupState.disabled };
  }

  const signupOpens = moment(starts);
  const signupCloses = moment(closes);
  const now = moment();

  if (signupOpens.isSameOrAfter(now)) {
    return { state: SignupState.not_opened, opens: signupOpens };
  }

  if (signupCloses.isSameOrAfter(now)) {
    return { state: SignupState.open, closes: signupCloses };
  }

  return { state: SignupState.closed };
}

export interface SignupStateText {
  class: string;
  shortLabel: string;
  fullLabel?: string;
}

export function useSignupStateText(state: SignupStateInfo): SignupStateText {
  const { t } = useTranslation();
  const timeFormat = `D.M.Y [${t('dateFormat.dateTimeSep')}] HH:mm`;

  switch (state.state) {
    case SignupState.disabled:
      return {
        shortLabel: t('signupState.disabled'),
        class: 'ilmo--signup-disabled',
      };
    case SignupState.not_opened:
      return {
        shortLabel: t('signupState.notOpened.short', { date: moment(state.opens).format(timeFormat) }),
        fullLabel: t('signupState.notOpened', { date: moment(state.opens).format(timeFormat) }),
        class: 'ilmo--signup-not-opened',
      };
    case SignupState.open:
      return {
        shortLabel: t('signupState.open.short', { date: moment(state.closes).format(timeFormat) }),
        fullLabel: t('signupState.open.short', { date: moment(state.closes).format(timeFormat) }),
        class: 'ilmo--signup-opened',
      };
    case SignupState.closed:
      return {
        shortLabel: t('signupState.closed'),
        class: 'ilmo--signup-closed',
      };
    default:
      throw new Error('invalid state');
  }
}
