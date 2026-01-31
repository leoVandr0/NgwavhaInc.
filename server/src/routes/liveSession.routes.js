import express from 'express';
import {
    scheduleSession,
    getInstructorSessions,
    getStudentSessions,
    updateSessionStatus,
    deleteSession
} from '../controllers/liveSession.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('instructor', 'admin'), scheduleSession);

router.route('/instructor')
    .get(protect, authorize('instructor', 'admin'), getInstructorSessions);

router.get('/student', protect, getStudentSessions);

router.route('/:id')
    .delete(protect, authorize('instructor', 'admin'), deleteSession);

router.patch('/:id/status', protect, authorize('instructor', 'admin'), updateSessionStatus);

export default router;
