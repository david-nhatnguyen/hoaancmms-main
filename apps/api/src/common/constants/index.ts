/**
 * HTTP Status Messages
 *
 * Why use constants instead of hardcoded strings?
 * - Consistency across the app
 * - Easy to update in one place
 * - Type safety
 * - Easier to translate later (i18n)
 */
export const HTTP_MESSAGES = {
  // Success
  SUCCESS: 'Operation successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',

  // Errors
  BAD_REQUEST: 'Invalid request data',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',

  // Validation
  VALIDATION_ERROR: 'Validation failed',
  INVALID_CREDENTIALS: 'Invalid username or password',

  // Database
  DATABASE_ERROR: 'Database operation failed',
  DUPLICATE_ENTRY: 'Duplicate entry detected',
} as const;

/**
 * Error Codes
 *
 * Why custom error codes?
 * - Frontend can handle specific errors
 * - Better logging and debugging
 * - Easier to track error patterns
 */
export const ERROR_CODES = {
  // Auth
  AUTH_001: 'INVALID_CREDENTIALS',
  AUTH_002: 'TOKEN_EXPIRED',
  AUTH_003: 'TOKEN_INVALID',
  AUTH_004: 'INSUFFICIENT_PERMISSIONS',

  // Database
  DB_001: 'UNIQUE_CONSTRAINT_VIOLATION',
  DB_002: 'FOREIGN_KEY_VIOLATION',
  DB_003: 'RECORD_NOT_FOUND',

  // Validation
  VAL_001: 'INVALID_INPUT',
  VAL_002: 'MISSING_REQUIRED_FIELD',

  // File Upload
  FILE_001: 'FILE_TOO_LARGE',
  FILE_002: 'INVALID_FILE_TYPE',
  FILE_003: 'UPLOAD_FAILED',
} as const;

/**
 * Queue Names
 *
 * Why centralize queue names?
 * - Prevent typos
 * - Easy to see all queues in one place
 * - Type safety when using queues
 */
export const QUEUE_NAMES = {
  FILE_UPLOAD: 'file-upload',
  EXCEL_IMPORT: 'excel-import',
  EXCEL_EXPORT: 'excel-export',
  QR_CODE_GENERATION: 'qr-code-generation',
  EMAIL_NOTIFICATION: 'email-notification',
} as const;

/**
 * Cache Keys
 */
export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  FACTORY_PREFIX: 'factory:',
  EQUIPMENT_PREFIX: 'equipment:',
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
} as const;
