import { Enrollment, Course, User, Category } from '../models/index.js';
import Activity from '../models/nosql/Activity.js';
import { Op } from 'sequelize';

// Get student statistics
export const getStudentStats = async (userId) => {
    try {
        // Get enrolled courses count
        const enrolledCourses = await Enrollment.count({
            where: { userId }
        });

        // Get completed lessons count (stored in Enrollment model)
        const activeEnrollments = await Enrollment.findAll({
            where: { userId }
        });

        const completedLessons = activeEnrollments.reduce((sum, e) => sum + (e.completedLectures?.length || 0), 0);

        // Get certificates count (stored in Enrollment model)
        const certificates = await Enrollment.count({
            where: {
                userId,
                isCompleted: true,
                certificateUrl: { [Op.ne]: null }
            }
        });

        // Calculate learning streak (simplified - in real app would track daily activity)
        const learningStreak = await calculateLearningStreak(userId);

        // Calculate average progress
        const averageProgress = await calculateAverageProgress(userId);

        return {
            enrolledCourses,
            hoursLearned: Math.floor(completedLessons * 0.5), // Estimate: 30 min per lesson
            certificates,
            learningStreak,
            completedLessons,
            averageProgress
        };
    } catch (error) {
        console.error('Error getting student stats:', error);
        throw error;
    }
};

// Get enrolled courses
export const getStudentCourses = async (userId) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [{ model: User, as: 'instructor', attributes: ['name'] }]
                }
            ],
            order: [['lastAccessedAt', 'DESC']],
            limit: 10
        });

        return enrollments.map(enrollment => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            instructor: enrollment.course.instructor?.name || 'Instructor',
            timeAgo: getTimeAgo(enrollment.lastAccessedAt || enrollment.createdAt),
            progress: enrollment.progress || 0,
            lessons: `${enrollment.completedLectures?.length || 0}/${enrollment.course.totalLectures || 0}`,
            thumbnail: enrollment.course.thumbnail || 'https://via.placeholder.com/300x200',
            lastAccessed: enrollment.lastAccessedAt || enrollment.createdAt,
            status: enrollment.isCompleted ? 'completed' : 'active'
        }));
    } catch (error) {
        console.error('Error getting student courses:', error);
        throw error;
    }
};

// Get weekly progress
export const getStudentProgress = async (userId) => {
    try {
        // Since we don't have a specific Progress model for daily history, 
        // we'll return a simplified or mock structure for the UI to prevent crashes,
        // or base it on recent Enrollment updates if possible.
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return days.map(day => ({
            day,
            hours: 0,
            height: '10%',
            date: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error getting student progress:', error);
        throw error;
    }
};

// Get achievements
export const getStudentAchievements = async (userId) => {
    try {
        // Using successfully completed enrollments as achievements for now
        const completedEnrollments = await Enrollment.findAll({
            where: { userId, isCompleted: true },
            include: [{ model: Course, as: 'course' }],
            order: [['completedAt', 'DESC']],
            limit: 10
        });

        return completedEnrollments.map(enrollment => ({
            id: enrollment.id,
            title: `Completed ${enrollment.course.title}`,
            description: `Successfully finished all lessons in ${enrollment.course.title}`,
            date: `Earned ${new Date(enrollment.completedAt).toLocaleDateString()}`,
            icon: '🎓',
            type: 'certificate'
        }));
    } catch (error) {
        console.error('Error getting achievements:', error);
        throw error;
    }
};

// Get recent activity
export const getStudentActivity = async (userId) => {
    try {
        // Fetch from MongoDB Activity model
        const recentActivities = await Activity.find({ userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        return recentActivities.map(activity => ({
            id: activity._id,
            type: activity.action,
            title: activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            course: activity.details?.courseTitle || 'Course',
            time: getTimeAgo(activity.timestamp),
            icon: activity.action.includes('complete') ? '✅' : '📚'
        }));
    } catch (error) {
        console.error('Error getting student activity:', error);
        // Fallback to empty to prevent UI crash
        return [];
    }
};

// Helper functions (kept as local functions, not exported)
const calculateLearningStreak = async (userId) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentActivity = await Activity.countDocuments({
            userId,
            timestamp: { $gte: thirtyDaysAgo }
        });

        return Math.min(45, Math.floor(recentActivity / 2));
    } catch (error) {
        return 0;
    }
};

const calculateAverageProgress = async (userId) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId }
        });

        if (enrollments.length === 0) return 0;

        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        return Math.floor(totalProgress / enrollments.length);
    } catch (error) {
        return 0;
    }
};

const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

