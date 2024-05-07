import moment from 'moment-timezone';
import { Transaction, WhereOptions } from 'sequelize';

import { AuditEvent, SignupStatus } from '@tietokilta/ilmomasiina-models';
import { internalAuditLogger } from '../../auditlog';
import config from '../../config';
import i18n from '../../i18n';
import EmailService from '../../mail';
import { Event } from '../../models/event';
import { Quota } from '../../models/quota';
import { Signup } from '../../models/signup';
import { WouldMoveSignupsToQueue } from '../admin/events/errors';

async function sendPromotedFromQueueMail(signup: Signup, eventId: Event['id']) {
  if (signup.email === null) return;

  // Re-fetch event for all attributes
  const event = await Event.findByPk(eventId);
  if (event === null) throw new Error('event missing when sending queue email');

  const lng = signup.language ?? undefined;
  const dateFormat = i18n.t('dateFormat.general', { lng });
  const params = {
    event,
    date: event.date && moment(event.date).tz(config.timezone).format(dateFormat),
  };
  await EmailService.sendPromotedFromQueueMail(signup.email, signup.language, params);
}

/**
 * Updates the status and position attributes on all signups in the given event. Also sends "promoted from queue"
 * emails to affected users. Returns the new statuses for all signups.
 *
 * By default, recomputations can move signups into the queue. This ensures that we don't cause random errors for
 * ordinary users. `moveSignupsToQueue = false` is passed if a warning can be shown (i.e. in admin-side editors).
 */
export async function refreshSignupPositions(
  eventRef: Event,
  transaction?: Transaction,
  moveSignupsToQueue: boolean = true,
): Promise<Signup[]> {
  // Wrap in transaction if not given
  if (!transaction) {
    return Event.sequelize!.transaction(
      async (trans) => refreshSignupPositions(eventRef, trans),
    );
  }

  // Lock event to prevent simultaneous changes
  const event = await Event.findByPk(eventRef.id, {
    attributes: ['id', 'title', 'openQuotaSize'],
    transaction,
    lock: Transaction.LOCK.UPDATE,
  });
  if (!event) {
    throw new Error('event missing from DB');
  }
  const signups = await Signup.scope('active').findAll({
    attributes: ['id', 'quotaId', 'firstName', 'lastName', 'email', 'status', 'position', 'language'],
    include: [
      {
        model: Quota,
        attributes: ['id', 'size'],
      },
    ],
    where: {
      '$quota.eventId$': event.id,
    } as WhereOptions,
    // Honor creation time, tie-break by random ID in case of same millisecond
    order: [
      ['createdAt', 'ASC'],
      ['id', 'ASC'],
    ],
    lock: Transaction.LOCK.UPDATE,
    transaction,
  });

  // Assign each signup to a quota or the queue.
  const quotaSignups = new Map<Quota['id'], number>();
  let inOpenQuota = 0;
  let inQueue = 0;
  let movedToQueue = 0;

  const result = signups.map((signup: Signup) => {
    let status: SignupStatus;
    let position: number;

    let inChosenQuota = quotaSignups.get(signup.quotaId) ?? 0;
    const chosenQuotaSize = signup.quota!.size ?? Infinity;

    // Assign the selected or open quotas if free. Never worsen a signup's status.
    if (inChosenQuota < chosenQuotaSize) {
      inChosenQuota += 1;
      quotaSignups.set(signup.quotaId, inChosenQuota);
      status = SignupStatus.IN_QUOTA;
      position = inChosenQuota;
    } else if (inOpenQuota < event.openQuotaSize) {
      inOpenQuota += 1;
      status = SignupStatus.IN_OPEN_QUOTA;
      position = inOpenQuota;
    } else {
      inQueue += 1;
      status = SignupStatus.IN_QUEUE;
      position = inQueue;
      if (signup.status !== SignupStatus.IN_QUEUE) {
        movedToQueue += 1;
      }
    }

    return { signup, status, position };
  });

  if (movedToQueue > 0 && !moveSignupsToQueue) {
    throw new WouldMoveSignupsToQueue(movedToQueue);
  }

  // If a signup was just promoted from the queue, send an email about it asynchronously.
  await Promise.all(result.map(async ({ signup, status }) => {
    if (signup.status === 'in-queue' && status !== 'in-queue') {
      sendPromotedFromQueueMail(signup, event.id);

      await internalAuditLogger(AuditEvent.PROMOTE_SIGNUP, {
        signup,
        event,
        transaction,
      });
    }
  }));

  // Store changes in database, if any.
  await Promise.all(result.map(async ({ signup, status, position }) => {
    if (signup.status !== status || signup.position !== position) {
      await signup.update(
        { status, position },
        { transaction },
      );
    }
  }));

  return result.map(({ signup }) => signup);
}

/**
 * Like `refreshSignupPositions`, but returns the status for the given signup.
 */
export async function refreshSignupPositionsAndGet(event: Event, signupId: Signup['id']) {
  const result = await refreshSignupPositions(event);
  const signup = result.find(({ id }) => id === signupId);
  if (!signup) throw new Error('failed to compute status');
  const { status, position } = signup;
  return { status, position };
}
