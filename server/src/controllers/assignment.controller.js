import { Assignment, Course, Enrollment, User } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Instructor
export const createAssignment = async (req, res) => {
    try {
        const { title, description, courseId, dueDate } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to post assignments for this course' });
        }

        const assignment = await Assignment.create({
            title,
            description,
            courseId,
            dueDate,
            instructorId: req.user.id,
            fileUrl: `/uploads/${req.file.filename}`
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for instructor
// @route   GET /api/assignments/instructor
// @access  Private/Instructor
export const getInstructorAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.findAll({
            where: { instructorId: req.user.id },
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for student
// @route   GET /api/assignments/student
// @access  Private/Student
export const getStudentAssignments = async (req, res) => {
    try {
        // Find courses student is enrolled in
        const enrollments = await Enrollment.findAll({
            where: { userId: req.user.id },
            attributes: ['courseId']
        });

        const courseIds = enrollments.map(e => e.courseId);

        if (courseIds.length === 0) {
            return res.json([]);
        }

        const assignments = await Assignment.findAll({
            where: {
                courseId: {
                    [Op.in]: courseIds
                }
            },
            include: [
                { model: Course, as: 'course', attributes: ['title'] },
                { model: User, as: 'instructor', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Instructor
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await assignment.destroy();
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
