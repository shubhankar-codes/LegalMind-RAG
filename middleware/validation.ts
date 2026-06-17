import type { Request, Response, NextFunction } from "express";

/**
 * Validates that request body contains required fields
 */
export const validateQueryRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { question, userConsent } = req.body;

  // Check if question exists and is a non-empty string
  if (!question || typeof question !== "string") {
    res.status(400).json({
      success: false,
      error: "Invalid request",
      details: "Question must be a non-empty string",
    });
    return;
  }

  // Check if question is too short or too long
  if (question.trim().length < 10) {
    res.status(400).json({
      success: false,
      error: "Question too short",
      details: "Question must be at least 10 characters long",
    });
    return;
  }

  if (question.length > 2000) {
    res.status(400).json({
      success: false,
      error: "Question too long",
      details: "Question must not exceed 2000 characters",
    });
    return;
  }

  // Check if userConsent is a boolean
  if (userConsent !== undefined && typeof userConsent !== "boolean") {
    res.status(400).json({
      success: false,
      error: "Invalid request",
      details: "userConsent must be a boolean",
    });
    return;
  }

  next();
};

/**
 * Sanitizes user input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Validates API request content type
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  const contentType = req.get("content-type");

  if (req.method !== "GET" && contentType && !contentType.includes("application/json")) {
    res.status(400).json({
      success: false,
      error: "Invalid content type",
      details: "Content-Type must be application/json",
    });
    return;
  }

  next();
};

/**
 * Error response formatter
 */
export const formatErrorResponse = (error: unknown) => {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred",
  };
};
