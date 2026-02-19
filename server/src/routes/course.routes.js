import express from 'express';
import {
    getCourses,
    getCourseBySlug,
    createCourse,
    updateCourse,
    deleteCourse,
    addSection,
    addLecture,
    deleteSection,
    deleteLecture,
    uploadLectureVideo,
    getInstructorCourses,
    getCourseContent,
    initChunkedUpload,
    uploadChunk,
    completeChunkedUpload
} from '../controllers/course.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload, chunkUpload, uploadToR2 } from '../middleware/upload.middleware.js';

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/my')
    .get(protect, authorize('instructor', 'admin'), getInstructorCourses);

router.route('/:slug')
    .get(getCourseBySlug);

router.route('/:id')
    .put(protect, authorize('instructor', 'admin'), updateCourse)
    .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.route('/:id/content')
    .get(protect, authorize('instructor', 'admin'), getCourseContent);

router.route('/:id/sections')
    .post(protect, authorize('instructor', 'admin'), addSection);

router.route('/:id/sections/:sectionId')
    .delete(protect, authorize('instructor', 'admin'), deleteSection);

router.route('/:id/sections/:sectionId/lectures')
    .post(protect, authorize('instructor', 'admin'), addLecture);

router.route('/:id/sections/:sectionId/lectures/:lectureId')
    .delete(protect, authorize('instructor', 'admin'), deleteLecture);

router.route('/:id/sections/:sectionId/lectures/:lectureId/video')
    .post(protect, authorize('instructor', 'admin'), upload.single('video'), uploadLectureVideo);

router.route('/:id/sections/:sectionId/lectures/:lectureId/video/chunked/init')
    .post(protect, authorize('instructor', 'admin'), initChunkedUpload);

router.route('/:id/sections/:sectionId/lectures/:lectureId/video/chunked')
    .post(protect, authorize('instructor', 'admin'), chunkUpload.single('chunk'), uploadChunk);

router.route('/:id/sections/:sectionId/lectures/:lectureId/video/chunked/complete')
    .post(protect, authorize('instructor', 'admin'), completeChunkedUpload);

// Thumbnail upload route
router.post('/thumbnail/upload', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No thumbnail file provided' });
        }

        // Upload to R2 or fallback to local
        const thumbnailUrl = await uploadToR2(req.file);
        
        res.json({
            success: true,
            thumbnailUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Thumbnail upload error:', error);
        res.status(500).json({ message: 'Thumbnail upload failed', error: error.message });
    }
});

export default router;
