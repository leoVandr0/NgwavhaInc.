import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const useStudentData = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [studentStats, setStudentStats] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchStudentData();
        }
    }, [currentUser]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            
            // Fetch all student data in parallel
            const [statsRes, coursesRes, progressRes, achievementsRes, activityRes] = await Promise.all([
                api.get('/api/student/stats'),
                api.get('/api/student/courses'),
                api.get('/api/student/progress'),
                api.get('/api/student/achievements'),
                api.get('/api/student/activity')
            ]);

            setStudentStats(statsRes.data);
            setEnrolledCourses(coursesRes.data);
            setWeeklyProgress(progressRes.data);
            setAchievements(achievementsRes.data);
            setRecentActivity(activityRes.data);
        } catch (error) {
            console.error('Error fetching student data:', error);
            // Set fallback data if API fails
            setFallbackData();
        } finally {
            setLoading(false);
        }
    };

    const setFallbackData = () => {
        setStudentStats({
            enrolledCourses: 12,
            hoursLearned: 248,
            certificates: 8,
            learningStreak: 45,
            completedLessons: 156,
            averageProgress: 68
        });

        setWeeklyProgress([
            { day: 'Mon', hours: 2.5, height: '40%', date: '2026-02-10' },
            { day: 'Tue', hours: 1.5, height: '25%', date: '2026-02-11' },
            { day: 'Wed', hours: 3, height: '50%', date: '2026-02-12' },
            { day: 'Thu', hours: 0, height: '4%', date: '2026-02-13' },
            { day: 'Fri', hours: 2, height: '35%', date: '2026-02-14' },
            { day: 'Sat', hours: 4, height: '70%', date: '2026-02-15' },
            { day: 'Sun', hours: 1, height: '15%', date: '2026-02-16' }
        ]);

        setAchievements([
            {
                id: 1,
                title: 'Fast Learner',
                description: 'Completed 5 courses in one month',
                date: 'Earned Jan 15, 2026',
                icon: '🚀',
                type: 'speed'
            },
            {
                id: 2,
                title: 'Coding Streak',
                description: '30 days learning streak',
                date: 'Earned Jan 10, 2026',
                icon: '🔥',
                type: 'streak'
            },
            {
                id: 3,
                title: 'Certificate Master',
                description: 'Earned 10 certificates',
                date: 'Earned Dec 28, 2025',
                icon: '🏆',
                type: 'certificate'
            },
            {
                id: 4,
                title: 'Early Bird',
                description: 'Completed lessons before 8 AM for 7 days',
                date: 'Earned Dec 20, 2025',
                icon: '🌅',
                type: 'early'
            }
        ]);

        setEnrolledCourses([
            {
                id: 1,
                title: 'Complete Web Development Bootcamp 2026',
                instructor: 'Angela Yu',
                timeAgo: '2 hours ago',
                progress: 68,
                lessons: '35/52',
                thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300',
                lastAccessed: '2026-02-16T18:30:00Z',
                status: 'active'
            },
            {
                id: 2,
                title: 'Advanced React & Redux Masterclass',
                instructor: 'Maximilian Schwarzmüller',
                timeAgo: '1 day ago',
                progress: 42,
                lessons: '16/38',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=300',
                lastAccessed: '2026-02-15T14:20:00Z',
                status: 'active'
            },
            {
                id: 3,
                title: 'Python for Data Science and Machine Learning',
                instructor: 'Jose Portilla',
                timeAgo: '3 days ago',
                progress: 25,
                lessons: '11/45',
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=300',
                lastAccessed: '2026-02-13T09:15:00Z',
                status: 'active'
            }
        ]);

        setRecentActivity([
            {
                id: 1,
                type: 'lesson_completed',
                title: 'Completed: JavaScript Fundamentals',
                course: 'Web Development Bootcamp',
                time: '2 hours ago',
                icon: '✅'
            },
            {
                id: 2,
                type: 'course_enrolled',
                title: 'Enrolled: React Advanced Patterns',
                course: 'React Masterclass',
                time: '1 day ago',
                icon: '📚'
            },
            {
                id: 3,
                type: 'achievement_earned',
                title: 'Achievement: Fast Learner',
                description: 'Completed 5 courses this month',
                time: '3 days ago',
                icon: '🏆'
            }
        ]);
    };

    const refreshData = () => {
        fetchStudentData();
    };

    const updateCourseProgress = (courseId, newProgress) => {
        setEnrolledCourses(prev => 
            prev.map(course => 
                course.id === courseId 
                    ? { ...course, progress: newProgress }
                    : course
            )
        );
    };

    return {
        loading,
        studentStats,
        enrolledCourses,
        weeklyProgress,
        achievements,
        recentActivity,
        refreshData,
        updateCourseProgress
    };
};

export default useStudentData;
