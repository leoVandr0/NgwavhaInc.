import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { Op } from 'sequelize';

// @desc    Get dashboard statistics
// @route    GET /api/admin/dashboard
// @access   Private (Admin only)
export const getDashboardStats = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.count();
        const totalTeachers = await User.count({ where: { role: 'instructor' } });
        const totalStudents = await User.count({ where: { role: 'student' } });
        const pendingTeachers = await User.count({ 
            where: { 
                role: 'instructor',
                isVerified: false 
            } 
        });
        const activeUsers = await User.count({
            where: {
                lastLogin: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
                }
            }
        });

        // Get course statistics
        const totalCourses = await Course.count();
        const activeCourses = await Course.count({
            where: {
                isPublished: true,
                status: 'active'
            }
        });

        // Get revenue statistics (simplified - in real app, sum from transactions)
        const totalRevenue = 45678; // Mock data
        const monthlyRevenue = 12450; // Mock data

        // Get recent activity
        const recentActivity = await User.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'role', 'createdAt', 'isVerified']
        });

        // Get online users (simplified - in real app, use Redis/session store)
        const onlineUsers = Math.floor(Math.random() * 50) + 100; // Mock data
        const activeSessions = Math.floor(Math.random() * 30) + 50; // Mock data

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    teachers: totalTeachers,
                    active: activeUsers,
                    pendingTeachers: pendingTeachers
                },
                courses: {
                    total: totalCourses,
                    active: activeCourses
                },
                revenue: {
                    total: totalRevenue,
                    monthly: monthlyRevenue
                },
                realTime: {
                    onlineUsers,
                    activeSessions
                },
                recentActivity: recentActivity.map(user => ({
                    id: user.id,
                    type: user.role === 'instructor' && !user.isVerified ? 'teacher_approval' : 
                          user.role === 'instructor' ? 'new_teacher' : 'new_student',
                    user: user.name,
                    action: user.role === 'instructor' && !user.isVerified ? 'Applied to become teacher' : 
                            user.role === 'instructor' ? 'Registered as teacher' : 'Registered as student',
                    time: formatTimeAgo(user.createdAt),
                    status: user.isVerified ? 'success' : user.role === 'instructor' ? 'pending' : 'success'
                }))
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get all users with filtering and pagination
// @route    GET /api/admin/users
// @access   Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && role !== 'all') {
            whereClause.role = role;
        }

        if (status && status !== 'all') {
            if (status === 'pending') {
                whereClause.isVerified = false;
                whereClause.role = 'instructor';
            } else if (status === 'approved') {
                whereClause.isVerified = true;
                whereClause.role = 'instructor';
            } else if (status === 'active') {
                whereClause.lastLogin = {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                };
            }
        }

        // Get users with pagination
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: Course,
                    as: 'courses',
                    attributes: ['id'],
                    required: false
                }
            ],
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        // Format response
        const formattedUsers = users.map(user => ({
            ...user.dataValues,
            courses: user.courses ? user.courses.length : 0,
            students: 0, // Would need to calculate from enrollments
            revenue: 0 // Would need to calculate from transactions
        }));

        res.json({
            success: true,
            data: {
                users: formattedUsers,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// @desc    Approve teacher application
// @route    PUT /api/admin/users/:userId/approve
// @access   Private (Admin only)
export const approveTeacher = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'instructor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a teacher'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Teacher is already approved'
            });
        }

        // Approve teacher
        await user.update({
            isVerified: true,
            verifiedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Teacher approved successfully',
            data: {
                userId: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Approve teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve teacher',
            error: error.message
        });
    }
};

// @desc    Decline teacher application
// @route    PUT /api/admin/users/:userId/decline
// @access   Private (Admin only)
export const declineTeacher = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'instructor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a teacher'
            });
        }

        // Decline teacher (delete or mark as declined)
        await user.update({
            isVerified: false,
            status: 'declined',
            declinedAt: new Date(),
            declineReason: reason || 'Application does not meet requirements'
        });

        res.json({
            success: true,
            message: 'Teacher application declined',
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                reason
            }
        });
    } catch (error) {
        console.error('Decline teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to decline teacher',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route    DELETE /api/admin/users/:userId
// @access   Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete user (cascade delete will handle related records)
        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// @desc    Get user details
// @route    GET /api/admin/users/:userId
// @access   Private (Admin only)
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: Course,
                    as: 'courses',
                    attributes: ['id', 'title', 'status', 'createdAt'],
                    required: false
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get additional stats
        const courseCount = user.courses ? user.courses.length : 0;
        const studentCount = 0; // Would need to calculate from enrollments
        const revenue = 0; // Would need to calculate from transactions

        res.json({
            success: true,
            data: {
                ...user.dataValues,
                courses: user.courses,
                stats: {
                    courses: courseCount,
                    students: studentCount,
                    revenue
                }
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details',
            error: error.message
        });
    }
};

// @desc    Get real-time activity
// @route    GET /api/admin/activity
// @access   Private (Admin only)
export const getRealTimeActivity = async (req, res) => {
    try {
        // Get recent logins, registrations, course creations, etc.
        const recentLogins = await User.findAll({
            where: {
                lastLogin: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            attributes: ['name', 'email', 'lastLogin'],
            order: [['lastLogin', 'DESC']],
            limit: 10
        });

        const recentRegistrations = await User.findAll({
            where: {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            attributes: ['name', 'email', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                recentLogins: recentLogins.map(user => ({
                    user: user.name,
                    ip: '192.168.1.' + Math.floor(Math.random() * 254),
                    time: formatTimeAgo(user.lastLogin)
                })),
                recentRegistrations: recentRegistrations.map(user => ({
                    user: user.name,
                    action: `Registered as ${user.role}`,
                    time: formatTimeAgo(user.createdAt)
                })),
                onlineUsers: Math.floor(Math.random() * 50) + 100,
                activeSessions: Math.floor(Math.random() * 30) + 50
            }
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity',
            error: error.message
        });
    }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
};

export default {
    getDashboardStats,
    getAllUsers,
    approveTeacher,
    declineTeacher,
    deleteUser,
    getUserDetails,
    getRealTimeActivity
};
