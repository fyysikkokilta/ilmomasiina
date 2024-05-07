import find from 'lodash-es/find';
import orderBy from 'lodash-es/orderBy';
import sumBy from 'lodash-es/sumBy';
import moment from 'moment-timezone';

import type {
  AdminEventResponse, AdminSignupSchema, PublicSignupSchema, QuestionID, QuotaID, QuotaWithSignupCount,
  SignupID, UserEventResponse,
} from '@tietokilta/ilmomasiina-models';
import { SignupStatus } from '@tietokilta/ilmomasiina-models';
import { timezone } from '../config';

/** Placeholder quota ID for the open quota. */
export const OPENQUOTA = '\x00open' as const;
/** Placeholder quota ID for the queue. */
export const WAITLIST = '\x00waitlist' as const;

export type AnyEventSchema = AdminEventResponse | UserEventResponse;
export type AnySignupSchema = AdminSignupSchema | PublicSignupSchema;

/** Grabs the signup type from {Admin,User}EventSchema and adds some extra information. */
export type SignupWithQuota<Ev extends AnyEventSchema = AnyEventSchema> =
  Ev['quotas'][number]['signups'][number] & {
    quotaId: QuotaID;
    quotaName: string;
  };

function getSignupsAsList<Ev extends AnyEventSchema>(event: Ev): SignupWithQuota<Ev>[] {
  return event.quotas.flatMap(
    (quota) => quota.signups?.map(
      (signup) => ({
        ...signup,
        quotaId: quota.id,
        quotaName: quota.title,
      }),
    ) ?? [],
  );
}

/** Computes the number of signups in the open quota and queue. */
export function countOverflowSignups(quotas: QuotaWithSignupCount[], openQuotaSize: number) {
  const overflow = sumBy(quotas, (quota) => Math.max(0, quota.signupCount - (quota.size ?? Infinity)));
  return {
    openQuotaCount: Math.min(overflow, openQuotaSize),
    queueCount: Math.max(overflow - openQuotaSize, 0),
  };
}

export type QuotaSignups = {
  id: QuotaID | typeof OPENQUOTA | typeof WAITLIST;
  title: string;
  size: number | null;
  signups: SignupWithQuota[];
  signupCount: number;
};

/** Gathers all signups of an event into their assigned quotas, the open quota, and the queue. */
export function getSignupsByQuota(event: AnyEventSchema): QuotaSignups[] {
  const signups = getSignupsAsList(event);
  const quotas = [
    ...event.quotas.map(
      (quota) => {
        const quotaSignups = signups.filter((signup) => signup.quotaId === quota.id && signup.status === 'in-quota');
        return {
          ...quota,
          signups: quotaSignups,
          // Trust signupCount and size, unless we have concrete information that more signups exist
          signupCount: Math.max(quotaSignups.length, Math.min(quota.signupCount, quota.size ?? Infinity)),
        };
      },
    ),
  ];

  const { openQuotaCount, queueCount } = countOverflowSignups(event.quotas, event.openQuotaSize);

  const openSignups = signups.filter((signup) => signup.status === 'in-open');
  // Open quota is shown if the event has one, or if signups have been assigned there nevertheless.
  const openQuota = openSignups.length > 0 || event.openQuotaSize > 0 ? [{
    id: OPENQUOTA,
    title: 'Avoin kiintiö',
    size: event.openQuotaSize,
    signups: openSignups,
    signupCount: Math.max(openQuotaCount, openSignups.length),
  }] : [];

  const queueSignups = signups.filter((signup) => signup.status === 'in-queue');
  // Queue is shown if signups have been assigned there.
  const queue = queueSignups.length > 0 ? [{
    id: WAITLIST,
    title: 'Jonossa',
    size: null,
    signups: queueSignups,
    signupCount: Math.max(queueCount, queueSignups.length),
  }] : [];

  return [
    ...quotas,
    ...openQuota,
    ...queue,
  ];
}

function getAnswersFromSignup(event: AdminEventResponse, signup: AnySignupSchema) {
  const answers: Record<QuestionID, string | string[]> = {};

  event.questions.forEach((question) => {
    const answer = find(signup.answers, { questionId: question.id });
    answers[question.id] = answer?.answer || '';
  });

  return answers;
}

export type FormattedSignup = {
  id?: SignupID;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  answers: Record<QuestionID, string | string[]>;
  quota: string;
  createdAt: string;
  confirmed: boolean;
};

/** Formats all signups to an event into a single list. */
export function getSignupsForAdminList(event: AdminEventResponse): FormattedSignup[] {
  const signupsArray = getSignupsAsList(event);
  const sorted = orderBy(signupsArray, [
    (signup) => [SignupStatus.IN_QUOTA, SignupStatus.IN_OPEN_QUOTA, SignupStatus.IN_QUEUE, null].indexOf(signup.status),
    'createdAt',
  ]);

  return sorted.map((signup) => {
    let quotaType = '';
    if (signup.status === 'in-open') {
      quotaType = ' (Avoin)';
    } else if (signup.status === 'in-queue') {
      quotaType = ' (Jonossa)';
    }
    return {
      ...signup,
      createdAt: moment(signup.createdAt)
        .tz(timezone())
        .format('DD.MM.YYYY HH:mm:ss'),
      quota: `${signup.quotaName}${quotaType}`,
      answers: getAnswersFromSignup(event, signup),
    };
  });
}

/** Formats an answer for display. */
export function stringifyAnswer(answer: string | string[] | undefined) {
  return Array.isArray(answer) ? answer.join(', ') : (answer ?? '');
}

/** Converts an array of signup rows from `getSignupsForAdminList` to a an array of CSV cells. */
export function convertSignupsToCSV(event: AdminEventResponse, signups: FormattedSignup[]): string[][] {
  return [
    // Headers
    [
      ...(event.nameQuestion ? ['Etunimi', 'Sukunimi'] : []),
      ...(event.emailQuestion ? ['Sähköpostiosoite'] : []),
      'Kiintiö',
      ...event.questions.map(({ question }) => question),
      'Ilmoittautumisaika',
    ],
    // Data rows
    ...signups.map((signup) => [
      ...(event.nameQuestion ? [signup.firstName || '', signup.lastName || ''] : []),
      ...(event.emailQuestion ? [signup.email || ''] : []),
      signup.quota,
      ...event.questions.map((question) => stringifyAnswer(signup.answers[question.id])),
      signup.createdAt,
    ]),
  ];
}
