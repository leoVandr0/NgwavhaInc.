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
    deleteCourse
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
router.delete('/courses/:id', deleteCourse);

// Pending instructors awaiting approval
router.get('/instructors/pending', getPendingInstructors);

// Approve an instructor by ID
router.post('/instructors/:id/approve', approveInstructor);

export default router;
