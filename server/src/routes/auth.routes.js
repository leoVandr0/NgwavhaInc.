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

const router = express.Router();

// Apply sanitization to all auth routes
router.use(sanitizeInput);

// Registration with password validation
router.post('/register', validatePasswordMiddleware, registerUser);

// Login with rate limiting
router.post('/login', rateLimitMiddleware(parseInt(process.env.LOGIN_RATE_LIMIT) || 5, parseInt(process.env.LOGIN_RATE_WINDOW_MS) || 60000), loginUser);
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

export default router;
