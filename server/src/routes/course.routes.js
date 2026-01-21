import express from 'express';
import {
    getCourses,
    getCourseBySlug,
    createCourse,
    updateCourse,
    addSection,
    addLecture
} from '../controllers/course.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:slug')
    .get(getCourseBySlug);

router.route('/:id')
    .put(protect, authorize('instructor', 'admin'), updateCourse);

router.route('/:id/sections')
    .post(protect, authorize('instructor', 'admin'), addSection);

router.route('/:id/sections/:sectionId/lectures')
    .post(protect, authorize('instructor', 'admin'), addLecture);

export default router;
