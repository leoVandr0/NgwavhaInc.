import Course from '../models/Course.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import LiveSession from '../models/LiveSession.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import CourseContent from '../models/nosql/CourseContent.js';
import { Op } from 'sequelize';
import sequelize from '../config/mysql.js';
import { uploadVideoToR2 } from '../middleware/upload.middleware.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                title: {
                    [Op.like]: `%${req.query.keyword}%`,
                },
            }
            : {};

        // If category is provided as a slug, we need to handle it properly
        const include = [
            { model: User, as: 'instructor', attributes: ['name', 'avatar'] },
            { model: Category, as: 'category', attributes: ['name', 'slug'] }
        ];

        const where = { ...keyword };

        // In dev mode or for user testing, maybe show all courses. 
        // For production, we'd filter by status: 'published'
        // where.status = 'published'; 

        if (req.query.category) {
            where['$category.slug$'] = req.query.category;
        }

        const count = await Course.count({ where, include });

        const courses = await Course.findAll({
            where,
            include,
            limit: pageSize,
            offset: pageSize * (page - 1),
            order: [['createdAt', 'DESC']],
        });

        // Add ratings and enrollment counts to each course with defensive guards
        const coursesWithStats = await Promise.all(
            courses.map(async (course) => {
                const courseData = course.toJSON();
                let enrollmentCount = 0;
                let averageRating = '0.0';
                let ratingsCount = 0;
                let isLive = false;

                // Enrollment count
                try {
                    enrollmentCount = await Enrollment.count({ where: { courseId: course.id } });
                } catch (e) {
                    enrollmentCount = 0;
                    console.error('Error loading enrollment count for course', course.id, e?.stack || e);
                }

                // Rating stats
                try {
                    const ratingStats = await Review.findOne({
                        where: { courseId: course.id },
                        attributes: [
                            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                            [sequelize.fn('COUNT', sequelize.col('id')), 'ratingsCount']
                        ]
                    });
                    if (ratingStats?.dataValues) {
                        averageRating = ratingStats.dataValues.averageRating
                            ? parseFloat(ratingStats.dataValues.averageRating).toFixed(1)
                            : '0.0';
                        ratingsCount = ratingStats.dataValues.ratingsCount || 0;
                    }
                } catch (e) {
                    averageRating = '0.0';
                    ratingsCount = 0;
                    console.error('Error loading rating stats for course', course.id, e?.stack || e);
                }

                // Live status
                try {
                    const activeLiveSession = await LiveSession.findOne({ where: { courseId: course.id, status: 'live' } });
                    isLive = !!activeLiveSession;
                } catch (e) {
                    isLive = false;
                    console.error('Error checking live status for course', course.id, e?.stack || e);
                }

                return {
                    ...courseData,
                    enrollmentsCount: enrollmentCount,
                    averageRating,
                    ratingsCount,
                    isLive
                };
            })
        );

        res.json({ courses: coursesWithStats, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Initialize chunked upload
// @route   POST /api/courses/:id/sections/:sectionId/lectures/:lectureId/video/chunked/init
// @access  Private/Instructor
export const initChunkedUpload = async (req, res) => {
    try {
        const { fileName, totalChunks } = req.body;

        if (!fileName || !totalChunks) {
            return res.status(400).json({ message: 'fileName and totalChunks are required.' });
        }

        const uploadId = uuidv4();
        const chunkDir = process.env.UPLOAD_CHUNK_PATH || path.join(process.env.UPLOAD_PATH || 'uploads', 'chunks');
        fs.mkdirSync(chunkDir, { recursive: true });

        res.json({ uploadId, chunkDir, fileName });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a chunk
// @route   POST /api/courses/:id/sections/:sectionId/lectures/:lectureId/video/chunked
// @access  Private/Instructor
export const uploadChunk = async (req, res) => {
    try {
        const { uploadId, chunkIndex } = req.body;

        if (!uploadId || chunkIndex === undefined) {
            return res.status(400).json({ message: 'uploadId and chunkIndex are required.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No chunk file uploaded.' });
        }

        res.json({ message: 'Chunk received', uploadId, chunkIndex: Number(chunkIndex) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete chunked upload
// @route   POST /api/courses/:id/sections/:sectionId/lectures/:lectureId/video/chunked/complete
// @access  Private/Instructor
export const completeChunkedUpload = async (req, res) => {
    try {
        const { uploadId, totalChunks, fileName } = req.body;

        if (!uploadId || !totalChunks || !fileName) {
            return res.status(400).json({ message: 'uploadId, totalChunks, and fileName are required.' });
        }

        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });
        const section = content.sections.id(req.params.sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        const lecture = section.lectures.id(req.params.lectureId);

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const uploadPath = process.env.UPLOAD_PATH || 'uploads';
        const chunkDir = process.env.UPLOAD_CHUNK_PATH || path.join(uploadPath, 'chunks');
        const extension = path.extname(fileName) || '.mp4';
        const finalFileName = `video-${uploadId}${extension}`;
        const finalPath = path.join(uploadPath, finalFileName);

        const writeStream = fs.createWriteStream(finalPath);
        for (let i = 0; i < Number(totalChunks); i += 1) {
            const chunkPath = path.join(chunkDir, `${uploadId}-${i}`);
            if (!fs.existsSync(chunkPath)) {
                writeStream.end();
                return res.status(400).json({ message: `Missing chunk ${i}` });
            }
            const data = fs.readFileSync(chunkPath);
            writeStream.write(data);
        }
        writeStream.end();

        // Cleanup chunks
        for (let i = 0; i < Number(totalChunks); i += 1) {
            const chunkPath = path.join(chunkDir, `${uploadId}-${i}`);
            if (fs.existsSync(chunkPath)) {
                fs.unlinkSync(chunkPath);
            }
        }

        // Upload assembled video to R2
        console.log('🚀 Uploading video to R2:', finalFileName);
        const r2Result = await uploadVideoToR2(finalPath, finalFileName);

        if (r2Result.success) {
            // Use R2 URL
            lecture.videoUrl = r2Result.url;
            console.log('✅ Video uploaded to R2:', r2Result.url);

            // Optionally delete local file after successful R2 upload
            try {
                if (fs.existsSync(finalPath)) {
                    fs.unlinkSync(finalPath);
                    console.log('🗑️ Local file cleaned up:', finalFileName);
                }
            } catch (cleanupError) {
                console.warn('⚠️ Could not delete local file:', cleanupError.message);
            }
        } else {
            // Fallback to local storage
            lecture.videoUrl = `/uploads/${finalFileName}`;
            console.warn('⚠️ R2 upload failed, using local storage:', r2Result.error || 'No error details');
        }

        lecture.type = 'video';
        await content.save();

        res.json({
            message: 'Upload completed',
            lecture,
            storage: r2Result.success ? 'r2' : 'local',
            url: lecture.videoUrl
        });
    } catch (error) {
        console.error('❌ Chunked upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get instructor courses
// @route   GET /api/courses/my
// @access  Private/Instructor
export const getInstructorCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { instructorId: req.user.id },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Enrollment AS enrollment
                            WHERE
                                enrollment.course_id = Course.id
                        )`),
                        'studentCount'
                    ]
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course content for instructor
// @route   GET /api/courses/:id/content
// @access  Private/Instructor
export const getCourseContent = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });

        if (!content) {
            return res.status(404).json({ message: 'Course content not found' });
        }

        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload lecture video
// @route   POST /api/courses/:id/sections/:sectionId/lectures/:lectureId/video
// @access  Private/Instructor
export const uploadLectureVideo = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });
        const section = content.sections.id(req.params.sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        const lecture = section.lectures.id(req.params.lectureId);

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        // Upload video to R2
        const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', req.file.filename);
        console.log('🚀 Uploading lecture video to R2:', req.file.filename);
        const r2Result = await uploadVideoToR2(filePath, req.file.filename);

        if (r2Result.success) {
            lecture.videoUrl = r2Result.url;
            console.log('✅ Lecture video uploaded to R2:', r2Result.url);

            // Clean up local file
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('🗑️ Local file cleaned up:', req.file.filename);
                }
            } catch (cleanupError) {
                console.warn('⚠️ Could not delete local file:', cleanupError.message);
            }
        } else {
            // Fallback to local storage
            lecture.videoUrl = `/uploads/${req.file.filename}`;
            console.warn('⚠️ R2 upload failed, using local storage:', r2Result.error || 'No error details');
        }

        lecture.type = 'video';
        await content.save();

        res.json({
            message: 'Video uploaded',
            lecture,
            storage: r2Result.success ? 'r2' : 'local',
            url: lecture.videoUrl
        });
    } catch (error) {
        console.error('❌ Video upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course by slug
// @route   GET /api/courses/:slug
// @access  Public
export const getCourseBySlug = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar', 'bio', 'headline'] },
                { model: Category, as: 'category', attributes: ['name', 'slug'] },
                {
                    model: Review,
                    as: 'reviews',
                    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }],
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                }
            ],
        });

        if (course) {
            // Fetch content
            const content = await CourseContent.findOne({ courseId: course.id }).lean();

            if (content) {
                // For the public landing page, we only allow the first video as a preview
                let previewFound = false;
                content.sections = content.sections.map(section => {
                    section.lectures = section.lectures.map(lecture => {
                        // Allow the first video lecture to be the preview
                        if (!previewFound && lecture.videoUrl) {
                            previewFound = true;
                            // Keep videoUrl for this one
                        } else if (!lecture.isFree) {
                            delete lecture.videoUrl;
                        }
                        delete lecture.resources; // Hide resources until enrolled
                        return lecture;
                    });
                    return section;
                });
            }

            // Fetch next upcoming or current live session
            const activeLiveSession = await LiveSession.findOne({
                where: {
                    courseId: course.id,
                    status: { [Op.in]: ['live', 'scheduled'] },
                    startTime: { [Op.gt]: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Within last 2 hours or future
                },
                order: [['startTime', 'ASC']]
            });

            res.json({
                ...course.toJSON(),
                content,
                activeLiveSession: activeLiveSession ? activeLiveSession.toJSON() : null
            });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor (must be approved)
export const createCourse = async (req, res) => {
    try {
        const { title, description, price, categoryId, level, thumbnail } = req.body;

        // Check if instructor is approved (only for instructors, not admins)
        if (req.user.role === 'instructor' && !req.user.isApproved) {
            return res.status(403).json({
                message: 'Your instructor account is pending approval. Please wait for admin to approve your account before creating courses.',
                code: 'INSTRUCTOR_NOT_APPROVED'
            });
        }

        const course = await Course.create({
            title,
            description,
            price,
            categoryId,
            level,
            instructorId: req.user.id,
            thumbnail: thumbnail || '/uploads/default-course.jpg',
        });

        // Initialize MongoDB content document
        const content = new CourseContent({
            courseId: course.id,
            sections: []
        });
        await content.save();

        // Link MongoDB ID to MySQL Course
        course.mongoContentId = content._id.toString();
        await course.save();

        // Broadcast real-time update to admin dashboard
        if (global.broadcastToAdmins) {
            global.broadcastToAdmins('course-created', {
                type: 'new_course',
                course: {
                    id: course.id,
                    title: course.title,
                    instructorId: course.instructorId,
                    price: course.price,
                    level: course.level,
                    createdAt: course.createdAt
                },
                message: `New course created: ${course.title}`
            });
        }

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Guard: only admin can update unless preview approved
        if (req.user?.role !== 'admin' && course.previewStatus && course.previewStatus !== 'approved') {
            return res.status(403).json({ message: 'Course preview is pending approval. Admin must approve before updating content.' });
        }

        // Authorization check
        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        // Apply updates
        if (req.body.title) course.title = req.body.title;
        if (req.body.description) course.description = req.body.description;
        if (req.body.price != null) course.price = req.body.price;
        if (req.body.categoryId) course.categoryId = req.body.categoryId;
        if (req.body.level) course.level = req.body.level;
        if (req.body.thumbnail) course.thumbnail = req.body.thumbnail;
        if (req.body.status) {
            course.status = req.body.status;
            if (req.body.status === 'published' && !course.publishedAt) {
                course.publishedAt = new Date();
            }
        }

        const updatedCourse = await course.save();

        if (global.broadcastToAdmins) {
            global.broadcastToAdmins('course-updated', {
                type: 'course_updated',
                course: {
                    id: updatedCourse.id,
                    title: updatedCourse.title,
                    instructorId: updatedCourse.instructorId,
                    status: updatedCourse.status
                },
                message: `Course updated: ${updatedCourse.title}`
            });
        }

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add section to course content
// @route   POST /api/courses/:id/sections
// @access  Private/Instructor
export const addSection = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Block content changes if preview not approved yet
        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            // Non-admins cannot modify until preview is approved
            if (course.previewStatus && course.previewStatus !== 'approved') {
                return res.status(403).json({ message: 'Course preview is pending approval. Admin must approve before adding content.' });
            }
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });

        if (!content) {
            return res.status(404).json({ message: 'Course content not initialized. Please re-create the course.' });
        }

        content.sections.push({
            title: req.body.title,
            lectures: []
        });

        await content.save();
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add lecture to section
// @route   POST /api/courses/:id/sections/:sectionId/lectures
// @access  Private/Instructor
export const addLecture = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Guard preview status before adding lectures
        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            if (course.previewStatus && course.previewStatus !== 'approved') {
                return res.status(403).json({ message: 'Course preview is pending approval. Admin must approve before adding content.' });
            }
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });
        if (!content) {
            return res.status(404).json({ message: 'Course content not initialized' });
        }

        const section = content.sections.id(req.params.sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        const { title, type, description, videoUrl, videoDuration, content: textContent } = req.body;

        section.lectures.push({
            title,
            type: type || 'video',
            description,
            videoUrl,
            videoDuration,
            content: textContent
        });

        await content.save();

        // Update MySQL aggregates
        course.totalLectures = content.totalLectures;
        course.totalDuration = content.totalDuration;
        await course.save();

        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete section
// @route   DELETE /api/courses/:id/sections/:sectionId
// @access  Private/Instructor
export const deleteSection = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });
        content.sections = content.sections.filter(s => s._id.toString() !== req.params.sectionId);

        await content.save();

        // Update MySQL aggregates
        course.totalLectures = content.totalLectures;
        course.totalDuration = content.totalDuration;
        await course.save();

        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete lecture
// @route   DELETE /api/courses/:id/sections/:sectionId/lectures/:lectureId
// @access  Private/Instructor
export const deleteLecture = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });
        const section = content.sections.id(req.params.sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        section.lectures = section.lectures.filter(l => l._id.toString() !== req.params.lectureId);
        await content.save();

        // Update MySQL aggregates
        course.totalLectures = content.totalLectures;
        course.totalDuration = content.totalDuration;
        await course.save();

        res.json(content);
    } catch (error) {
        // Propagate to upper-level error boundary; keep a friendly message
        console.error('Error in deleteLecture handler:', error?.stack || error);
        res.status(500).json({ message: error?.message || 'Internal server error' });
    }
};

// @desc    Upload course preview video for admin review
// @route   POST /api/courses/:id/preview
// @access  Private/Instructor (must be course owner)
export const uploadCoursePreview = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to upload preview for this course' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No preview video uploaded' });
        }

        // Determine path to uploaded preview
        const isR2 = !!req.file.key;
        const videoPath = isR2 && (process.env.R2_PUBLIC_URL || '')
            ? `${process.env.R2_PUBLIC_URL}/${req.file.key}`
            : `/uploads/${req.file.filename}`;

        // Optional duration in seconds
        let duration = 0;
        if (req.body.duration && req.body.duration !== '0') {
            duration = Number(req.body.duration);
            if (!Number.isFinite(duration) || duration < 0) {
                duration = 0; // fallback gracefully instead of dropping connection
            }
            if (duration > 300) {
                // Return gracefully without dropping
                duration = 300;
            }
        }

        course.previewVideoPath = videoPath;
        course.previewVideoDuration = duration;
        course.previewStatus = 'pending';
        course.previewUploadedAt = new Date();
        course.previewUploadedBy = req.user.id;
        await course.save();

        // Send real-time notification to admins
        if (global.broadcastToAdmins) {
            global.broadcastToAdmins('course-preview-uploaded', {
                type: 'preview_uploaded',
                course: {
                    id: course.id,
                    title: course.title,
                    instructorId: course.instructorId,
                    instructorName: req.user.name,
                    uploadedAt: course.previewUploadedAt
                },
                message: `Instructor ${req.user.name} uploaded a preview for "${course.title}".`
            });
        }

        res.json({ success: true, courseId: course.id, preview: { path: videoPath, duration, status: 'pending' } });
    } catch (error) {
        console.error('Upload preview logic error:', error);
        res.status(500).json({ message: 'Failed to process preview' });
    }
};

// @desc    Approve course preview
// @route   POST /api/admin/courses/:courseId/preview/approve
// @access  Private (Admin)
export const approvePreview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        course.previewStatus = 'approved';
        course.previewApprovedAt = new Date();
        course.previewApprovedBy = req.user.id;
        await course.save();

        res.json({ success: true, message: 'Preview approved', courseId: course.id });
    } catch (error) {
        console.error('Failed to load courses (getCourses):', error?.stack || error);
        // Return a stable payload to prevent UI from crashing
        res.json({ courses: [], page: page || 1, pages: 0, error: 'Failed to load courses' });
    }
};

// @desc    Reject course preview
// @route   POST /api/admin/courses/:courseId/preview/reject
// @access  Private (Admin)
export const rejectPreview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { reason } = req.body;
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        course.previewStatus = 'rejected';
        course.previewRejectedAt = new Date();
        course.previewRejectReason = reason || 'Not specified';
        await course.save();

        res.json({ success: true, message: 'Preview rejected', courseId: course.id, reason });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Global guard: only admin can delete unless preview approved
        if (req.user?.role !== 'admin' && course.previewStatus && course.previewStatus !== 'approved') {
            return res.status(403).json({ message: 'Course preview is pending approval. Admin must approve before deleting course.' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        const courseTitle = course.title;
        const courseId = course.id;

        // Delete MongoDB content
        await CourseContent.deleteOne({ courseId: course.id });

        // Delete the course
        await course.destroy();

        // Broadcast real-time update to admin dashboard
        if (global.broadcastToAdmins) {
            global.broadcastToAdmins('course-deleted', {
                type: 'course_deleted',
                course: {
                    id: courseId,
                    title: courseTitle,
                    instructorId: course.instructorId
                },
                message: `Course deleted: ${courseTitle}`
            });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
