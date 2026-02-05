import express from 'express';
import {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    googleAuthCallback,
} from '../controllers/auth.controller.js';
import passport from 'passport';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validatePasswordMiddleware, sanitizeInput, rateLimitMiddleware } from '../middleware/validation.middleware.js';

const router = express.Router();

// Apply sanitization to all auth routes
router.use(sanitizeInput);

// Registration with password validation
router.post('/register', validatePasswordMiddleware, registerUser);

// Login with rate limiting (5 attempts per minute)
router.post('/login', rateLimitMiddleware(5, 60000), loginUser);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
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
