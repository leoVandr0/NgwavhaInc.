import { Enrollment, Course, User, Category, Review, LiveSession } from '../models/index.js';
import CourseContent from '../models/nosql/CourseContent.js';
import sequelize from '../config/mysql.js';
import logger from '../utils/dbLogger.js';

// @desc    Get logged in user's enrollments
// @route   GET /api/enrollments/my-courses
// @access  Private
export const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [{ model: User, as: 'instructor', attributes: ['name'] }]
                }
            ]
        });

        // If no enrollments found, return empty array
        if (!enrollments || enrollments.length === 0) {
            return res.json([]);
        }

        res.json(enrollments);
    } catch (error) {
        console.error('Error in getMyCourses:', error);
        res.status(500).json({ 
            message: 'Failed to fetch enrollments',
            error: error.message 
        });
    }
};

// @desc    Check enrollment status
// @route   GET /api/enrollments/check/:courseId
// @access  Private
export const checkEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            where: {
                userId: req.user.id,
                courseId: req.params.courseId
            }
        });

        if (enrollment) {
            res.json({ isEnrolled: true, enrollment });
        } else {
            res.json({ isEnrolled: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course progress
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private
export const updateProgress = async (req, res) => {
    try {
        const { lectureId } = req.body;
        const enrollment = await Enrollment.findOne({
            where: {
                userId: req.user.id,
                courseId: req.params.courseId
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Add lecture to completed list if not already there
        let completedLectures = enrollment.completedLectures || [];
        if (!completedLectures.includes(lectureId)) {
            completedLectures.push(lectureId);
            enrollment.completedLectures = completedLectures;

            // Calculate progress percentage
            const courseContent = await CourseContent.findOne({ courseId: req.params.courseId });
            if (courseContent && courseContent.totalLectures > 0) {
                enrollment.progress = (completedLectures.length / courseContent.totalLectures) * 100;
            }

            // Check for completion
            if (enrollment.progress >= 100 && !enrollment.isCompleted) {
                enrollment.isCompleted = true;
                enrollment.completedAt = new Date();
                // Trigger certificate generation logic here (omitted for brevity)
            }

            enrollment.lastAccessedAt = new Date();
            await enrollment.save();

            logger.track({
                userId: req.user.id,
                action: 'update_progress',
                resourceType: 'course',
                resourceId: req.params.courseId,
                details: { lectureId, progress: enrollment.progress },
                req
            });
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course content for an enrolled user
// @route   GET /api/enrollments/courses/:slug/content
// @access  Private
export const getEnrolledCourseContent = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: { slug: req.params.slug },
            include: [{ model: User, as: 'instructor', attributes: ['name', 'avatar'] }]
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const enrollment = await Enrollment.findOne({
            where: {
                userId: req.user.id,
                courseId: course.id
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }

        const content = await CourseContent.findOne({ courseId: course.id }).lean();

        if (content) {
            // Fetch live sessions for this course
            const liveSessions = await LiveSession.findAll({
                where: { courseId: course.id }
            });

            // Map live session data to lectures
            content.sections.forEach(section => {
                section.lectures.forEach(lecture => {
                    if (lecture.type === 'live' && lecture.liveSessionId) {
                        const session = liveSessions.find(s => s.id === lecture.liveSessionId);
                        if (session) {
                            lecture.liveSessionData = {
                                meetingId: session.meetingId,
                                status: session.status,
                                startTime: session.startTime
                            };
                        }
                    }
                });
            });
        }

        res.json({
            course,
            content,
            enrollment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll in a course
// @route   POST /api/enrollments/enroll/:courseId
// @access  Private
export const enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existingEnrollment = await Enrollment.findOne({
            where: {
                userId: req.user.id,
                courseId: course.id
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        const enrollment = await Enrollment.create({
            userId: req.user.id,
            courseId: course.id,
            pricePaid: course.price || 0,
            progress: 0,
            completedLectures: []
        });

        // Update enrollment count in MySQL
        course.enrollmentsCount += 1;
        await course.save();

        logger.track({
            userId: req.user.id,
            action: 'enroll',
            resourceType: 'course',
            resourceId: course.id,
            details: { pricePaid: enrollment.pricePaid },
            req
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unenroll from a course
// @route   DELETE /api/enrollments/unenroll/:courseId
// @access  Private
export const unenrollFromCourse = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            where: {
                userId: req.user.id,
                courseId: req.params.courseId
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        await enrollment.destroy();

        // Update enrollment count in MySQL
        const course = await Course.findByPk(req.params.courseId);
        if (course) {
            course.enrollmentsCount = Math.max(0, course.enrollmentsCount - 1);
            await course.save();
        }

        res.json({ message: 'Successfully unenrolled from course' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students enrolled in teacher's courses
// @route   GET /api/enrollments/teacher-students
// @access  Private (Instructor/Admin)
export const getTeacherStudents = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            include: [
                {
                    model: Course,
                    as: 'course',
                    where: { instructorId: req.user.id },
                    attributes: ['id', 'title', 'slug']
                },
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'name', 'email', 'avatar']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
