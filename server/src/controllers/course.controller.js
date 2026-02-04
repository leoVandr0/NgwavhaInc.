import { Course, User, Category, Enrollment, Review } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import CourseContent from '../models/nosql/CourseContent.js';
import { Op } from 'sequelize';
import sequelize from '../config/mysql.js';

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

        // Add ratings and enrollment counts to each course
        const coursesWithStats = await Promise.all(courses.map(async (course) => {
            const courseData = course.toJSON();
            
            // Get enrollment count
            const enrollmentCount = await Enrollment.count({
                where: { courseId: course.id }
            });
            
            // Get rating statistics
            const ratingStats = await Review.findOne({
                where: { courseId: course.id },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'ratingsCount']
                ]
            });
            
            return {
                ...courseData,
                enrollmentsCount: enrollmentCount,
                averageRating: ratingStats?.dataValues?.averageRating ? parseFloat(ratingStats.dataValues.averageRating).toFixed(1) : '0.0',
                ratingsCount: ratingStats?.dataValues?.ratingsCount || 0
            };
        }));

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

        lecture.videoUrl = `/uploads/${finalFileName}`;
        lecture.type = 'video';
        await content.save();

        res.json({ message: 'Upload completed', lecture });
    } catch (error) {
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

        lecture.videoUrl = `/uploads/${req.file.filename}`;
        lecture.type = 'video';

        await content.save();

        res.json({ message: 'Video uploaded', lecture });
    } catch (error) {
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

            res.json({ ...course.toJSON(), content });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (req, res) => {
    try {
        const { title, description, price, categoryId, level } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            categoryId,
            level,
            instructorId: req.user.id,
            thumbnail: 'default-course.jpg',
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

        if (course) {
            if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this course' });
            }

            course.title = req.body.title || course.title;
            course.description = req.body.description || course.description;
            course.price = req.body.price || course.price;
            course.categoryId = req.body.categoryId || course.categoryId;
            course.level = req.body.level || course.level;
            course.status = req.body.status || course.status;

            if (req.body.status === 'published' && !course.publishedAt) {
                course.publishedAt = new Date();
            }

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
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
        res.status(500).json({ message: error.message });
    }
};
