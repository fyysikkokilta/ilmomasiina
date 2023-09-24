import { ErrorCode } from '@tietokilta/ilmomasiina-models';

export default abstract class CustomError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  protected constructor(statusCode: number, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
