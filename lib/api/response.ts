import { NextResponse } from "next/server";
import { AppError, isAppError, isError } from "@/lib/errors/AppError";

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, statusCode: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: unknown,
  defaultStatusCode: number = 500
) {
  let statusCode = defaultStatusCode;
  let code = "INTERNAL_ERROR";
  let message = "An unexpected error occurred";
  let details: unknown;

  if (isAppError(error)) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (isError(error)) {
    message = error.message;
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === "development" && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandling(
  handler: (req: any) => Promise<NextResponse>
) {
  return async (req: any) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error("API Error:", error);
      return errorResponse(error);
    }
  };
}
