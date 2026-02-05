import { sequelize } from '../config/mysql.js';
import { User, Course } from '../models/index.js';

// @desc    Basic health check
// @route   GET /api/health
// @access  Public
export const basicHealthCheck = async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Basic server response
        const responseTime = Date.now() - startTime;
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
};

// @desc    Database health check
// @route   GET /api/health/database
// @access  Public
export const databaseHealthCheck = async (req, res) => {
    const startTime = Date.now();
    
    try {
        // Test database connection
        await sequelize.authenticate();
        
        // Test basic query
        const userCount = await User.count();
        const courseCount = await Course.count();
        
        const responseTime = Date.now() - startTime;
        
        res.json({
            status: 'healthy',
            database: 'mysql',
            connection: 'connected',
            responseTime: `${responseTime}ms`,
            stats: {
                users: userCount,
                courses: courseCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'mysql',
            connection: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// @desc    Authentication service health check
// @route   GET /api/health/auth
// @access  Public
export const authHealthCheck = async (req, res) => {
    try {
        // Check if JWT secret is configured
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                status: 'unhealthy',
                service: 'authentication',
                issue: 'JWT secret not configured',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            status: 'healthy',
            service: 'authentication',
            jwt: 'configured',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'authentication',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// @desc    Payment services health check
// @route   GET /api/health/payments
// @access  Public
export const paymentsHealthCheck = async (req, res) => {
    try {
        const checks = [];
        
        // Check Stripe configuration
        const stripeSecret = process.env.STRIPE_SECRET_KEY;
        const stripePublishable = process.env.STRIPE_PUBLISHABLE_KEY;
        
        if (stripeSecret && stripePublishable) {
            checks.push({
                service: 'stripe',
                status: 'configured',
                mode: stripeSecret.startsWith('sk_test') ? 'test' : 'live'
            });
        } else {
            checks.push({
                service: 'stripe',
                status: 'not configured'
            });
        }
        
        // Check PayNow configuration
        const paynowId = process.env.PAYNOW_INTEGRATION_ID;
        const paynowKey = process.env.PAYNOW_INTEGRATION_KEY;
        
        if (paynowId && paynowKey) {
            checks.push({
                service: 'paynow',
                status: 'configured'
            });
        } else {
            checks.push({
                service: 'paynow',
                status: 'not configured'
            });
        }
        
        const allConfigured = checks.every(check => check.status === 'configured');
        
        res.json({
            status: allConfigured ? 'healthy' : 'degraded',
            services: checks,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'payments',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// @desc    File upload service health check
// @route   GET /api/health/uploads
// @access  Public
export const uploadsHealthCheck = async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Check if upload directory exists and is writable
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        
        try {
            await fs.access(uploadPath, fs.constants.W_OK);
            
            // Check available disk space (simplified check)
            const stats = await fs.stat(uploadPath);
            
            res.json({
                status: 'healthy',
                service: 'uploads',
                path: uploadPath,
                writable: true,
                timestamp: new Date().toISOString()
            });
        } catch (accessError) {
            res.status(500).json({
                status: 'unhealthy',
                service: 'uploads',
                path: uploadPath,
                writable: false,
                error: accessError.message,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'uploads',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// @desc    Comprehensive system health check
// @route   GET /api/health/full
// @access  Public
export const fullHealthCheck = async (req, res) => {
    const startTime = Date.now();
    const results = {};
    
    try {
        // Check all services
        const checks = await Promise.allSettled([
            basicHealthCheck(req, res).then(r => r.json()).catch(e => ({ status: 'unhealthy', error: e.message })),
            databaseHealthCheck(req, res).then(r => r.json()).catch(e => ({ status: 'unhealthy', error: e.message })),
            authHealthCheck(req, res).then(r => r.json()).catch(e => ({ status: 'unhealthy', error: e.message })),
            paymentsHealthCheck(req, res).then(r => r.json()).catch(e => ({ status: 'unhealthy', error: e.message })),
            uploadsHealthCheck(req, res).then(r => r.json()).catch(e => ({ status: 'unhealthy', error: e.message }))
        ]);
        
        const responseTime = Date.now() - startTime;
        
        results.overall = {
            status: checks.every(c => c.value?.status === 'healthy') ? 'healthy' : 'degraded',
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
        
        results.services = checks.map((check, index) => {
            const serviceNames = ['api', 'database', 'auth', 'payments', 'uploads'];
            return {
                name: serviceNames[index],
                ...check.value
            };
        });
        
        res.json(results);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
