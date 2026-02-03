import express from 'express';
import { getMyCourses, checkEnrollment, updateProgress, enrollInCourse, getEnrolledCourseContent, getTeacherStudents, unenrollFromCourse } from '../controllers/enrollment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my-courses', protect, getMyCourses);
router.get('/courses/:slug/content', protect, getEnrolledCourseContent);
router.get('/check/:courseId', protect, checkEnrollment);
router.post('/enroll/:courseId', protect, enrollInCourse);
router.delete('/unenroll/:courseId', protect, unenrollFromCourse);
router.put('/:courseId/progress', protect, updateProgress);
router.get('/teacher-students', protect, getTeacherStudents);

export default router;
