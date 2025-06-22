import { FastifyReply, FastifyRequest } from "fastify";
import { NotFound } from "http-errors";
import { eq } from "drizzle-orm";

import type { UserPathParams } from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import AdminPasswordAuth from "../../../authentication/adminPasswordAuth";
import EmailService from "../../../mail";
import { db, user } from "../../../models";
import generatePassword from "./generatePassword";

export default async function resetPassword(
  request: FastifyRequest<{ Params: UserPathParams }>,
  reply: FastifyReply,
): Promise<void> {
  await db.transaction(async (transaction) => {
    // Try to fetch existing user
    const existing = await transaction
      .select({
        id: user.id,
        email: user.email,
      } as any)
      .from(user as any)
      .where(eq(user.id, request.params.id) as any) as any;

    const existingUser = existing[0];

    if (!existingUser) {
      throw new NotFound("User does not exist");
    } else {
      // Update user with a new password
      const newPassword = generatePassword();
      await transaction
        .update(user as any)
        .set({ password: AdminPasswordAuth.createHash(newPassword) })
        .where(eq(user.id, request.params.id) as any);

      await request.logEvent(AuditEvent.RESET_PASSWORD, {
        extra: {
          id: existingUser.id,
          email: existingUser.email,
        },
        transaction,
      });

      await EmailService.sendResetPasswordMail(existingUser.email, null, {
        email: existingUser.email,
        password: newPassword,
      });
    }
  });

  reply.status(204);
}
