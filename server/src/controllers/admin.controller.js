import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Activity from '../models/nosql/Activity.js';
import { Op } from 'sequelize';

// helper to get all dashboard stats
const fetchStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    pendingTeachers,
    totalCourses,
    activeCourses,
    totalRevenue,
    monthlyRevenue
  ] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'student' } }),
    User.count({ where: { role: 'instructor' } }),
    User.count({ where: { role: 'instructor', isApproved: false } }),
    Course.count(),
    Course.count({ where: { isPublished: true } }),
    Enrollment.sum('pricePaid') || 0,
    Enrollment.sum('pricePaid', {
      where: {
        createdAt: { [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30)) }
      }
    }) || 0
  ]);

  const recentActivity = await Activity.find()
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  return {
    users: { total: totalUsers, students: totalStudents, teachers: totalTeachers, pendingTeachers, active: 0 /* placeholder */ },
    courses: { total: totalCourses, active: activeCourses },
    revenue: { total: parseFloat(totalRevenue), monthly: parseFloat(monthlyRevenue) },
    recentActivity: recentActivity.map(a => ({
      id: a._id,
      type: a.type || a.action,
      user: a.userName || 'System',
      action: a.description || a.action,
      time: a.timestamp,
      status: 'success'
    })),
    realTime: { onlineUsers: 0, activeSessions: 0 } // handled by service
  };
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
