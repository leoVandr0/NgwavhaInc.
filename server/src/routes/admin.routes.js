import { Router } from 'express';
import {
    getPendingInstructors,
    approveInstructor,
    getDashboardData,
    getTeachers,
    getCourses,
    getTransactions,
    getRevenue,
    getUsers,
    deleteUser,
    rejectInstructor,
    deleteCourse,
    approveCourse,
    rejectCourse,
    verifyTeacher,
    rejectTeacherVerification,
    getAllCategories,
    createCategory,
    flagReview,
    getPendingCoursePreviews,
    approveCoursePreview,
    rejectCoursePreview,
    broadcastNotification
} from '../controllers/admin.controller.js';
import { adminOnly, protect } from '../middleware/admin.middleware.js';

const router = Router();

// Admin protection: ensure user is authenticated and admin
router.use(protect);
router.use(adminOnly);

// Dashboard statistics
router.get('/dashboard', getDashboardData);

// Management routes
router.get('/teachers', getTeachers);
router.get('/courses', getCourses);
router.get('/transactions', getTransactions);
router.get('/revenue', getRevenue);

// User management
router.get('/users', getUsers);
router.put('/users/:id/approve', approveInstructor); // Reuse approve
router.put('/users/:id/decline', rejectInstructor);
router.delete('/users/:id', deleteUser);

// Teachers
router.put('/teachers/:id/approve', approveInstructor); // Reuse approve
router.put('/teachers/:id/reject', rejectInstructor);

// Courses
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', deleteCourse);

// Course Previews
router.get('/courses/previews/pending', getPendingCoursePreviews);
router.post('/courses/:id/preview/approve', approveCoursePreview);
router.post('/courses/:id/preview/reject', rejectCoursePreview);

// Teacher Verification
router.put('/teachers/:id/verify', verifyTeacher);
router.put('/teachers/:id/reject-verification', rejectTeacherVerification);

// Categories
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);

// Reviews
router.put('/reviews/:id/flag', flagReview);

// Pending instructors awaiting approval
router.get('/instructors/pending', getPendingInstructors);

// Approve an instructor by ID
router.post('/instructors/:id/approve', approveInstructor);

// Broadcast notification to all users
router.post('/notifications/broadcast', broadcastNotification);

export default router;
