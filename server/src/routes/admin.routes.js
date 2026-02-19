import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    approveTeacher,
    declineTeacher,
    deleteUser,
    getUserDetails,
    getRealTimeActivity,
    approveCoursePreview,
    rejectCoursePreview,
    getPendingCoursePreviews
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/activity', getRealTimeActivity);

// Preview approvals for courses
router.get('/courses/previews/pending', getPendingCoursePreviews);
router.post('/courses/:courseId/preview/approve', approveCoursePreview);
router.post('/courses/:courseId/preview/reject', rejectCoursePreview);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/approve', approveTeacher);
router.put('/users/:userId/decline', declineTeacher);
router.delete('/users/:userId', deleteUser);

export default router;
