import { Notification } from '../models/Notification.js';

// Create a new notification
const createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create({
            ...notificationData,
            read: false,
            createdAt: new Date()
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get all notifications for a user
const getUserNotifications = async (userId) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        throw error;
    }
};

// Mark notification as read
const markNotificationAsRead = async (userId, notificationId) => {
    try {
        const [updatedRows] = await Notification.update(
            { read: true },
            {
                where: { id: notificationId, userId }
            }
        );
        
        if (updatedRows === 0) {
            throw new Error('Notification not found or access denied');
        }
        
        return updatedRows[0];
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
    try {
        const [updatedRows] = await Notification.update(
            { read: true },
            {
                where: { userId, read: false }
            }
        );
        return updatedRows;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Delete a notification
const deleteNotification = async (userId, notificationId) => {
    try {
        const [deletedRows] = await Notification.destroy({
            where: { id: notificationId, userId }
        });
        
        if (deletedRows === 0) {
            throw new Error('Notification not found or access denied');
        }
        
        return deletedRows[0];
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// Get unread count for a user
const getUnreadCount = async (userId) => {
    try {
        const count = await Notification.count({
            where: { userId, read: false }
        });
        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};

// Create system notifications for events
const createSystemNotification = async (userId, type, title, message, data = null) => {
    try {
        const notification = await createNotification({
            userId,
            type,
            title,
            message,
            data,
            createdBy: 'system'
        });
        return notification;
    } catch (error) {
        console.error('Error creating system notification:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
    createSystemNotification
};
