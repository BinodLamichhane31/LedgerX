const logger = require('./logger');
const { logActivity } = require('../services/activityLogger');

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
 * @param {Object} req - Request object (optional)
 */
const logPasswordChangeAttempt = async (userId, email, success, reason = null, req = null) => {
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
    await logActivity({
        req,
        userId,
        action: 'PASSWORD_CHANGE_SUCCESS',
        module: 'Auth',
        metadata: { email }
    });
  } else {
    logger.warn('Password change failed', logData);
    await logActivity({
        req,
        userId,
        action: 'PASSWORD_CHANGE_FAILED',
        module: 'Auth',
        metadata: { email, reason },
        level: 'warn'
    });
  }
};

/**
 * Log password reuse attempt
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {Object} req - Request object (optional)
 */
const logPasswordReuseAttempt = async (userId, email, req = null) => {
  logger.warn('Password reuse attempt detected', {
    action: 'PASSWORD_REUSE_ATTEMPT',
    userId,
    email,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    userId,
    action: 'PASSWORD_REUSE_ATTEMPT',
    module: 'Auth',
    metadata: { email },
    level: 'warn'
  });
};

/**
 * Log login attempt with expired password
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {Object} req - Request object (optional)
 */
const logExpiredPasswordLogin = async (userId, email, req = null) => {
  logger.warn('Login attempt with expired password', {
    action: 'EXPIRED_PASSWORD_LOGIN',
    userId,
    email,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    userId,
    action: 'LOGIN_FAILED_EXPIRED_PASSWORD',
    module: 'Auth',
    metadata: { email },
    level: 'warn'
  });
};

/**
 * Log failed login attempt
 * @param {string} email - Email used in login attempt
 * @param {string} reason - Generic reason for failure
 * @param {Object} req - Request object (optional)
 */
const logFailedLogin = async (email, reason, req = null) => {
  logger.warn('Failed login attempt', {
    action: 'FAILED_LOGIN',
    email,
    reason,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    action: 'LOGIN_FAILED',
    module: 'Auth',
    metadata: { email, reason },
    level: 'warn'
  });
};

/**
 * Log successful login
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {Object} req - Request object (optional)
 */
const logSuccessfulLogin = async (userId, email, req = null) => {
  logger.info('Successful login', {
    action: 'SUCCESSFUL_LOGIN',
    userId,
    email,
    timestamp: new Date().toISOString()
  });

  // Note: logActivity for SUCCESSFUL_LOGIN is typically handled in the controller
  // But we can add it here if it's not consistent. 
  // Checking authController, it already calls logActivity for LOGIN_SUCCESS.
  // So we might skip it here to avoid duplicates, OR update authController to use this.
  // For now, keeping it consistent with file logs only unless explicitly asked to replace.
  // However, the goal is to make sure logs are in the system. 
  // Since authController calls logActivity manually, we will let it be for success.
};

/**
 * Log suspicious activity
 * @param {string} activity - Description of suspicious activity
 * @param {object} metadata - Additional metadata (no sensitive data)
 * @param {Object} req - Request object (optional)
 */
const logSuspiciousActivity = async (activity, metadata = {}, req = null) => {
  logger.warn('Suspicious activity detected', {
    action: 'SUSPICIOUS_ACTIVITY',
    activity,
    ...metadata,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    action: 'SUSPICIOUS_ACTIVITY',
    module: 'Security',
    metadata: { activity, ...metadata },
    level: 'warn'
  });
};

/**
 * Log common/weak password attempt
 * @param {string} password - The attempted password (masked in logs)
 * @param {string} matchType - Type of match (EXACT, CASE_INSENSITIVE, etc.)
 * @param {Object} req - Request object (optional)
 */
const logCommonPasswordAttempt = async (password, matchType, req = null) => {
  logger.warn('Common password usage attempt', {
    action: 'COMMON_PASSWORD_ATTEMPT',
    matchType,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    action: 'COMMON_PASSWORD_ATTEMPT',
    module: 'Security',
    metadata: { matchType },
    level: 'warn'
  });
};

module.exports = {
  logPasswordChangeAttempt,
  logPasswordReuseAttempt,
  logExpiredPasswordLogin,
  logFailedLogin,
  logSuccessfulLogin,
  logSuspiciousActivity,
  logCommonPasswordAttempt
};


const logPasswordChanged = async (userId, email, req = null) => {
  logger.info('Password changed - securityStamp updated', {
    action: 'PASSWORD_CHANGED',
    userId,
    email,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    userId,
    action: 'PASSWORD_CHANGED',
    module: 'Auth',
    metadata: { email }
  });
};


const logMfaDisabled = async (userId, email, req = null) => {
  logger.info('MFA disabled - securityStamp updated', {
    action: 'MFA_DISABLED',
    userId,
    email,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    userId,
    action: 'MFA_DISABLED',
    module: 'Auth',
    metadata: { email }
  });
};


const logRefreshReuseDetected = async (userId, ip, req = null) => {
  logger.error('Refresh token reuse detected - revoking all sessions', {
    action: 'REFRESH_REUSE_DETECTED',
    userId,
    ip,
    timestamp: new Date().toISOString()
  });

  await logActivity({
    req,
    userId,
    action: 'REFRESH_REUSE_DETECTED',
    module: 'Auth',
    metadata: { ip },
    level: 'error'
  });
};

module.exports = {
  logPasswordChangeAttempt,
  logPasswordReuseAttempt,
  logExpiredPasswordLogin,
  logFailedLogin,
  logSuccessfulLogin,
  logSuspiciousActivity,
  logCommonPasswordAttempt,
  logPasswordChanged,
  logMfaDisabled,
  logRefreshReuseDetected
};
