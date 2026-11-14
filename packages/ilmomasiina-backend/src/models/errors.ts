import { ErrorCode } from "@tietokilta/ilmomasiina-models";
import CustomError from "../util/customError";

export class EventValidationError extends CustomError {
  constructor(message: string, statusCode = 400) {
    super(statusCode, ErrorCode.EVENT_VALIDATION_ERROR, message);
  }
}

/** Postgres error code for a violated unique constraint. */
export const UNIQUE_VIOLATION = "23505";
/** Postgres error code for an exception raised by a trigger. */
export const RAISE_EXCEPTION = "P0001";

/** Finds the Postgres error code in an error thrown by a query, if any. */
export function databaseErrorCode(error: unknown): string | undefined {
  for (let current = error; current instanceof Error; current = current.cause) {
    if ("code" in current && typeof current.code === "string") return current.code;
  }
  return undefined;
}

/** Converts database constraint errors from saving an event to appropriate HTTP errors. */
export function convertEventDatabaseErrors(error: unknown) {
  if (databaseErrorCode(error) === UNIQUE_VIOLATION) {
    return new EventValidationError("slug must be unique", 409);
  }
  return error;
}
