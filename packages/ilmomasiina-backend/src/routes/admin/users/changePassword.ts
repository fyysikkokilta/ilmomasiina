import { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequest, NotFound } from 'http-errors';

import { AuditEvent, ErrorCode, UserChangePasswordSchema } from '@tietokilta/ilmomasiina-models';
import AdminPasswordAuth from '../../../authentication/adminPasswordAuth';
import { User } from '../../../models/user';
import CustomError from '../../../util/customError';

class WrongOldPassword extends CustomError {
  constructor(message: string) {
    super(401, ErrorCode.WRONG_OLD_PASSWORD, message);
  }
}

export default async function changePassword(
  request: FastifyRequest<{ Body: UserChangePasswordSchema }>,
  reply: FastifyReply,
): Promise<void> {
  if (request.body.newPassword.length < 10) {
    throw new BadRequest('Password must be at least 10 characters long');
  }

  await User.sequelize!.transaction(async (transaction) => {
    // Try to fetch existing user
    const existing = await User.findByPk(
      request.sessionData.user,
      { attributes: ['id', 'email', 'password'], transaction },
    );

    if (!existing) {
      throw new NotFound('User does not exist');
    } else {
      // Verify old password
      if (!AdminPasswordAuth.verifyHash(request.body.oldPassword, existing.password)) {
        throw new WrongOldPassword('Incorrect password');
      }
      // Update user with a new password
      await existing.update(
        { password: AdminPasswordAuth.createHash(request.body.newPassword) },
        { transaction },
      );

      await request.logEvent(AuditEvent.CHANGE_PASSWORD, {
        extra: {
          id: existing.id,
          email: existing.email,
        },
        transaction,
      });
    }
  });

  reply.status(204);
}
