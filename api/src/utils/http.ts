export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = "APP_ERROR",
  ) {
    super(message);
  }
}

export const notFound = (message = "Resource not found") => new AppError(404, message, "NOT_FOUND");
