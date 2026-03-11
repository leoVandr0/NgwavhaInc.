import express from 'express';
import {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    googleAuthCallback,
    refreshToken,
} from '../controllers/auth.controller.js';
import passport from 'passport';
import { protect } from '../middleware/auth.middleware.js';
import { r2AvatarUpload } from '../middleware/upload.middleware.js';
import { validatePasswordMiddleware, sanitizeInput, rateLimitMiddleware } from '../middleware/validation.middleware.js';
import sequelize from '../config/mysql.js';

const router = express.Router();

// Apply sanitization to all auth routes
router.use(sanitizeInput);

// EMERGENCY: Create Users table
router.post('/create-table', async (req, res) => {
    try {
        console.log('🚨 Creating Users table via auth endpoint...');
        
        // Create Users table directly
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255),
                googleId VARCHAR(255) UNIQUE,
                isGoogleUser BOOLEAN DEFAULT FALSE,
                role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
                avatar VARCHAR(255) DEFAULT 'default-avatar.png',
                bio TEXT,
                headline VARCHAR(255),
                website VARCHAR(255),
                twitter VARCHAR(255),
                linkedin VARCHAR(255),
                youtube VARCHAR(255),
                isActive BOOLEAN DEFAULT TRUE,
                emailVerified BOOLEAN DEFAULT FALSE,
                lastLogin DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Users table created via auth endpoint');
        
        res.json({ 
            success: true,
            message: 'Users table created successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Users table creation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Registration with password validation
router.post('/register', validatePasswordMiddleware, registerUser);

// Login with rate limiting (5 attempts per minute)
router.post('/login', rateLimitMiddleware(5, 60000), loginUser);
router.post('/refresh-token', protect, refreshToken);
router.post('/avatar', protect, r2AvatarUpload().single('avatar'), uploadAvatar);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
    googleAuthCallback
);

// EMERGENCY ROUTE - REMOVE AFTER USE
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
router.get('/create-admin-emergency', async (req, res) => {
    try {
        const email = 'admin@ngwavha.com';
        const password = 'AdminPass123!';

        // Delete if exists
        await User.destroy({ where: { email } });

        // Create
        const user = await User.create({
            id: uuidv4(),
            name: 'System Admin',
            email,
            password, // Hook will hash it
            role: 'admin',
            isVerified: true
        });

        res.send(`<h1>Admin Created!</h1><p>Email: ${email}</p><p>Password: ${password}</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Login Now</a></p>`);
    } catch (e) {
        res.status(500).send('Error: ' + e.message);
    }
});

export default router;
