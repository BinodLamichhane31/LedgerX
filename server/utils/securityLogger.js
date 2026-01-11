const logger = require('./logger');

/**
 * Security logger for password-related activities
 * All functions ensure no sensitive data (passwords, hashes) are logged
 */

/**
 * Log password change attempt
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {boolean} success - Whether the change was successful
 * @param {string} reason - Generic reason for failure (if applicable)
 */
const logPasswordChangeAttempt = (userId, email, success, reason = null) => {
  const logData = {
    action: 'PASSWORD_CHANGE',
    userId,
    email,
    success,
    timestamp: new Date().toISOString()
  };

  if (!success && reason) {
    logData.reason = reason;
  }

  if (success) {
    logger.info('Password change successful', logData);
  } else {
    logger.warn('Password change failed', logData);
  }
};

/**
 * Log password reuse attempt
 * @param {string} userId - User ID
 * @param {string} email - User email
 */
const logPasswordReuseAttempt = (userId, email) => {
  logger.warn('Password reuse attempt detected', {
    action: 'PASSWORD_REUSE_ATTEMPT',
    userId,
    email,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log login attempt with expired password
 * @param {string} userId - User ID
 * @param {string} email - User email
 */
const logExpiredPasswordLogin = (userId, email) => {
  logger.warn('Login attempt with expired password', {
    action: 'EXPIRED_PASSWORD_LOGIN',
    userId,
    email,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log failed login attempt
 * @param {string} email - Email used in login attempt
 * @param {string} reason - Generic reason for failure
 */
const logFailedLogin = (email, reason) => {
  logger.warn('Failed login attempt', {
    action: 'FAILED_LOGIN',
    email,
    reason,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log successful login
 * @param {string} userId - User ID
 * @param {string} email - User email
 */
const logSuccessfulLogin = (userId, email) => {
  logger.info('Successful login', {
    action: 'SUCCESSFUL_LOGIN',
    userId,
    email,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log suspicious activity
 * @param {string} activity - Description of suspicious activity
 * @param {object} metadata - Additional metadata (no sensitive data)
 */
const logSuspiciousActivity = (activity, metadata = {}) => {
  logger.warn('Suspicious activity detected', {
    action: 'SUSPICIOUS_ACTIVITY',
    activity,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logPasswordChangeAttempt,
  logPasswordReuseAttempt,
  logExpiredPasswordLogin,
  logFailedLogin,
  logSuccessfulLogin,
  logSuspiciousActivity
};
