export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const badRequest = (msg = "Neispravan zahtev") => {
  throw new AppError(msg, 400);
};
export const unauthorized = (msg = "Neautorizovan pristup") => {
  throw new AppError(msg, 401);
};
export const forbidden = (msg = "Nemate dozvolu") => {
  throw new AppError(msg, 403);
};
export const notFound = (entitet = "Resurs") => {
  throw new AppError(`${entitet} nije pronađen`, 404);
};

export const notFoundHandler = (req, res, next) => {
  next(new AppError("Stranica nije pronađena", 404, true));
};

export const conflict = (msg = "Konflikt sa postojećim podacima") => {
  throw new AppError(msg, 409);
};
export const internalError = (msg = "Interna greška servera") => {
  throw new AppError(msg, 500, false);
};

export const buildErrorContext = (err, req, extra = {}) => ({
  statusCode: err.statusCode || 500,
  message: err.isOperational ? err.message : "Došlo je do greške",
  ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  isAuthenticated: !!req.session?.isLoggedIn,
  user: req.session?.user || null,
  role: req.session?.user?.role || "guest",
  path: req.originalUrl,
  ...extra,
});

export const globalErrorHandler = (err, req, res, next) => {
  console.error(`[${err.name || "Error"}] ${err.message}`);
  if (process.env.NODE_ENV === "development") console.error(err.stack);

  const context = buildErrorContext(err, req);
  res.status(context.statusCode).render("error/error", context);
};