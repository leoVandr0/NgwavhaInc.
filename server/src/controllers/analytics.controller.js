import Analytics from '../models/nosql/Analytics.js';
import Activity from '../models/nosql/Activity.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import logger from '../utils/dbLogger.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Mocking stats for now, in a real scenario we'd aggregate from MongoDB/MySQL
        const stats = {
            totalUsers: await User.count(),
            totalCourses: await Course.count(),
            activeUsersToday: await Activity.distinct('userId', {
                timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }).then(users => users.length),
            recentActivity: await Activity.find().sort({ timestamp: -1 }).limit(10)
        };

        res.json(stats);
    } catch (error) {
        logger.error('Analytics', `Error fetching dashboard stats: ${error.message}`);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

export const getCourseAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const views = await Activity.countDocuments({
            resourceType: 'course',
            resourceId: courseId,
            action: 'course_view'
        });

        res.json({ courseId, views });
    } catch (error) {
        logger.error('Analytics', `Error fetching course analytics: ${error.message}`);
        res.status(500).json({ message: 'Error fetching course analytics' });
    }
};
