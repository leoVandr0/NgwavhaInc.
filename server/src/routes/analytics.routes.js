import express from 'express';
import { getDashboardStats, getCourseAnalytics } from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/course/:courseId', protect, getCourseAnalytics);

export default router;
