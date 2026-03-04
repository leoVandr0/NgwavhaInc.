import { Router } from 'express';
import { getPendingInstructors, approveInstructor } from '../controllers/admin.controller.js';
import { adminOnly, protect } from '../middleware/admin.middleware.js';

const router = Router();

// Admin protection: ensure user is authenticated and admin
router.use(protect);
router.use(adminOnly);

// Pending instructors awaiting approval
router.get('/instructors/pending', getPendingInstructors);

// Approve an instructor by ID
router.post('/instructors/:id/approve', approveInstructor);

export default router;
