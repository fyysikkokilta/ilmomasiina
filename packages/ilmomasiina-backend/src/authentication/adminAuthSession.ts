import { createSigner, createVerifier, SignerSync, VerifierSync } from "fast-jwt";
import { FastifyRequest } from "fastify";

import type { UserID, UserSchema } from "@tietokilta/ilmomasiina-models";
import config from "../config";
import type { User } from "../models/user";
import { BadSession } from "./errors";

export interface AdminTokenData {
  user: UserID;
  email: UserSchema["email"];
}

export default class AdminAuthSession {
  /** Session lifetime in seconds */
  static TTL = config.nodeEnv === "development" ? 365 * 24 * 60 * 60 : 60 * 60 * 3;

  private readonly sign: typeof SignerSync;
  private readonly verify: typeof VerifierSync;

  constructor(secret: string) {
    this.sign = createSigner({
      key: secret,
      expiresIn: AdminAuthSession.TTL * 1000,
    });
    this.verify = createVerifier({
      key: secret,
      maxAge: AdminAuthSession.TTL * 1000,
    });
  }

  /**
   * Creates a session token (JWT)
   *
   * @param userData admin user information to be included into the token
   */
  createSession(user: Pick<User, "id" | "email">): string {
    return this.sign({ user: user.id, email: user.email });
  }

  /**
   * Verifies the incoming request authorization.
   * Throws a BadSession error if session is not valid.
   *
   * @param request incoming request
   */
  verifySession(request: FastifyRequest): AdminTokenData {
    const header = request.headers.authorization; // Yes, Fastify converts header names to lowercase :D

    if (!header) {
      throw new BadSession("Missing Authorization header");
    }

    const token = Array.isArray(header) ? String(header[0]) : header;

    try {
      // Try to verify token
      const data: unknown = this.verify(token);
      if (typeof data !== "object" || data === null || !("user" in data) || typeof data.user !== "number") {
        throw new BadSession("Invalid session");
      }
      const email = "email" in data && typeof data.email === "string" ? data.email : "";
      return { user: data.user, email };
    } catch {
      throw new BadSession("Invalid session");
    }
  }
}
