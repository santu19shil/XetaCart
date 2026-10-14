const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Invalid input data',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  SERVER_ERROR: 'Internal server error',
  DB_PERMISSION: 'Database access denied',
  DB_CONSTRAINT: 'Data constraint violation',
};

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (error, res) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  }

  if (error.code) {
    switch (error.code) {
      case '23505':
        return res.status(409).json({ message: ERROR_MESSAGES.CONFLICT, code: 'CONFLICT' });
      case '42501':
      case '42P01':
        return res.status(500).json({ message: ERROR_MESSAGES.DB_PERMISSION, code: 'DB_PERMISSION' });
      case '22P02':
        return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION_ERROR, code: 'VALIDATION_ERROR' });
      default:
        return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR, code: 'SERVER_ERROR' });
    }
  }

  return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR, code: 'SERVER_ERROR' });
};

module.exports = { AppError, handleError, ERROR_MESSAGES };