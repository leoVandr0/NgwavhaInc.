import { io } from 'socket.io-client';
import api from './api';

class NotificationService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(userId) {
        if (this.socket) {
            this.socket.disconnect();
        }

        const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        this.socket = io(serverUrl, {
            auth: {
                token: localStorage.getItem('token'),
                userId: userId
            },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('🔔 Connected to notification server');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', () => {
            console.log('🔔 Disconnected from notification server');
            this.attemptReconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔔 Connection error:', error);
            this.attemptReconnect();
        });

        // Notification events
        this.socket.on('notification', (data) => {
            console.log('🔔 New notification received:', data);
            this.emit('notification', data);
        });

        this.socket.on('notification_read', (data) => {
            console.log('🔔 Notification read:', data);
            this.emit('notification_read', data);
        });

        this.socket.on('notification_deleted', (data) => {
            console.log('🔔 Notification deleted:', data);
            this.emit('notification_deleted', data);
        });

        // System events
        this.socket.on('course_update', (data) => {
            console.log('📚 Course update:', data);
            this.emit('course_update', data);
        });

        this.socket.on('assignment_reminder', (data) => {
            console.log('📝 Assignment reminder:', data);
            this.emit('assignment_reminder', data);
        });

        this.socket.on('new_message', (data) => {
            console.log('💬 New message:', data);
            this.emit('new_message', data);
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

            setTimeout(() => {
                this.socket.connect();
            }, delay);
        } else {
            console.error('🔔 Max reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Event listener management
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in notification listener:', error);
                }
            });
        }
    }

    // API methods
    async getNotifications() {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead() {
        try {
            const response = await api.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId) {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Notification creation
    async createNotification(notificationData) {
        try {
            const response = await api.post('/notifications', notificationData);
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Notification preferences
    async updatePreferences(preferences) {
        try {
            const response = await api.put('/user/notification-preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }

    async getPreferences() {
        try {
            const response = await api.get('/user/notification-preferences');
            return response.data;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            return null;
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
