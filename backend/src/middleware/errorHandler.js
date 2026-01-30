/**
 * Error Handling Middleware
 * 
 * WHY: Centralized error handling ensures consistent API responses
 * and prevents leaking sensitive information in production.
 * We log full errors server-side but send sanitized messages to clients.
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route not found: ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Global error handler
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Log error details (full error for debugging)
  console.error('Error:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode || 500,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Determine error code
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Prepare error message (sanitize in production)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment 
    ? err.message 
    : statusCode === 500 
      ? 'Internal server error' 
      : err.message;

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    code: errorCode,
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Async handler wrapper
 * Automatically catches errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default globalErrorHandler;
