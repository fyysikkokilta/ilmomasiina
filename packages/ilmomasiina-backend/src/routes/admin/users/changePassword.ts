import { FastifyReply, FastifyRequest } from "fastify";
import { NotFound } from "http-errors";
import { eq } from "drizzle-orm";

import { AuditEvent, ErrorCode, UserChangePasswordSchema } from "@tietokilta/ilmomasiina-models";
import AdminPasswordAuth from "../../../authentication/adminPasswordAuth";
import { db, user } from "../../../models";
import CustomError from "../../../util/customError";

class WrongOldPassword extends CustomError {
  constructor(message: string) {
    super(401, ErrorCode.WRONG_OLD_PASSWORD, message);
  }
}

export default async function changePassword(
  request: FastifyRequest<{ Body: UserChangePasswordSchema }>,
  reply: FastifyReply,
): Promise<void> {
  AdminPasswordAuth.validateNewPassword(request.body.newPassword);

  await db.transaction(async (transaction) => {
    // Try to fetch existing user
    const existing = await transaction
      .select({
        id: user.id,
        email: user.email,
        password: user.password,
      } as any)
      .from(user as any)
      .where(eq(user.id, request.sessionData.user) as any) as any;

    const existingUser = existing[0];

    if (!existingUser) {
      throw new NotFound("User does not exist");
    } else {
      // Verify old password
      if (!AdminPasswordAuth.verifyHash(request.body.oldPassword, existingUser.password)) {
        throw new WrongOldPassword("Incorrect password");
      }
      // Update user with a new password
      await transaction
        .update(user as any)
        .set({ password: AdminPasswordAuth.createHash(request.body.newPassword) })
        .where(eq(user.id, request.sessionData.user) as any);

      await request.logEvent(AuditEvent.CHANGE_PASSWORD, {
        extra: {
          id: existingUser.id,
          email: existingUser.email,
        },
        transaction,
      });
    }
  });

  reply.status(204);
}
