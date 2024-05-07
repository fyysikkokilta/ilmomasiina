import { FastifyReply, FastifyRequest } from 'fastify';
import { Conflict } from 'http-errors';
import { Transaction } from 'sequelize';

import type { UserCreateSchema, UserInviteSchema, UserSchema } from '@tietokilta/ilmomasiina-models';
import { AuditEvent } from '@tietokilta/ilmomasiina-models';
import { AuditLogger } from '../../../auditlog';
import AdminPasswordAuth from '../../../authentication/adminPasswordAuth';
import EmailService from '../../../mail';
import { User } from '../../../models/user';
import generatePassword from './generatePassword';

/**
 * Private helper function to create a new user and save it to the database
 *
 * @param params user parameters
 * @param auditLogger audit logger function from the originating request
 */
export async function createUser(
  params: UserCreateSchema,
  auditLogger: AuditLogger,
  transaction: Transaction,
): Promise<UserSchema> {
  const existing = await User.findOne({
    where: { email: params.email },
    transaction,
  });

  if (existing) throw new Conflict('User with given email already exists');

  // Create new user with hashed password
  const user = await User.create(
    {
      ...params,
      password: AdminPasswordAuth.createHash(params.password),
    },
    { transaction },
  );

  const res = {
    id: user.id,
    email: user.email,
  };

  await auditLogger(AuditEvent.CREATE_USER, {
    extra: res,
    transaction,
  });

  return res;
}

/**
 * Creates a new user and sends an invitation mail to their email
 */
export default async function inviteUser(
  request: FastifyRequest<{ Body: UserInviteSchema }>,
  reply: FastifyReply,
): Promise<UserSchema> {
  // Generate secure password
  const password = generatePassword();

  const user = await User.sequelize!.transaction(async (transaction) => createUser(
    {
      email: request.body.email,
      password,
    },
    request.logEvent,
    transaction,
  ));

  // Send invitation mail
  await EmailService.sendNewUserMail(user.email, null, {
    email: user.email,
    password,
  });

  reply.status(201);
  return user;
}
