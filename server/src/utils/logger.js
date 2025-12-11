/**
 * Secure logging utility
 * Only logs in development mode to prevent sensitive data leaks in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Sensitive fields to redact from logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'stripeCustomerId',
  'stripeSubscriptionId',
  'email',
  'stripe-signature'
];

/**
 * Sanitize object by redacting sensitive fields
 */
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitize(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};

/**
 * Format log message with timestamp
 */
const formatMessage = (level, ...args) => {
  const timestamp = new Date().toISOString();
  const sanitizedArgs = args.map(arg =>
    typeof arg === 'object' ? sanitize(arg) : arg
  );
  return [`[${timestamp}] [${level}]`, ...sanitizedArgs];
};

const logger = {
  /**
   * Log info messages (only in development)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log(...formatMessage('INFO', ...args));
    }
  },

  /**
   * Log error messages (always logged, but sanitized in production)
   */
  error: (...args) => {
    if (isProduction) {
      // In production, only log the error message, not the full details
      console.error(...formatMessage('ERROR', args[0]));
    } else {
      console.error(...formatMessage('ERROR', ...args));
    }
  },

  /**
   * Log critical webhook events (always logged for debugging)
   */
  webhook: (...args) => {
    // Always log webhooks for debugging, but sanitize
    console.log(...formatMessage('WEBHOOK', ...args));
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...formatMessage('WARN', ...args));
    }
  },

  /**
   * Log success messages (only in development)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log(...formatMessage('SUCCESS', '✅', ...args));
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log(...formatMessage('DEBUG', ...args));
    }
  }
};

module.exports = logger;
