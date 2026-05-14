import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import notificationService from '../services/notification.service.js';

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private
export const submitComplaint = async (req, res) => {
    try {
        const { subject, message, category, relatedCourseId } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        const complaint = await Complaint.create({
            userId: req.user.id,
            subject,
            message,
            category: category || 'other',
            relatedCourseId: relatedCourseId || null
        });

        // Fetch submitter name for the notification
        const submitter = await User.findByPk(req.user.id, { attributes: ['name', 'email'] });
        const courseTitle = relatedCourseId
            ? (await Course.findByPk(relatedCourseId, { attributes: ['title'] }))?.title
            : null;

        const courseContext = courseTitle ? ` (Course: "${courseTitle}")` : '';
        const shortMessage = `⚠️ New complaint from ${submitter?.name || 'a user'}${courseContext}: "${subject}". Review at ngwavha.co.zw/admin`;

        await notificationService.notifyAdmins({
            subject: `New Complaint: ${subject}`,
            emailBody: `
                <h2>New Complaint Submitted</h2>
                <p><strong>From:</strong> ${submitter?.name || 'Unknown'} (${submitter?.email || ''})</p>
                <p><strong>Category:</strong> ${category || 'other'}</p>
                ${courseTitle ? `<p><strong>Related Course:</strong> ${courseTitle}</p>` : ''}
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <blockquote>${message}</blockquote>
                <p><a href="${process.env.CLIENT_URL || 'https://ngwavha.co.zw'}/admin/complaints/${complaint.id}">Review complaint in admin panel</a></p>
            `,
            shortMessage
        });

        res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: complaint });
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ message: 'Failed to submit complaint' });
    }
};

// @desc    Get all complaints (admin only)
// @route   GET /api/complaints
// @access  Admin
export const getAllComplaints = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = status ? { status } : {};

        const { count, rows } = await Complaint.findAndCountAll({
            where,
            include: [
                { model: User, as: 'submittedBy', attributes: ['id', 'name', 'email', 'avatar'] },
                { model: Course, as: 'relatedCourse', attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            success: true,
            data: rows,
            pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Failed to fetch complaints' });
    }
};

// @desc    Get logged-in user's own complaints
// @route   GET /api/complaints/my
// @access  Private
export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            where: { userId: req.user.id },
            include: [{ model: Course, as: 'relatedCourse', attributes: ['id', 'title'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: complaints });
    } catch (error) {
        console.error('Get my complaints error:', error);
        res.status(500).json({ message: 'Failed to fetch complaints' });
    }
};

// @desc    Update complaint status / add admin notes (admin only)
// @route   PUT /api/complaints/:id
// @access  Admin
export const updateComplaint = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const updates = {};
        if (status) updates.status = status;
        if (adminNotes !== undefined) updates.adminNotes = adminNotes;
        if (status === 'resolved') updates.resolvedAt = new Date();

        await complaint.update(updates);
        res.json({ success: true, message: 'Complaint updated', data: complaint });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Failed to update complaint' });
    }
};
