import User from '../models/User.js';

// @desc Get pending instructors awaiting approval
// @route GET /api/admin/instructors/pending
export const getPendingInstructors = async (req, res) => {
  try {
    const pending = await User.findAll({ where: { role: 'instructor', isApproved: false } });
    res.json(pending);
  } catch (error) {
    console.error('Admin get pending instructors error:', error);
    res.status(500).json({ message: 'Failed to fetch pending instructors' });
  }
};

// @desc Approve an instructor
// @route POST /api/admin/instructors/:id/approve
export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findOne({ where: { id, role: 'instructor' } });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    await instructor.update({ isApproved: true, isVerified: true, instructorStatus: 'APPROVED' });
    res.json({ success: true, instructorId: id });
  } catch (error) {
    console.error('Admin approve instructor error:', error);
    res.status(500).json({ message: 'Failed to approve instructor' });
  }
};
