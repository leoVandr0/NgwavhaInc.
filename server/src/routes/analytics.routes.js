import express from 'express';
import { getDashboardStats, getCourseAnalytics } from '../controllers/analytics.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/course/:courseId', protect, getCourseAnalytics);

export default router;
