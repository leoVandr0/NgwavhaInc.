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
        // Initialize WebSocket connection
        const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
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
