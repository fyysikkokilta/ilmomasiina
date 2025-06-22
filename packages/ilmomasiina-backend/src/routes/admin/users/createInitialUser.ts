/* eslint-disable max-classes-per-file */
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { count } from "drizzle-orm";

import { AdminLoginResponse, ErrorCode, UserCreateSchema } from "@tietokilta/ilmomasiina-models";
import AdminAuthSession from "../../../authentication/adminAuthSession";
import AdminPasswordAuth from "../../../authentication/adminPasswordAuth";
import { db, user } from "../../../models";
import CustomError from "../../../util/customError";
import { createUser } from "./inviteUser";

export class InitialSetupNeeded extends CustomError {
  constructor(message: string) {
    super(418, ErrorCode.INITIAL_SETUP_NEEDED, message);
  }
}

export class InitialSetupAlreadyDone extends CustomError {
  constructor(message: string) {
    super(409, ErrorCode.INITIAL_SETUP_ALREADY_DONE, message);
  }
}

export async function isInitialSetupDone(transaction?: any) {
  const dbToUse = transaction || db;
  const result = await dbToUse.select({ count: count() }).from(user as any) as any;
  return result[0].count > 0;
}

/**
 * Creates a new (admin) user and logs them in
 *
 * Supposed to be used only for initial user creation.
 * For additional users, use {@link inviteUser} instead.
 */
export default function createInitialUser(session: AdminAuthSession) {
  return async function handler(
    this: FastifyInstance<any, any, any, any, any>,
    request: FastifyRequest<{ Body: UserCreateSchema }>,
    reply: FastifyReply,
  ): Promise<AdminLoginResponse> {
    AdminPasswordAuth.validateNewPassword(request.body.password);

    const newUser = await db.transaction(async (transaction) => {
      if (await isInitialSetupDone(transaction)) {
        throw new InitialSetupAlreadyDone("The initial admin user has already been created.");
      }
      return createUser(request.body, request.logEvent, transaction);
    });

    const accessToken = session.createSession({
      user: newUser.id,
      email: newUser.email,
    });

    // Stop raising errors on requests to event list
    this.initialSetupDone = true;

    reply.status(201);
    return { accessToken };
  };
}
