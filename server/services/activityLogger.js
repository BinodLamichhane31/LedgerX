const ActivityLog = require("../models/ActivityLog");
const logger = require("../utils/logger"); // Winston logger for system errors

/**
 * Logs a user activity to the database.
 * @param {Object} params - The parameters for logging.
 * @param {Object} params.req - The Express request object (optional, for IP/UserAgent).
 * @param {string} params.userId - The ID of the user performing the action (optional).
 * @param {string} params.action - The action performed (e.g., 'LOGIN', 'CREATE_TRANSACTION').
 * @param {string} params.module - The module where the action occurred (e.g., 'Auth', 'Transactions').
 * @param {Object} params.metadata - Additional details about the action (optional).
 * @param {string} params.level - Log level (default: 'info').
 */
const logActivity = async ({ req, userId, action, module, metadata = {}, level = 'info' }) => {
    try {
        let ip_address = '';
        let user_agent = '';

        if (req) {
            ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            user_agent = req.headers['user-agent'] || '';
        }

        // Mask PII in metadata
        const maskedMetadata = { ...metadata };
        if (maskedMetadata.email) {
            maskedMetadata.email = maskedMetadata.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
        }
        if (maskedMetadata.phone) {
            maskedMetadata.phone = maskedMetadata.phone.replace(/(\d{3})\d+(\d{2})/, '$1*****$2');
        }
        
        // Create log entry
        await ActivityLog.create({
            user_id: userId || (req?.user ? req.user.id : null),
            action,
            module,
            metadata: maskedMetadata,
            ip_address,
            user_agent,
            created_at: new Date()
        });

        // Also log to system logger (Winston) for debugging/text logs
        logger.info(`[Activity] [${module}] ${action} by User:${userId || 'Guest'} - ${JSON.stringify(maskedMetadata)}`);

    } catch (error) {
        // Silent fail to avoid breaking the main application flow
        // But log the failure to system logger
        logger.error(`Failed to log activity: ${error.message}`, { action, module, userId });
    }
};

module.exports = { logActivity };
