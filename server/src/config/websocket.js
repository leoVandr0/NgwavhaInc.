const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store connected clients and their roles
const connectedClients = new Map();
const realTimeStats = {
    onlineUsers: 0,
    activeSessions: 0,
    recentActivity: [],
    notifications: []
};

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Add client to connected list
    connectedClients.set(socket.id, {
        socket,
        connectedAt: new Date(),
        role: 'guest'
    });

    // Update online users count
    realTimeStats.onlineUsers = connectedClients.size;
    realTimeStats.activeSessions = Math.floor(connectedClients.size * 0.7); // Estimate active sessions
    
    // Broadcast updated stats to all admin clients
    broadcastStatsUpdate();

    // Handle admin authentication
    socket.on('admin_auth', (data) => {
        const client = connectedClients.get(socket.id);
        if (client) {
            client.role = data.role;
            client.user = data.user;
            
            // Send current stats to newly connected admin
            socket.emit('stats_update', realTimeStats);
        }
    });

    // Handle admin events
    socket.on('admin_event', (event) => {
        console.log('Admin event:', event);
        
        // Add to recent activity
        const activity = {
            id: Date.now(),
            type: event.type,
            user: event.data.user || event.user,
            action: event.data.action || event.type,
            time: 'Just now',
            timestamp: event.timestamp
        };
        
        realTimeStats.recentActivity.unshift(activity);
        if (realTimeStats.recentActivity.length > 10) {
            realTimeStats.recentActivity = realTimeStats.recentActivity.slice(0, 10);
        }
        
        // Broadcast activity to all admin clients
        broadcastActivity(activity);
        broadcastStatsUpdate();
    });

    // Handle user activity events
    socket.on('user_activity', (activity) => {
        console.log('User activity:', activity);
        
        // Add to recent activity
        const formattedActivity = {
            id: Date.now(),
            type: activity.type,
            user: activity.user,
            action: activity.action,
            time: 'Just now',
            timestamp: new Date().toISOString()
        };
        
        realTimeStats.recentActivity.unshift(formattedActivity);
        if (realTimeStats.recentActivity.length > 10) {
            realTimeStats.recentActivity = realTimeStats.recentActivity.slice(0, 10);
        }
        
        // Broadcast to all admin clients
        broadcastActivity(formattedActivity);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove client from connected list
        connectedClients.delete(socket.id);
        
        // Update stats
        realTimeStats.onlineUsers = connectedClients.size;
        realTimeStats.activeSessions = Math.floor(connectedClients.size * 0.7);
        
        // Broadcast updated stats
        broadcastStatsUpdate();
    });
});

// Helper functions
function broadcastStatsUpdate() {
    io.emit('stats_update', {
        onlineUsers: realTimeStats.onlineUsers,
        activeSessions: realTimeStats.activeSessions,
        recentActivity: realTimeStats.recentActivity,
        notifications: realTimeStats.notifications
    });
}

function broadcastActivity(activity) {
    io.emit('user_activity', activity);
}

// Function to emit events from other parts of the application
function emitEvent(eventType, data) {
    io.emit(eventType, data);
}

// Function to send notifications to specific users
function sendNotification(userId, notification) {
    // Find user's socket and send notification
    for (const [socketId, client] of connectedClients) {
        if (client.user && client.user.id === userId) {
            client.socket.emit('notification', notification);
            break;
        }
    }
}

// Function to broadcast to all admins
function broadcastToAdmins(event, data) {
    for (const [socketId, client] of connectedClients) {
        if (client.role === 'admin') {
            client.socket.emit(event, data);
        }
    }
}

// Simulate real-time updates (for demo purposes)
setInterval(() => {
    // Randomly update online users
    const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
    realTimeStats.onlineUsers = Math.max(1, realTimeStats.onlineUsers + change);
    realTimeStats.activeSessions = Math.floor(realTimeStats.onlineUsers * 0.7);
    
    broadcastStatsUpdate();
}, 10000); // Update every 10 seconds

// Export functions for use in other modules
module.exports = {
    io,
    emitEvent,
    sendNotification,
    broadcastToAdmins,
    getConnectedClients: () => connectedClients,
    getRealTimeStats: () => realTimeStats
};

// Export server for use in main app
module.exports.server = server;
