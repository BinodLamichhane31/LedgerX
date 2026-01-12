const cron = require("node-cron");
const ActivityLog = require("../models/ActivityLog");
const logger = require("../utils/logger");

const startLogCleanupJob = () => {
    // Run every day at midnight: 0 0 * * *
    cron.schedule("0 0 * * *", async () => {
        logger.info("[Cron] Starting log cleanup job...");
        try {
            // Retention policy:
            // 1. Normal logs: keep for 90 days
            // 2. Security logs (Login Failed, Roles, etc): keep for 365 days
            
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const oneYearAgo = new Date();
            oneYearAgo.setDate(oneYearAgo.getDate() - 365);

            // Delete normal logs older than 90 days
            const normalLogsResult = await ActivityLog.deleteMany({
                created_at: { $lt: ninetyDaysAgo },
                action: { 
                    $nin: ['LOGIN_FAILED', 'USER_ROLE_CHANGED', 'USER_DELETED', 'PASSWORD_CHANGED', 'ACCOUNT_LOCKED'] 
                }
            });

            // Delete security logs older than 1 year
            const securityLogsResult = await ActivityLog.deleteMany({
                created_at: { $lt: oneYearAgo },
                action: { 
                    $in: ['LOGIN_FAILED', 'USER_ROLE_CHANGED', 'USER_DELETED', 'PASSWORD_CHANGED', 'ACCOUNT_LOCKED'] 
                }
            });

            if (normalLogsResult.deletedCount > 0 || securityLogsResult.deletedCount > 0) {
                logger.info(`[Cron] Log cleanup complete. Deleted ${normalLogsResult.deletedCount} normal logs and ${securityLogsResult.deletedCount} security logs.`);
            } else {
                logger.info("[Cron] No logs to clean up.");
            }

        } catch (error) {
            logger.error(`[Cron] Log cleanup failed: ${error.message}`);
        }
    });
};

module.exports = startLogCleanupJob;
