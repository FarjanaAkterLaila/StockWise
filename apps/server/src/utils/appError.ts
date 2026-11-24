export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized access") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden access") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new AppError(message, 409, "CONFLICT");
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(message, 422, "UNPROCESSABLE_ENTITY", details);
  }
}
