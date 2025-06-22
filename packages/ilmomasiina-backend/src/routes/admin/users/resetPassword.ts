import { FastifyReply, FastifyRequest } from "fastify";
import { NotFound } from "http-errors";
import { eq } from "drizzle-orm";

import type { UserPathParams } from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import AdminPasswordAuth from "../../../authentication/adminPasswordAuth";
import EmailService from "../../../mail";
import { getDatabase, user } from "../../../models";
import generatePassword from "./generatePassword";

export default async function resetPassword(
  request: FastifyRequest<{ Params: UserPathParams }>,
  reply: FastifyReply,
): Promise<void> {
  const db = getDatabase();
  
  await db.transaction(async (tx) => {
    // Try to fetch existing user
    const existing = await tx
      .select({
        id: user.id as any,
        email: user.email as any,
      })
      .from(user as any)
      .where(eq(user.id as any, request.params.id) as any);

    const existingUser = existing[0];

    if (!existingUser) {
      throw new NotFound("User does not exist");
    } else {
      // Update user with a new password
      const newPassword = generatePassword();
      await tx
        .update(user as any)
        .set({ password: AdminPasswordAuth.createHash(newPassword) })
        .where(eq(user.id as any, request.params.id) as any);

      await request.logEvent(AuditEvent.RESET_PASSWORD, {
        extra: {
          id: existingUser.id,
          email: existingUser.email,
        },
        transaction: tx,
      });

      await EmailService.sendResetPasswordMail(existingUser.email, null, {
        email: existingUser.email,
        password: newPassword,
      });
    }
  });

  reply.status(204);
}
