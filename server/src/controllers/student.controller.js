import { Enrollment, Course, User } from '../models';
import Activity from '../models/nosql/Activity.js';

// Get student statistics
const getStudentStats = async (userId) => {
    try {
        // Get enrolled courses count
        const enrolledCourses = await Enrollment.count({
            where: { userId, isCompleted: false }
        });

        // Get completed courses count
        const completedCourses = await Enrollment.count({
            where: { userId, isCompleted: true }
        });

        // Get total learning hours from activity
        const learningActivities = await Activity.find({
            userId,
            action: { $in: ['lesson_complete', 'course_view', 'video_watch'] }
        });

        // Estimate hours (30 minutes per lesson, 15 minutes per video, 10 minutes per course view)
        let totalMinutes = 0;
        learningActivities.forEach(activity => {
            switch (activity.action) {
                case 'lesson_complete':
                    totalMinutes += 30;
                    break;
                case 'video_watch':
                    totalMinutes += 15;
                    break;
                case 'course_view':
                    totalMinutes += 10;
                    break;
            }
        });

        const hoursLearned = Math.floor(totalMinutes / 60);

        // Get certificates count (completed courses with certificates)
        const certificates = await Enrollment.count({
            where: { 
                userId, 
                isCompleted: true,
                certificateUrl: { [Op.ne]: null }
            }
        });

        // Calculate learning streak based on daily activity
        const learningStreak = await calculateLearningStreak(userId);

        // Calculate average progress across all enrollments
        const allEnrollments = await Enrollment.findAll({
            where: { userId },
            attributes: ['progress']
        });

        const averageProgress = allEnrollments.length > 0 
            ? Math.floor(allEnrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / allEnrollments.length)
            : 0;

        return {
            enrolledCourses,
            completedCourses,
            hoursLearned,
            certificates,
            learningStreak,
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
            where: { userId },
            include: [
                {
                    model: Course,
                    as: 'course'
                }
            ],
            order: [['lastAccessedAt', 'DESC']],
            limit: 10
        });

        return enrollments.map(enrollment => {
            const course = enrollment.course;
            const totalLectures = course.lectures ? course.lectures.length : 0;
            const completedLectures = enrollment.completedLectures ? enrollment.completedLectures.length : 0;

            return {
                id: course.id,
                title: course.title,
                instructor: course.instructor || 'Instructor',
                timeAgo: getTimeAgo(enrollment.lastAccessedAt),
                progress: Math.floor(enrollment.progress || 0),
                lessons: `${completedLectures}/${totalLectures}`,
                thumbnail: course.thumbnail || 'https://via.placeholder.com/300x200',
                lastAccessed: enrollment.lastAccessedAt,
                status: enrollment.isCompleted ? 'completed' : 'active'
            };
        });
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

        const activities = await Activity.find({
            userId,
            timestamp: { $gte: sevenDaysAgo },
            action: { $in: ['lesson_complete', 'video_watch', 'course_view'] }
        }).sort({ timestamp: 1 });

        // Group by day
        const dailyProgress = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize all days with 0 hours
        days.forEach(day => {
            dailyProgress[day] = { hours: 0, lessons: 0 };
        });

        // Calculate hours per day
        activities.forEach(activity => {
            const dayName = days[activity.timestamp.getDay()];
            let minutes = 0;
            
            switch (activity.action) {
                case 'lesson_complete':
                    minutes = 30;
                    break;
                case 'video_watch':
                    minutes = 15;
                    break;
                case 'course_view':
                    minutes = 10;
                    break;
            }
            
            dailyProgress[dayName].hours += minutes / 60;
            dailyProgress[dayName].lessons += 1;
        });

        // Convert to array format
        return days.map(day => ({
            day,
            hours: Math.round(dailyProgress[day].hours * 10) / 10,
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
        // Generate achievements based on actual student activity
        const achievements = [];
        
        // Get student stats for achievement calculation
        const stats = await getStudentStats(userId);
        
        // Course completion achievements
        if (stats.completedCourses >= 1) {
            achievements.push({
                id: 'first_course',
                title: 'First Course Completed',
                description: `Completed your first course`,
                date: 'Earned recently',
                icon: '🎯',
                type: 'course'
            });
        }
        
        if (stats.completedCourses >= 5) {
            achievements.push({
                id: 'course_master',
                title: 'Course Master',
                description: `Completed ${stats.completedCourses} courses`,
                date: 'Earned recently',
                icon: '🏆',
                type: 'course'
            });
        }
        
        // Learning streak achievements
        if (stats.learningStreak >= 7) {
            achievements.push({
                id: 'week_streak',
                title: 'Week Warrior',
                description: '7 days learning streak',
                date: 'Earned recently',
                icon: '🔥',
                type: 'streak'
            });
        }
        
        if (stats.learningStreak >= 30) {
            achievements.push({
                id: 'month_streak',
                title: 'Monthly Champion',
                description: '30 days learning streak',
                date: 'Earned recently',
                icon: '💎',
                type: 'streak'
            });
        }
        
        // Hours learned achievements
        if (stats.hoursLearned >= 10) {
            achievements.push({
                id: 'ten_hours',
                title: 'Dedicated Learner',
                description: `Learned for ${stats.hoursLearned} hours`,
                date: 'Earned recently',
                icon: '⏰',
                type: 'time'
            });
        }
        
        // Certificate achievements
        if (stats.certificates >= 1) {
            achievements.push({
                id: 'first_cert',
                title: 'Certificate Earner',
                description: `Earned your first certificate`,
                date: 'Earned recently',
                icon: '📜',
                type: 'certificate'
            });
        }

        return achievements;
    } catch (error) {
        console.error('Error getting achievements:', error);
        throw error;
    }
};

// Get recent activity
const getStudentActivity = async (userId) => {
    try {
        // Get recent activities from MongoDB
        const activities = await Activity.find({
            userId
        })
        .sort({ timestamp: -1 })
        .limit(20);

        const formattedActivities = [];

        activities.forEach(activity => {
            let activityData = {
                id: activity._id,
                time: getTimeAgo(activity.timestamp),
                icon: getActivityIcon(activity.action)
            };

            switch (activity.action) {
                case 'lesson_complete':
                    activityData.type = 'lesson_completed';
                    activityData.title = `Completed: ${activity.details.lessonTitle || 'Lesson'}`;
                    activityData.course = activity.details.courseTitle || 'Course';
                    break;
                    
                case 'course_enroll':
                    activityData.type = 'course_enrolled';
                    activityData.title = `Enrolled: ${activity.details.courseTitle || 'Course'}`;
                    activityData.course = activity.details.courseTitle || 'Course';
                    break;
                    
                case 'login':
                    activityData.type = 'login';
                    activityData.title = 'Logged in to platform';
                    break;
                    
                case 'course_view':
                    activityData.type = 'course_viewed';
                    activityData.title = `Viewed: ${activity.details.courseTitle || 'Course'}`;
                    activityData.course = activity.details.courseTitle || 'Course';
                    break;
                    
                case 'video_watch':
                    activityData.type = 'video_watched';
                    activityData.title = `Watched: ${activity.details.videoTitle || 'Video'}`;
                    activityData.course = activity.details.courseTitle || 'Course';
                    break;
                    
                default:
                    activityData.type = 'general';
                    activityData.title = activity.action.replace('_', ' ').charAt(0).toUpperCase() + activity.action.slice(1);
            }

            formattedActivities.push(activityData);
        });

        return formattedActivities;
    } catch (error) {
        console.error('Error getting student activity:', error);
        throw error;
    }
};

// Helper functions
const calculateLearningStreak = async (userId) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activities = await Activity.find({
            userId,
            timestamp: { $gte: thirtyDaysAgo },
            action: { $in: ['lesson_complete', 'video_watch', 'course_view'] }
        });

        if (activities.length === 0) return 0;

        // Group activities by day
        const daysWithActivity = new Set();
        activities.forEach(activity => {
            const dayKey = activity.timestamp.toISOString().split('T')[0];
            daysWithActivity.add(dayKey);
        });

        // Calculate consecutive days from today backwards
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dayKey = checkDate.toISOString().split('T')[0];
            
            if (daysWithActivity.has(dayKey)) {
                streak++;
            } else if (i > 0) {
                break; // Break if we miss a day (but allow today to be missed)
            }
        }

        return streak;
    } catch (error) {
        console.error('Error calculating learning streak:', error);
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

const getActivityIcon = (action) => {
    const icons = {
        'lesson_complete': '✅',
        'course_enroll': '📚',
        'login': '🔑',
        'course_view': '👁️',
        'video_watch': '🎥',
        'assignment_submit': '📝',
        'quiz_complete': '🧪',
        'certificate_earned': '🏆'
    };
    return icons[action] || '📌';
};

// Batch create activities for real-time tracking
const batchCreateActivities = async (userId, activities) => {
    try {
        const activityDocuments = activities.map(activity => ({
            userId,
            action: activity.action,
            resourceType: activity.resourceType,
            resourceId: activity.resourceId,
            details: activity.details,
            timestamp: activity.details.timestamp ? new Date(activity.details.timestamp) : new Date(),
            ipAddress: activity.details.ipAddress || null,
            userAgent: activity.details.userAgent || null
        }));

        // Insert all activities in bulk
        await Activity.insertMany(activityDocuments);
        
        console.log(`Recorded ${activityDocuments.length} activities for user ${userId}`);
    } catch (error) {
        console.error('Error batch creating activities:', error);
        throw error;
    }
};

export {
    getStudentStats,
    getStudentCourses,
    getStudentProgress,
    getStudentAchievements,
    getStudentActivity,
    batchCreateActivities
};
