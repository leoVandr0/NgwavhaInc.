import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
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
