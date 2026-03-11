import { Server } from 'socket.io';
import notificationService from './notification.service.js';
import User from '../models/User.js';

class RealtimeService {
    constructor() {
        this.io = null;
        this.adminClients = new Set();
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

            // Handle admin authentication
            socket.on('admin-auth', (data) => {
                if (data.role === 'admin') {
                    this.adminClients.add(socket.id);
                    socket.join('admin-room');
                    console.log('Admin client authenticated:', socket.id);

                    // Send initial dashboard data
                    this.sendInitialData(socket);
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.adminClients.delete(socket.id);
                socket.leave('admin-room');
                console.log('Client disconnected:', socket.id);
            });

            // Handle real-time dashboard requests
            socket.on('request-dashboard-update', async () => {
                await this.sendDashboardUpdate(socket);
            });
        });

        // Set up global broadcast function
        global.broadcastToAdmins = (event, data) => {
            this.broadcastToAdmins(event, data);
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
