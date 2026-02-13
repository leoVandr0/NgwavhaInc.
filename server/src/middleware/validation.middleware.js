import { validatePassword } from '../utils/passwordUtils.js';

/**
 * Middleware to validate password strength on registration
 */
export const validatePasswordMiddleware = (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }

    const validation = validatePassword(password);

    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Password does not meet security requirements',
            errors: validation.errors
        });
    }

    next();
};

/**
 * Middleware to sanitize user input
 */
export const sanitizeInput = (req, res, next) => {
    // Sanitize string inputs
    const sanitizeString = (str) => {
        if (typeof str === 'string') {
            // Remove potentially dangerous characters
            return str.trim().replace(/[<>]/g, '');
        }
        return str;
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
            return sanitizeString(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }

        const sanitized = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Skip sanitization for password fields
                if (key.toLowerCase().includes('password')) {
                    sanitized[key] = obj[key];
                } else {
                    sanitized[key] = sanitizeObject(obj[key]);
                }
            }
        }
        return sanitized;
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
};

/**
 * Middleware for rate limiting (simplified - in production, use Redis)
 */
const attempts = new Map();

export const rateLimitMiddleware = (maxAttempts = 5, windowMs = 60000) => {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        // Clean up old entries
        for (let [k, v] of attempts) {
            if (now - v.timestamp > windowMs) {
                attempts.delete(k);
            }
        }

        // Check current attempts
        const currentAttempt = attempts.get(key);

        if (currentAttempt) {
            if (currentAttempt.count >= maxAttempts) {
                const timeLeft = Math.ceil((windowMs - (now - currentAttempt.timestamp)) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Too many attempts. Please try again in ${timeLeft} seconds.`,
                    retryAfter: timeLeft
                });
            }
            currentAttempt.count++;
        } else {
            attempts.set(key, { count: 1, timestamp: now });
        }

        next();
    };
};

/**
 * Reset rate limit for a specific IP
 */
export const resetRateLimit = (ip) => {
    attempts.delete(ip);
};

export default {
    validatePasswordMiddleware,
    sanitizeInput,
    rateLimitMiddleware,
    resetRateLimit
};
