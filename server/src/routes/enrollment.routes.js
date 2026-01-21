import express from 'express';
import { getMyCourses, checkEnrollment, updateProgress } from '../controllers/enrollment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my-courses', protect, getMyCourses);
router.get('/check/:courseId', protect, checkEnrollment);
router.put('/:courseId/progress', protect, updateProgress);

export default router;
