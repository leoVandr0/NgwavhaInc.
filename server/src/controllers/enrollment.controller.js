import { Enrollment, Course, User } from '../models/index.js';
import CourseContent from '../models/nosql/CourseContent.js';

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

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
