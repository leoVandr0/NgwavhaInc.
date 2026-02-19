import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [realTimeData, setRealTimeData] = useState({
        onlineUsers: 0,
        activeSessions: 0,
        recentActivity: [],
        notifications: []
    });

    useEffect(() => {
        // Connect to backend: use VITE_SOCKET_URL in production when API is on another host; in dev proxy /socket.io to backend
        const socketUrl = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            maxReconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setConnected(true);
            setSocket(newSocket);
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setConnected(false);
        });

        // Listen for real-time updates
        newSocket.on('stats_update', (data) => {
            setRealTimeData(prev => ({
                ...prev,
                ...data
            }));
        });

        newSocket.on('user_activity', (activity) => {
            setRealTimeData(prev => ({
                ...prev,
                recentActivity: [activity, ...prev.recentActivity.slice(0, 9)]
            }));
        });

        newSocket.on('notification', (notification) => {
            setRealTimeData(prev => ({
                ...prev,
                notifications: [notification, ...prev.notifications.slice(0, 9)]
            }));
        });

        // Handle admin dashboard real-time updates
        newSocket.on('user-registered', (data) => {
            console.log('User registered event:', data);
            // Dispatch custom event for admin dashboard
            window.dispatchEvent(new CustomEvent('user-registered', { detail: data }));
        });

        newSocket.on('course-created', (data) => {
            console.log('Course created event:', data);
            // Dispatch custom event for admin dashboard
            window.dispatchEvent(new CustomEvent('course-created', { detail: data }));
        });

        newSocket.on('course-updated', (data) => {
            console.log('Course updated event:', data);
            window.dispatchEvent(new CustomEvent('course-updated', { detail: data }));
        });

        newSocket.on('course-deleted', (data) => {
            console.log('Course deleted event:', data);
            window.dispatchEvent(new CustomEvent('course-deleted', { detail: data }));
        });

        newSocket.on('enrollment-created', (data) => {
            console.log('Enrollment created event:', data);
            window.dispatchEvent(new CustomEvent('enrollment-created', { detail: data }));
        });

        newSocket.on('enrollment-removed', (data) => {
            console.log('Enrollment removed event:', data);
            window.dispatchEvent(new CustomEvent('enrollment-removed', { detail: data }));
        });

        newSocket.on('teacher-approved', (data) => {
            console.log('Teacher approved event:', data);
            window.dispatchEvent(new CustomEvent('teacher-approved', { detail: data }));
        });

        newSocket.on('teacher-declined', (data) => {
            console.log('Teacher declined event:', data);
            window.dispatchEvent(new CustomEvent('teacher-declined', { detail: data }));
        });

        newSocket.on('stats-update', (data) => {
            console.log('Stats update:', data);
            // Handle general stats updates
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const emitEvent = (event, data) => {
        if (socket && connected) {
            socket.emit(event, data);
        }
    };

    const value = {
        socket,
        connected,
        realTimeData,
        emitEvent
    };

    return React.createElement(
        WebSocketContext.Provider,
        { value },
        children
    );
};

export default WebSocketProvider;
