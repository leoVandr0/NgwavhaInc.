import { useState, useEffect } from 'react';
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
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchStudentData();
        } else {
            // Reset data when user logs out
            resetData();
        }
    }, [currentUser]);

    const resetData = () => {
        setStudentStats(null);
        setEnrolledCourses([]);
        setWeeklyProgress([]);
        setAchievements([]);
        setRecentActivity([]);
        setError(null);
        setLoading(false);
    };

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all student data in parallel
            const [statsRes, coursesRes, progressRes, achievementsRes, activityRes] = await Promise.all([
                api.get('/api/student/stats'),
                api.get('/api/student/courses'),
                api.get('/api/student/progress'),
                api.get('/api/student/achievements'),
                api.get('/api/student/activity')
            ]);

            // Set real data from API
            if (statsRes.data) {
                setStudentStats(statsRes.data);
            }
            
            if (coursesRes.data) {
                setEnrolledCourses(coursesRes.data);
            }
            
            if (progressRes.data) {
                setWeeklyProgress(progressRes.data);
            }
            
            if (achievementsRes.data) {
                setAchievements(achievementsRes.data);
            }
            
            if (activityRes.data) {
                setRecentActivity(activityRes.data);
            }

        } catch (error) {
            console.error('Error fetching student data:', error);
            setError(error.message || 'Failed to load student data');
            
            // Set empty state instead of dummy data
            setStudentStats({
                enrolledCourses: 0,
                completedCourses: 0,
                hoursLearned: 0,
                certificates: 0,
                learningStreak: 0,
                averageProgress: 0
            });
            
            setEnrolledCourses([]);
            setWeeklyProgress(getEmptyWeeklyProgress());
            setAchievements([]);
            setRecentActivity([]);
        } finally {
            setLoading(false);
        }
    };

    const getEmptyWeeklyProgress = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map(day => ({
            day,
            hours: 0,
            height: '4%',
            date: new Date().toISOString()
        }));
    };

    const refreshData = () => {
        if (currentUser) {
            fetchStudentData();
        }
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

    // Function to add new activity (for real-time updates)
    const addActivity = (activity) => {
        setRecentActivity(prev => [activity, ...prev.slice(0, 9)]);
    };

    // Function to update stats (for real-time updates)
    const updateStats = (newStats) => {
        setStudentStats(prev => ({ ...prev, ...newStats }));
    };

    return {
        loading,
        error,
        studentStats,
        enrolledCourses,
        weeklyProgress,
        achievements,
        recentActivity,
        refreshData,
        updateCourseProgress,
        addActivity,
        updateStats
    };
};

export default useStudentData;
