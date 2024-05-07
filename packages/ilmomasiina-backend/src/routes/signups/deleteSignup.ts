import { FastifyReply, FastifyRequest } from 'fastify';

import type { SignupPathParams } from '@tietokilta/ilmomasiina-models';
import { AuditEvent } from '@tietokilta/ilmomasiina-models';
import { AuditLogger } from '../../auditlog';
import { Event } from '../../models/event';
import { Quota } from '../../models/quota';
import { Signup } from '../../models/signup';
import { refreshSignupPositions } from './computeSignupPosition';
import { signupsAllowed } from './createNewSignup';
import { NoSuchSignup, SignupsClosed } from './errors';

/** Requires admin authentication OR editTokenVerification */
async function deleteSignup(id: string, auditLogger: AuditLogger, admin: boolean = false): Promise<void> {
  await Signup.sequelize!.transaction(async (transaction) => {
    const signup = await Signup.scope('active').findByPk(id, {
      include: [
        {
          model: Quota,
          attributes: ['id'],
          include: [
            {
              model: Event,
              attributes: ['id', 'title', 'registrationStartDate', 'registrationEndDate', 'openQuotaSize'],
            },
          ],
        },
      ],
      transaction,
    });
    if (signup === null) {
      throw new NoSuchSignup('No signup found with id');
    }
    if (!admin && !signupsAllowed(signup.quota!.event!)) {
      throw new SignupsClosed('Signups closed for this event.');
    }

    // Delete the DB object
    await signup.destroy({ transaction });

    // Advance the queue and send emails to people that were accepted
    await refreshSignupPositions(signup.quota!.event!, transaction);

    // Create an audit log event
    await auditLogger(AuditEvent.DELETE_SIGNUP, { signup, transaction });
  });
}

/** Requires admin authentication */
export async function deleteSignupAsAdmin(
  request: FastifyRequest<{ Params: SignupPathParams }>,
  reply: FastifyReply,
): Promise<void> {
  await deleteSignup(request.params.id, request.logEvent, true);
  reply.status(204);
}

/** Requires editTokenVerification */
export async function deleteSignupAsUser(
  request: FastifyRequest<{ Params: SignupPathParams }>,
  reply: FastifyReply,
): Promise<void> {
  await deleteSignup(request.params.id, request.logEvent);
  reply.status(204);
}
