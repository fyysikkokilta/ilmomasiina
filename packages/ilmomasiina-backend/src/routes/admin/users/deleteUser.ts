import { FastifyReply, FastifyRequest } from "fastify";
import { NotFound } from "http-errors";
import { eq } from "drizzle-orm";

import { AuditEvent, ErrorCode, UserPathParams } from "@tietokilta/ilmomasiina-models";
import { db, user } from "../../../models";
import CustomError from "../../../util/customError";

class CannotDeleteSelf extends CustomError {
  constructor(message: string) {
    super(403, ErrorCode.CANNOT_DELETE_SELF, message);
  }
}

export default async function deleteUser(
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
    } else if (request.sessionData.user === existingUser.id) {
      throw new CannotDeleteSelf("You can't delete your own user");
    } else {
      // Delete user
      await transaction
        .delete(user as any)
        .where(eq(user.id, request.params.id) as any);
      
      await request.logEvent(AuditEvent.DELETE_USER, {
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
