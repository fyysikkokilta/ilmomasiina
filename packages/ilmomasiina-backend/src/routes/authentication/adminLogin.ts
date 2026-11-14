import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { HttpError, Unauthorized } from "http-errors";

import type { AdminLoginBody, AdminLoginResponse } from "@tietokilta/ilmomasiina-models";
import AdminAuthSession, { AdminTokenData } from "../../authentication/adminAuthSession";
import AdminPasswordAuth from "../../authentication/adminPasswordAuth";
import { getDb } from "../../db";
import CustomError from "../../util/customError";

export async function adminLogin(
  request: FastifyRequest<{ Body: AdminLoginBody }>,
  reply: FastifyReply,
): Promise<AdminLoginResponse> {
  // Verify user
  const user = await getDb().query.user.findFirst({
    where: { email: request.body.email },
    columns: { id: true, password: true, email: true },
  });

  // Verify password
  if (!user || !AdminPasswordAuth.verifyHash(request.body.password, user.password)) {
    // Mitigate user enumeration by timing: waste some time if we didn't actually verify a password
    if (!user) AdminPasswordAuth.createHash("hunter2");
    throw new Unauthorized("Invalid email or password");
  }

  // Authentication success -> generate auth token
  const accessToken = request.server.adminSession.createSession(user);
  reply.status(200);
  return { accessToken };
}

export async function renewAdminToken(request: FastifyRequest, reply: FastifyReply): Promise<AdminLoginResponse> {
  // Verify existing token
  const sessionData = request.server.adminSession.verifySession(request);

  // Verify that the user exists
  const user = await getDb().query.user.findFirst({ where: { id: sessionData.user } });
  if (!user) {
    throw new Unauthorized("User no longer exists");
  }

  // Create a new one
  const accessToken = request.server.adminSession.createSession(user);
  reply.status(200);
  return { accessToken };
}

/** Adds a request hook that verifies the user's session and raises a 401 error if invalid. */
export function requireAdmin(session: AdminAuthSession, fastify: FastifyInstance): void {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply) => {
    try {
      // Validate session & decorate request with session data
      // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- the cast drops readonly, which tsc needs
      (request.sessionData as AdminTokenData | undefined) = session.verifySession(request);
    } catch (err) {
      // Throwing inside hook is not safe, so the errors must be converted to actual reply here
      fastify.log.error(err);
      if (err instanceof HttpError || err instanceof CustomError) {
        reply.code(err.statusCode).send(err);
      } else {
        reply.internalServerError("Session validation failed");
      }
    }
  });
}

declare module "fastify" {
  interface FastifyRequest {
    readonly sessionData?: AdminTokenData;
  }
}
