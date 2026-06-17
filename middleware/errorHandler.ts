import type { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("❌ Error:", err instanceof Error ? err.message : "Unknown error");

  const status = 500;
  const message = err instanceof Error ? err.message : "Internal server error";

  res.status(status).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? (err instanceof Error ? err.stack : String(err)) : undefined,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: "Not found",
    details: "The requested resource does not exist",
  });
};
