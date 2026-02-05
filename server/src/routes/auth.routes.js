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

export default router;
