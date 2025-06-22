import { FastifyReply, FastifyRequest } from "fastify";
import { Conflict } from "http-errors";
import { eq } from "drizzle-orm";

import type { UserCreateSchema, UserInviteSchema, UserSchema } from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import { AuditLogger } from "../../../auditlog";
import AdminPasswordAuth from "../../../authentication/adminPasswordAuth";
import EmailService from "../../../mail";
import { db, user } from "../../../models";
import generatePassword from "./generatePassword";

/**
 * Private helper function to create a new user and save it to the database
 *
 * @param params user parameters
 * @param auditLogger audit logger function from the originating request
 */
export async function createUser(
  params: UserCreateSchema,
  auditLogger: AuditLogger,
  transaction: any,
): Promise<UserSchema> {
  const existing = await transaction
    .select()
    .from(user as any)
    .where(eq(user.email, params.email) as any) as any;

  if (existing.length > 0) throw new Conflict("User with given email already exists");

  // Create new user with hashed password
  const [newUser] = await transaction
    .insert(user as any)
    .values({
      ...params,
      password: AdminPasswordAuth.createHash(params.password),
    })
    .returning({ id: user.id, email: user.email } as any) as any;

  const res = {
    id: newUser.id,
    email: newUser.email,
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

  const newUser = await db.transaction(async (transaction) =>
    createUser(
      {
        email: request.body.email,
        password,
      },
      request.logEvent,
      transaction,
    ),
  );

  // Send invitation mail
  await EmailService.sendNewUserMail(newUser.email, null, {
    email: newUser.email,
    password,
  });

  reply.status(201);
  return newUser;
}
