import { createHash, createHmac } from "crypto";
import { FastifyRequest } from "fastify";

import type { SignupID, SignupPathParams } from "@tietokilta/ilmomasiina-models";
import { EDIT_TOKEN_HEADER, ErrorCode } from "@tietokilta/ilmomasiina-models";
import config from "../../config";
import CustomError from "../../util/customError";

function generateLegacyToken(signupId: SignupID): string {
  const data = Buffer.from(`${signupId}${config.oldEditTokenSalt}`, "utf-8");
  return createHash("md5").update(data).digest().toString("hex");
}

const BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

/** Returns the first `length` characters of `data` in lowercase base32 (RFC 4648), without padding. */
export function base32Prefix(data: Buffer, length: number) {
  const bits = Array.from(data, (byte) => byte.toString(2).padStart(8, "0")).join("");
  return Array.from(
    { length: Math.min(length, Math.ceil(bits.length / 5)) },
    (_, i) => BASE32_ALPHABET[parseInt(bits.slice(i * 5, i * 5 + 5).padEnd(5, "0"), 2)],
  ).join("");
}

export function generateToken(signupId: SignupID) {
  const key = Buffer.from(config.newEditTokenSecret, "utf-8");
  const data = Buffer.from(signupId, "utf-8");
  const mac = createHmac("sha256", key).update(data).digest();
  return base32Prefix(mac, 13);
}

function verifyToken(signupId: SignupID, token: string): boolean {
  let expectedToken;
  if (token && config.oldEditTokenSalt && token.length === 32) {
    expectedToken = generateLegacyToken(signupId);
  } else {
    expectedToken = generateToken(signupId);
  }
  return token === expectedToken;
}

class BadEditToken extends CustomError {
  constructor(message: string) {
    super(403, ErrorCode.BAD_EDIT_TOKEN, message);
  }
}

/**
 * A preHandler hook that validates signup edit token
 *
 * When the token is not valid, replies with a 403 request with a generic `invalid token`-like error message.
 * The request processing ends here, and the actual route function won't be called.
 */
export async function requireValidEditToken(request: FastifyRequest<{ Params: SignupPathParams }>) {
  // Fastify converts header names into lower case
  const headers = request.headers[EDIT_TOKEN_HEADER.toLowerCase()];
  const header = Array.isArray(headers) ? headers[0] : headers;
  if (verifyToken(request.params.id, header || "")) return;

  // Default to 403 response
  throw new BadEditToken("Invalid editToken");
}
