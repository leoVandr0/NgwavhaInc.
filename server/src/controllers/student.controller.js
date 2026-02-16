import { Enrollment, Course, User, Progress, Achievement } from '../models';

// Get student statistics
const getStudentStats = async (userId) => {
    try {
        // Get enrolled courses count
        const enrolledCourses = await Enrollment.count({
            where: { userId, status: 'active' }
        });

        // Get completed lessons count
        const completedLessons = await Progress.count({
            where: { userId, completed: true }
        });

        // Get certificates count
        const certificates = await Achievement.count({
            where: { userId, type: 'certificate' }
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
const getStudentCourses = async (userId) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId, status: 'active' },
            include: [
                {
                    model: Course,
                    as: 'course'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        return enrollments.map(enrollment => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            instructor: enrollment.course.instructor || 'Instructor',
            timeAgo: getTimeAgo(enrollment.lastAccessed || enrollment.createdAt),
            progress: enrollment.progress || 0,
            lessons: `${enrollment.completedLessons || 0}/${enrollment.totalLessons || 0}`,
            thumbnail: enrollment.course.thumbnail || 'https://via.placeholder.com/300x200',
            lastAccessed: enrollment.lastAccessed || enrollment.createdAt,
            status: enrollment.status
        }));
    } catch (error) {
        console.error('Error getting student courses:', error);
        throw error;
    }
};

// Get weekly progress
const getStudentProgress = async (userId) => {
    try {
        // Get progress for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const progress = await Progress.findAll({
            where: {
                userId,
                completedAt: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            order: [['completedAt', 'ASC']]
        });

        // Group by day
        const dailyProgress = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize all days with 0 hours
        days.forEach(day => {
            dailyProgress[day] = { hours: 0, lessons: 0 };
        });

        // Calculate hours per day
        progress.forEach(item => {
            const dayName = days[item.completedAt.getDay()];
            dailyProgress[dayName].hours += 0.5; // 30 minutes per lesson
            dailyProgress[dayName].lessons += 1;
        });

        // Convert to array format
        return days.map(day => ({
            day,
            hours: dailyProgress[day].hours,
            height: `${Math.min(100, dailyProgress[day].hours * 25)}%`,
            date: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error getting student progress:', error);
        throw error;
    }
};

// Get achievements
const getStudentAchievements = async (userId) => {
    try {
        const achievements = await Achievement.findAll({
            where: { userId },
            order: [['earnedAt', 'DESC']],
            limit: 10
        });

        return achievements.map(achievement => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            date: `Earned ${new Date(achievement.earnedAt).toLocaleDateString()}`,
            icon: achievement.icon || '🏆',
            type: achievement.type
        }));
    } catch (error) {
        console.error('Error getting achievements:', error);
        throw error;
    }
};

// Get recent activity
const getStudentActivity = async (userId) => {
    try {
        // Combine different types of activity
        const [recentProgress, recentEnrollments, recentAchievements] = await Promise.all([
            Progress.findAll({
                where: { userId },
                order: [['completedAt', 'DESC']],
                limit: 5
            }),
            Enrollment.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
                limit: 3
            }),
            Achievement.findAll({
                where: { userId },
                order: [['earnedAt', 'DESC']],
                limit: 3
            })
        ]);

        const activities = [];

        // Add progress activities
        recentProgress.forEach(progress => {
            activities.push({
                id: `progress_${progress.id}`,
                type: 'lesson_completed',
                title: `Completed: ${progress.lessonTitle || 'Lesson'}`,
                course: progress.courseTitle || 'Course',
                time: getTimeAgo(progress.completedAt),
                icon: '✅'
            });
        });

        // Add enrollment activities
        recentEnrollments.forEach(enrollment => {
            activities.push({
                id: `enrollment_${enrollment.id}`,
                type: 'course_enrolled',
                title: `Enrolled: ${enrollment.courseTitle || 'Course'}`,
                course: enrollment.courseTitle || 'Course',
                time: getTimeAgo(enrollment.createdAt),
                icon: '📚'
            });
        });

        // Add achievement activities
        recentAchievements.forEach(achievement => {
            activities.push({
                id: `achievement_${achievement.id}`,
                type: 'achievement_earned',
                title: `Achievement: ${achievement.title}`,
                description: achievement.description,
                time: getTimeAgo(achievement.earnedAt),
                icon: achievement.icon || '🏆'
            });
        });

        // Sort by time and return recent
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10);
    } catch (error) {
        console.error('Error getting student activity:', error);
        throw error;
    }
};

// Helper functions
const calculateLearningStreak = async (userId) => {
    try {
        // Simplified streak calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentActivity = await Progress.count({
            where: {
                userId,
                completedAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Simple streak based on recent activity
        return Math.min(45, Math.floor(recentActivity / 3)); // Max 45 days
    } catch (error) {
        return 0;
    }
};

const calculateAverageProgress = async (userId) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId, status: 'active' }
        });

        if (enrollments.length === 0) return 0;

        const totalProgress = enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0);
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

module.exports = {
    getStudentStats,
    getStudentCourses,
    getStudentProgress,
    getStudentAchievements,
    getStudentActivity
};
