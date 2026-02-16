import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createNotification, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../controllers/notification.controller.js';

const router = express.Router();

// Get all notifications for a user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await getUserNotifications(req.user.id);
        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
});

// Create a new notification (admin only)
router.post('/', protect, async (req, res) => {
    try {
        // Only admins can create notifications for now
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { userId, type, title, message, data } = req.body;
        
        const notification = await createNotification({
            userId,
            type,
            title,
            message,
            data: data ? JSON.parse(data) : null,
            createdBy: req.user.id
        });

        // Emit real-time notification
        req.app.get('io').to(`user_${userId}`).emit('notification', notification);

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const { id } = req.params;
        await markNotificationAsRead(req.user.id, id);
        
        // Emit real-time update
        req.app.get('io').to(`user_${req.user.id}`).emit('notification_read', { notificationId: id });

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
});

// Mark all notifications as read
router.put('/read-all', protect, async (req, res) => {
    try {
        await markAllNotificationsAsRead(req.user.id);
        
        // Emit real-time update
        req.app.get('io').to(`user_${req.user.id}`).emit('all_notifications_read');

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        await deleteNotification(req.user.id, id);
        
        // Emit real-time update
        req.app.get('io').to(`user_${req.user.id}`).emit('notification_deleted', { notificationId: id });

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
});

export default router;
