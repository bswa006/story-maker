import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'PAYMENT_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export class ApiError extends Error implements AppError {
  type: ErrorType;
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(type: ErrorType, message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Error response factory
export function createErrorResponse(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known error types
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          type: error.type,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: {
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              type: 'CONFLICT',
              message: 'Resource already exists',
              details: { field: error.meta?.target },
            },
          },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              type: 'NOT_FOUND',
              message: 'Resource not found',
            },
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: {
              type: 'DATABASE_ERROR',
              message: 'Database operation failed',
              details: process.env.NODE_ENV === 'development' ? { code: error.code } : undefined,
            },
          },
          { status: 500 }
        );
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          type: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : error.message,
        },
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: {
        type: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

// Common error factories
export const AuthenticationError = (message = 'Authentication required') =>
  new ApiError('AUTHENTICATION_ERROR', message, 401);

export const AuthorizationError = (message = 'Insufficient permissions') =>
  new ApiError('AUTHORIZATION_ERROR', message, 403);

export const NotFoundError = (resource: string) =>
  new ApiError('NOT_FOUND', `${resource} not found`, 404);

export const ValidationError = (message: string, details?: Record<string, unknown>) =>
  new ApiError('VALIDATION_ERROR', message, 400, details);

export const ConflictError = (message: string, details?: Record<string, unknown>) =>
  new ApiError('CONFLICT', message, 409, details);

export const RateLimitError = (message = 'Too many requests') =>
  new ApiError('RATE_LIMIT', message, 429);

export const PaymentError = (message: string, details?: Record<string, unknown>) =>
  new ApiError('PAYMENT_ERROR', message, 402, details);

export const ExternalServiceError = (service: string, message?: string) =>
  new ApiError(
    'EXTERNAL_SERVICE_ERROR',
    message || `${service} service error`,
    503
  );

// Async error wrapper for API routes
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}