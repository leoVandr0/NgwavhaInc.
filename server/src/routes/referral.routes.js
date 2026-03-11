import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
    getMyReferralInfo,
    validateReferralCode,
    getReferralStats
} from '../controllers/referral.controller.js';

const router = express.Router();

// Get current user's referral info and history
router.get('/my-code', protect, getMyReferralInfo);

// Validate a referral code (public endpoint)
router.get('/validate/:code', validateReferralCode);

// Get referral statistics (admin only)
router.get('/stats', protect, admin, getReferralStats);

export default router;
