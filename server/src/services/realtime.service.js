import { Server } from 'socket.io';
import notificationService from './notification.service.js';
import User from '../models/User.js';

class RealtimeService {
    constructor() {
        this.io = null;
        this.adminClients = new Set();
        this.userClients = new Map(); // socketId -> { userId, role }
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            console.log('Client connected to real-time service:', socket.id);

            // Handle user authentication
            socket.on('user-auth', (data) => {
                if (data.userId && data.role) {
                    this.userClients.set(socket.id, {
                        userId: data.userId,
                        role: data.role
                    });
                    socket.join(`user-${data.userId}`);
                    socket.join(`role-${data.role}`);
                    socket.join('all-users');
                    console.log('User client authenticated:', socket.id, 'Role:', data.role);
                }
            });

            // Handle admin authentication
            socket.on('admin-auth', (data) => {
                if (data.role === 'admin') {
                    this.adminClients.add(socket.id);
                    this.userClients.set(socket.id, {
                        userId: data.userId,
                        role: 'admin'
                    });
                    socket.join('admin-room');
                    socket.join('all-users');
                    console.log('Admin client authenticated:', socket.id);
                    this.sendInitialData(socket);
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.adminClients.delete(socket.id);
                this.userClients.delete(socket.id);
                socket.leave('admin-room');
                socket.leave('all-users');
                console.log('Client disconnected:', socket.id);
            });

            // Handle real-time dashboard requests
            socket.on('request-dashboard-update', async () => {
                await this.sendDashboardUpdate(socket);
            });

            // Handle alert acknowledgment
            socket.on('alert:acknowledge', (data) => {
                console.log('Alert acknowledged by user:', data.userId);
            });
        });

        // Set up global broadcast function
        global.broadcastToAdmins = (event, data) => {
            this.broadcastToAdmins(event, data);
        };

        // Set up global broadcast to all users
        global.broadcastToAll = (event, data, targetAudience = 'all') => {
            this.broadcastToAll(event, data, targetAudience);
        };

        console.log('Real-time service initialized');
    }

    async sendInitialData(socket) {
        try {
            // Import here to avoid circular dependencies
            const { getRealTimeUpdates } = await import('../controllers/admin.controller.js');

            // Mock request object
            const mockReq = { user: { role: 'admin' } };
            const mockRes = {
                json: (data) => {
                    socket.emit('dashboard-initial-data', data);
                }
            };

            await getRealTimeUpdates(mockReq, mockRes);
        } catch (error) {
            console.error('Error sending initial data:', error);
            socket.emit('error', { message: 'Failed to load initial data' });
        }
    }

    async sendDashboardUpdate(socket) {
        try {
            const { getRealTimeUpdates } = await import('../controllers/admin.controller.js');

            const mockReq = { user: { role: 'admin' } };
            const mockRes = {
                json: (data) => {
                    socket.emit('dashboard-update', data);
                }
            };

            await getRealTimeUpdates(mockReq, mockRes);
        } catch (error) {
            console.error('Error sending dashboard update:', error);
            socket.emit('error', { message: 'Failed to update dashboard' });
        }
    }

    broadcastToAdmins(event, data) {
        if (this.io) {
            this.io.to('admin-room').emit(event, data);
            console.log(`Broadcasted to ${this.adminClients.size} admin clients:`, event);
        }
    }

    // Broadcast to all users or specific role
    broadcastToAll(event, data, targetAudience = 'all') {
        if (!this.io) return;

        let targetRoom = 'all-users';
        let clientCount = this.userClients.size;

        if (targetAudience !== 'all') {
            targetRoom = `role-${targetAudience}`;
            // Count clients in target audience
            clientCount = Array.from(this.userClients.values()).filter(
                client => client.role === targetAudience
            ).length;
        }

        this.io.to(targetRoom).emit(event, data);
        console.log(`Broadcasted to ${clientCount} ${targetAudience} clients:`, event);
        return clientCount;
    }

    // Send public alert to all users
    async sendPublicAlert(alertData) {
        const { title, message, priority, targetAudience, notificationId } = alertData;

        const alertPayload = {
            id: notificationId,
            title,
            message,
            priority,
            targetAudience,
            type: 'broadcast',
            timestamp: new Date().toISOString()
        };

        // Broadcast to target audience
        const deliveryCount = this.broadcastToAll('public-alert', alertPayload, targetAudience);

        console.log(`Public alert sent to ${deliveryCount} users:`, title);
        return deliveryCount;
    }

    // Notify all admins when new user registers
    notifyNewUser(userData) {
        this.broadcastToAdmins('new-user', {
            type: 'new_user',
            user: userData,
            message: `New ${userData.role} registered: ${userData.name}`,
            timestamp: new Date().toISOString()
        });
    }

    // Notify admins when instructor applies for approval
    async notifyInstructorApplication(instructorData) {
        this.broadcastToAdmins('instructor-application', {
            type: 'instructor_application',
            instructor: instructorData,
            message: `New instructor application: ${instructorData.name}`,
            timestamp: new Date().toISOString()
        });

        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
            await notificationService.sendMultiChannelNotification(admin, {
                subject: 'New Instructor Application',
                emailBody: `<h1>New Instructor</h1><p>${instructorData.name} has applied to be an instructor. Please review their application.</p>`,
                shortMessage: `New instructor application from ${instructorData.name}. Please review in the admin dashboard.`
            });
        }
    }

    // Notify admins when course is created
    async notifyNewCourse(courseData) {
        this.broadcastToAdmins('new-course', {
            type: 'new_course',
            course: courseData,
            message: `New course created: ${courseData.title}`,
            timestamp: new Date().toISOString()
        });

        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
            await notificationService.sendMultiChannelNotification(admin, {
                subject: 'New Course Submitted',
                emailBody: `<h1>New Course!</h1><p>A new course "<strong>${courseData.title}</strong>" has been submitted and is pending review.</p>`,
                shortMessage: `New course submitted: "${courseData.title}". Please review it in the admin dashboard.`
            });
        }
    }

    // Notify admins of system events
    notifySystemEvent(eventData) {
        this.broadcastToAdmins('system-event', {
            type: 'system_event',
            ...eventData,
            timestamp: new Date().toISOString()
        });
    }

    // Get current admin client count
    getAdminClientCount() {
        return this.adminClients.size;
    }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
