import Log from '../models/nosql/Log.js';
import Activity from '../models/nosql/Activity.js';

/**
 * System Logger
 */
export const dbLog = async (level, context, message, metadata = {}) => {
    try {
        await Log.create({
            level,
            context,
            message,
            metadata
        });
    } catch (error) {
        console.error('Failed to save log to DB:', error);
        // Fallback to console if DB fails
        console.log(`[${level.toUpperCase()}] [${context}] ${message}`, metadata);
    }
};

/**
 * Activity Tracker
 */
export const trackActivity = async ({
    userId,
    action,
    resourceType,
    resourceId,
    details = {},
    req = null
}) => {
    try {
        const activityData = {
            userId,
            action,
            resourceType,
            resourceId,
            details,
            timestamp: new Date()
        };

        if (req) {
            activityData.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            activityData.userAgent = req.headers['user-agent'];
        }

        await Activity.create(activityData);
    } catch (error) {
        console.error('Failed to track activity:', error);
        // We usually don't want to crash the request if activity tracking fails
    }
};

export const logger = {
    info: (context, message, metadata) => dbLog('info', context, message, metadata),
    warn: (context, message, metadata) => dbLog('warn', context, message, metadata),
    error: (context, message, metadata) => dbLog('error', context, message, metadata),
    debug: (context, message, metadata) => dbLog('debug', context, message, metadata),
    track: trackActivity
};

export default logger;
