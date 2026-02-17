import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getStudentStats, getStudentCourses, getStudentProgress, getStudentAchievements, getStudentActivity, batchCreateActivities } from '../controllers/student.controller.js';

const router = express.Router();

// Get student statistics
router.get('/stats', protect, async (req, res) => {
    try {
        const stats = await getStudentStats(req.user.id);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student stats',
            error: error.message
        });
    }
});

// Get enrolled courses
router.get('/courses', protect, async (req, res) => {
    try {
        const courses = await getStudentCourses(req.user.id);
        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Error fetching student courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses',
            error: error.message
        });
    }
});

// Get weekly progress
router.get('/progress', protect, async (req, res) => {
    try {
        const progress = await getStudentProgress(req.user.id);
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Error fetching student progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress',
            error: error.message
        });
    }
});

// Get achievements
router.get('/achievements', protect, async (req, res) => {
    try {
        const achievements = await getStudentAchievements(req.user.id);
        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements',
            error: error.message
        });
    }
});

// Get recent activity
router.get('/activity', protect, async (req, res) => {
    try {
        const activity = await getStudentActivity(req.user.id);
        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity',
            error: error.message
        });
    }
});

// Batch create activities (for real-time tracking)
router.post('/activity/batch', protect, async (req, res) => {
    try {
        const { activities } = req.body;
        await batchCreateActivities(req.user.id, activities);
        res.json({
            success: true,
            message: 'Activities recorded successfully'
        });
    } catch (error) {
        console.error('Error recording activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record activities',
            error: error.message
        });
    }
});

export default router;
