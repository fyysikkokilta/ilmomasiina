import { FastifyReply, FastifyRequest } from "fastify";
import { NotFound } from "http-errors";
import { eq } from "drizzle-orm";

import { AuditEvent, ErrorCode, UserPathParams } from "@tietokilta/ilmomasiina-models";
import { getDatabase, user } from "../../../models";
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
    } else if (request.sessionData.user === existingUser.id) {
      throw new CannotDeleteSelf("You can't delete your own user");
    } else {
      // Delete user
      await tx.delete(user as any).where(eq(user.id as any, request.params.id) as any);
      
      await request.logEvent(AuditEvent.DELETE_USER, {
        extra: {
          id: existingUser.id,
          email: existingUser.email,
        },
        transaction: tx,
      });
    }
  });

  reply.status(204);
}
