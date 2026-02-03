import express from 'express';
import {
    createAssignment,
    getInstructorAssignments,
    getStudentAssignments,
    deleteAssignment
} from '../controllers/assignment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/', protect, authorize('instructor', 'teacher', 'admin'), upload.single('file'), createAssignment);
router.get('/instructor', protect, authorize('instructor', 'teacher', 'admin'), getInstructorAssignments);
router.get('/student', protect, getStudentAssignments);
router.delete('/:id', protect, authorize('instructor', 'teacher', 'admin'), deleteAssignment);

export default router;
