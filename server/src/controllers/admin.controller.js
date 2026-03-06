import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Activity from '../models/nosql/Activity.js';
import { Op } from 'sequelize';

// helper to get all dashboard stats
const fetchStats = async () => {
  try {
    console.log('📊 Starting dashboard stats fetch...');

    // 1. User counts
    let totalUsers = 0, totalStudents = 0, totalTeachers = 0, pendingTeachers = 0;
    try {
      totalUsers = await User.count();
      totalStudents = await User.count({ where: { role: 'student' } });
      totalTeachers = await User.count({ where: { role: 'instructor' } });
      pendingTeachers = await User.count({ where: { role: 'instructor', isApproved: false } });
    } catch (e) {
      console.error('❌ User stats error:', e.message);
    }

    // 2. Course counts
    let totalCourses = 0, activeCourses = 0;
    try {
      totalCourses = await Course.count();
      activeCourses = await Course.count({ where: { isPublished: true } });
    } catch (e) {
      console.error('❌ Course stats error:', e.message);
    }

    // 3. Revenue
    let totalRevenue = 0, monthlyRevenue = 0;
    try {
      const totalRevResult = await Enrollment.sum('pricePaid');
      totalRevenue = totalRevResult || 0;

      const monthlyRevResult = await Enrollment.sum('pricePaid', {
        where: {
          createdAt: { [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30)) }
        }
      });
      monthlyRevenue = monthlyRevResult || 0;
    } catch (e) {
      console.error('❌ Revenue stats error:', e.message);
    }

    // 4. Activity
    let recentActivities = [];
    try {
      if (Activity && typeof Activity.find === 'function') {
        recentActivities = await Activity.find().sort({ timestamp: -1 }).limit(20).lean();
      }
    } catch (e) {
      console.error('❌ Activity stats error (non-blocking):', e.message);
    }

    return {
      users: { total: totalUsers, students: totalStudents, teachers: totalTeachers, pendingTeachers, active: 0 },
      courses: { total: totalCourses, active: activeCourses },
      revenue: { total: parseFloat(totalRevenue), monthly: parseFloat(monthlyRevenue) },
      recentActivity: (recentActivities || []).map(a => ({
        id: a._id || Math.random().toString(36).substr(2, 9),
        type: a.type || a.action || 'system',
        user: a.userName || 'System',
        action: a.description || a.action || 'Performed action',
        time: a.timestamp || new Date(),
        status: 'success'
      })),
      realTime: { onlineUsers: 0, activeSessions: 0 }
    };
  } catch (err) {
    console.error('❌ Critical failure in fetchStats:', err);
    // Return empty stats instead of throwing to prevent 500
    return {
      users: { total: 0, students: 0, teachers: 0, pendingTeachers: 0, active: 0 },
      courses: { total: 0, active: 0 },
      revenue: { total: 0, monthly: 0 },
      recentActivity: [],
      realTime: { onlineUsers: 0, activeSessions: 0 }
    };
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const stats = await fetchStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Admin get dashboard data error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

export const getRealTimeUpdates = async (req, res) => {
  try {
    const stats = await fetchStats();
    res.json({ success: true, data: { stats: { totalUsers: stats.users.total, pendingTeachers: stats.users.pendingTeachers, totalCourses: stats.courses.total }, recentActivity: stats.recentActivity } });
  } catch (error) {
    console.error('Admin get real-time updates error:', error);
    res.json({ success: false, message: 'Failed to fetch real-time updates' });
  }
};

// @desc Get all teachers with stats
// @route GET /api/admin/teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'instructor' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // In a real app, we'd use Sequelize joins/grouping to get these counts
    // For now, we'll return the teachers and the frontend will handle fallback/display
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Admin get teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
};

// @desc Get all courses with instructor info
// @route GET /api/admin/courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Admin get courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

// @desc Get all transactions (enrollments)
// @route GET /api/admin/transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Enrollment.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Course, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Admin get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

// @desc Get revenue breakdown
// @route GET /api/admin/revenue
export const getRevenue = async (req, res) => {
  try {
    const stats = await fetchStats();
    res.json({
      success: true,
      data: {
        totalRevenue: stats.revenue.total,
        monthlyRevenue: stats.revenue.monthly,
        weeklyRevenue: stats.revenue.monthly / 4, // Estimate for now
        dailyRevenue: stats.revenue.monthly / 30, // Estimate for now
        totalTransactions: await Enrollment.count(),
        pendingPayouts: 0
      }
    });
  } catch (error) {
    console.error('Admin get revenue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue data' });
  }
};

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

