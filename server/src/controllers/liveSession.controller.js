import { LiveSession, Course, User, Enrollment } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

// @desc    Schedule a live session
// @route   POST /api/live-sessions
// @access  Private/Instructor
export const scheduleSession = async (req, res) => {
    try {
        const { title, description, courseId, startTime, duration, lectureId } = req.body;

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to schedule for this course' });
        }

        const meetingId = `Ngwavha-${uuidv4().substring(0, 8)}`;

        // If lectureId is provided, check if a session already exists for it and update/delete it?
        // For simplicity, we just allow multiple sessions but the frontend will prefer the latest.

        const session = await LiveSession.create({
            title,
            description,
            courseId,
            instructorId: req.user.id,
            lectureId, // Link to curriculum lecture
            startTime,
            duration,
            meetingId,
            status: 'scheduled'
        });

        // Also update the CourseContent in MongoDB if lectureId is provided
        if (lectureId) {
            const content = await CourseContent.findOne({ courseId });
            if (content) {
                let found = false;
                content.sections.forEach(section => {
                    const lecture = section.lectures.id(lectureId);
                    if (lecture) {
                        lecture.liveSessionId = session.id;
                        found = true;
                    }
                });
                if (found) await content.save();
            }
        }

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get instructor sessions
// @route   GET /api/live-sessions/instructor
// @access  Private/Instructor
export const getInstructorSessions = async (req, res) => {
    try {
        const sessions = await LiveSession.findAll({
            where: { instructorId: req.user.id },
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['startTime', 'ASC']]
        });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student sessions (from enrolled courses)
// @route   GET /api/live-sessions/student
// @access  Private/Student
export const getStudentSessions = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId: req.user.id }
        });

        const courseIds = enrollments.map(e => e.courseId);

        const sessions = await LiveSession.findAll({
            where: {
                courseId: { [Op.in]: courseIds },
                status: { [Op.ne]: 'ended' }
            },
            include: [
                { model: Course, as: 'course', attributes: ['title'] },
                { model: User, as: 'instructor', attributes: ['name', 'avatar'] }
            ],
            order: [['startTime', 'ASC']]
        });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update session status (start/end)
// @route   PATCH /api/live-sessions/:id/status
// @access  Private/Instructor
export const updateSessionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const session = await LiveSession.findByPk(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        session.status = status;
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete session
// @route   DELETE /api/live-sessions/:id
// @access  Private/Instructor
export const deleteSession = async (req, res) => {
    try {
        const session = await LiveSession.findByPk(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await session.destroy();
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
