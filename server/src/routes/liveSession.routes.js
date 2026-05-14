import express from 'express';
import {
    scheduleSession,
    getInstructorSessions,
    getStudentSessions,
    getSessionByMeetingId,
    updateSessionStatus,
    deleteSession,
    notifyStudents
} from '../controllers/liveSession.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('instructor', 'admin'), scheduleSession);

router.route('/instructor')
    .get(protect, authorize('instructor', 'admin'), getInstructorSessions);

router.get('/student', protect, getStudentSessions);
router.get('/join/:meetingId', protect, getSessionByMeetingId);

router.route('/:id')
    .delete(protect, authorize('instructor', 'admin'), deleteSession);

router.patch('/:id/status', protect, authorize('instructor', 'admin'), updateSessionStatus);
router.post('/:id/notify', protect, authorize('instructor', 'admin'), notifyStudents);

export default router;
