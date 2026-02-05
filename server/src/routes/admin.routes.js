import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    approveTeacher,
    declineTeacher,
    deleteUser,
    getUserDetails,
    getRealTimeActivity
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/activity', getRealTimeActivity);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/approve', approveTeacher);
router.put('/users/:userId/decline', declineTeacher);
router.delete('/users/:userId', deleteUser);

export default router;
