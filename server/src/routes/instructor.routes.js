import express from 'express';
import { getPublicInstructors, getInstructorDetails } from '../controllers/instructor.controller.js';

const router = express.Router();

// Public instructor routes
router.get('/public', getPublicInstructors);
router.get('/:id', getInstructorDetails);

export default router;