// @desc Get all users with pagination and filters
// @route GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role && role !== 'all') {
      where.role = role === 'teacher' ? 'instructor' : role;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status === 'pending') {
      where.role = 'instructor';
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    } else if (status === 'declined' || status === 'rejected') {
      where.instructorStatus = 'REJECTED';
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          current: parseInt(page),
          pageSize: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc Delete a user
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// @desc Decline/Reject a teacher
// @route PUT /api/admin/teachers/:id/reject or /api/admin/users/:id/decline
export const rejectInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const instructor = await User.findByPk(id);
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }
    await instructor.update({
      isApproved: false,
      instructorStatus: 'REJECTED',
      bio: reason ? `${instructor.bio || ''} (Rejected: ${reason})` : instructor.bio
    });
    res.json({ success: true, message: 'Instructor application rejected' });
  } catch (error) {
    console.error('Admin reject instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject instructor' });
  }
};

// @desc Delete a course
// @route DELETE /api/admin/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await course.destroy();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Admin delete course error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
};

// @desc Approve a course
// @route PUT /api/admin/courses/:id/approve
export const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await course.update({
      status: 'approved',
      publishedAt: new Date()
    });
    res.json({ success: true, message: 'Course approved and published' });
  } catch (error) {
    console.error('Admin approve course error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve course' });
  }
};

// @desc Reject a course
// @route PUT /api/admin/courses/:id/reject
export const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await course.update({
      status: 'rejected',
      rejectionReason: reason
    });
    res.json({ success: true, message: 'Course rejected' });
  } catch (error) {
    console.error('Admin reject course error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject course' });
  }
};

// @desc Verify a teacher
// @route PUT /api/admin/teachers/:id/verify
export const verifyTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== 'instructor') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await user.update({
      verificationStatus: 'verified',
      isVerified: true
    });
    res.json({ success: true, message: 'Teacher verified successfully' });
  } catch (error) {
    console.error('Admin verify teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify teacher' });
  }
};

// @desc Reject teacher verification
// @route PUT /api/admin/teachers/:id/reject-verification
export const rejectTeacherVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findByPk(id);
    if (!user || user.role !== 'instructor') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await user.update({
      verificationStatus: 'rejected',
      rejectionReason: reason
    });
    res.json({ success: true, message: 'Teacher verification rejected' });
  } catch (error) {
    console.error('Admin reject teacher verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject teacher verification' });
  }
};

// Category management
// @desc Get all categories
// @route GET /api/admin/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Admin get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// @desc Create a new category
// @route POST /api/admin/categories
export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Admin create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

// Review moderation
// @desc Report/Flag a review
// @route PUT /api/admin/reviews/:id/flag
export const flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    await review.update({
      isReported: true,
      reportReason: reason,
      status: 'flagged'
    });
    res.json({ success: true, message: 'Review flagged for moderation' });
  } catch (error) {
    console.error('Admin flag review error:', error);
    res.status(500).json({ success: false, message: 'Failed to flag review' });
  }
};

// --- COURSE PREVIEWS ---

// @desc    Get all courses with pending previews
// @route   GET /api/admin/courses/previews/pending
export const getPendingCoursePreviews = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: {
        previewStatus: 'pending',
        previewVideoPath: { [Op.not]: null }
      },
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email', 'avatar']
      }],
      order: [['previewUploadedAt', 'ASC']]
    });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error('Error fetching pending previews:', error);
    res.status(500).json({ message: 'Failed to fetch pending course previews' });
  }
};

// @desc    Approve course preview
// @route   POST /api/admin/courses/:id/preview/approve
export const approveCoursePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.previewStatus = 'approved';
    course.previewApprovedAt = new Date();
    course.previewApprovedBy = req.user.id;

    // Ensure its overall status is not 'rejected' if previously rejected
    if (course.status === 'rejected') {
      course.status = 'pending'; // or 'published' based on the workflow you want
    }

    await course.save();

    res.json({ success: true, message: 'Preview approved successfully', data: course });
  } catch (error) {
    console.error('Error approving preview:', error);
    res.status(500).json({ message: 'Failed to approve course preview' });
  }
};

// @desc    Reject course preview
// @route   POST /api/admin/courses/:id/preview/reject
export const rejectCoursePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.previewStatus = 'rejected';
    course.previewRejectReason = reason || 'No reason provided by admin';
    await course.save();

    // Optionally, send notification to the instructor

    res.json({ success: true, message: 'Preview rejected successfully', data: course });
  } catch (error) {
    console.error('Error rejecting preview:', error);
    res.status(500).json({ message: 'Failed to reject course preview' });
  }
};
