import { LiveSession, Course, User, Enrollment } from '../models/index.js';
import CourseContent from '../models/nosql/CourseContent.js';
import realtimeService from '../services/realtime.service.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

async function ensureDailyRoom(meetingId) {
    if (!process.env.DAILY_API_KEY) return;
    const base = 'https://api.daily.co/v1';
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`
    };
    const check = await fetch(`${base}/rooms/${meetingId}`, { headers });
    if (check.ok) return;
    await fetch(`${base}/rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: meetingId,
            privacy: 'public',
            properties: {
                enable_chat: true,
                enable_knocking: false,
                start_video_off: true,
                start_audio_off: true,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
            }
        })
    });
}

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

        // Create a Daily.co room for the session
        let meetingId = `ngwavha-${uuidv4().substring(0, 8)}`;
        if (process.env.DAILY_API_KEY) {
            try {
                const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.DAILY_API_KEY}`
                    },
                    body: JSON.stringify({
                        name: meetingId,
                        privacy: 'public',
                        properties: {
                            enable_chat: true,
                            enable_knocking: false,
                            start_video_off: true,
                            start_audio_off: true,
                            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
                        }
                    })
                });
                const room = await dailyRes.json();
                if (room.name) meetingId = room.name;
            } catch (dailyErr) {
                console.warn('Daily.co room creation failed, using generated ID:', dailyErr.message);
            }
        }

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

        if (status === 'live') {
            await ensureDailyRoom(session.meetingId).catch(e =>
                console.warn('ensureDailyRoom failed:', e.message)
            );
        }

        session.status = status;
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Notify enrolled students about a scheduled session
// @route   POST /api/live-sessions/:id/notify
// @access  Private/Instructor
export const notifyStudents = async (req, res) => {
    try {
        const session = await LiveSession.findByPk(req.params.id, {
            include: [{ model: Course, as: 'course', attributes: ['title'] }]
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const enrollments = await Enrollment.findAll({
            where: { courseId: session.courseId },
            include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }]
        });
        const students = enrollments.map(e => e.student).filter(Boolean);

        const clientUrl = process.env.CLIENT_URL;
        const joinUrl = `${clientUrl}/student/live-room/${session.meetingId}?title=${encodeURIComponent(session.title)}`;

        await realtimeService.notifySessionInvite(students, session, joinUrl);

        res.json({ notified: students.length });
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
