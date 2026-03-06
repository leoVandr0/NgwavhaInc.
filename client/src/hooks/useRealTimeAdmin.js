import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const useRealTimeAdmin = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [realTimeData, setRealTimeData] = useState({
        stats: {
            totalUsers: 0,
            pendingTeachers: 0,
            totalCourses: 0
        },
        recentActivity: [],
        notifications: []
    });
    const [lastUpdate, setLastUpdate] = useState(null);
    const { currentUser } = useAuth();
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        if (currentUser?.role === 'admin' && !socket) {
            connectSocket();
        }

        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        };
    }, [currentUser]);

    const connectSocket = () => {
        // In production, we usually connect to the same host.
        // If REACT_APP_SERVER_URL is not set, use window.location.origin (for same-domain deploy)
        const socketUrl = import.meta.env.VITE_API_URL ||
            (window.location.hostname === 'localhost' ? 'http://localhost:8080' : window.location.origin);

        console.log('📡 Connecting to real-time service at:', socketUrl);

        const newSocket = io(socketUrl, {
            path: '/socket.io/', // Ensure path matches server config
            transports: ['websocket', 'polling'],
            timeout: 20000, // Increased timeout for Railway instability
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: maxReconnectAttempts
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to admin real-time service');
            setIsConnected(true);
            reconnectAttempts.current = 0;

            // Authenticate as admin
            newSocket.emit('admin-auth', {
                role: currentUser.role,
                userId: currentUser.id
            });
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from admin real-time service');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            reconnectAttempts.current++;

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.log('Max reconnection attempts reached, giving up');
                newSocket.disconnect();
            }
        });

        // Listen for real-time updates
        newSocket.on('dashboard-initial-data', (data) => {
            console.log('📊 Received initial dashboard data:', data);
            if (data.success) {
                setRealTimeData(prev => ({
                    ...prev,
                    stats: data.data.stats || prev.stats,
                    recentActivity: data.data.recentActivity || prev.recentActivity
                }));
                setLastUpdate(new Date());
            }
        });

        newSocket.on('dashboard-update', (data) => {
            console.log('📊 Received dashboard update:', data);
            if (data.success) {
                setRealTimeData(prev => ({
                    ...prev,
                    stats: data.data.stats || prev.stats,
                    recentActivity: data.data.recentActivity || prev.recentActivity
                }));
                setLastUpdate(new Date());
            }
        });

        newSocket.on('instructor-application', (data) => {
            console.log('👨‍🏫 New instructor application:', data);
            setRealTimeData(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    pendingTeachers: prev.stats.pendingTeachers + 1
                },
                recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
            }));
            setLastUpdate(new Date());
        });

        newSocket.on('instructor-approved', (data) => {
            console.log('✅ Instructor approved:', data);
            setRealTimeData(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    pendingTeachers: Math.max(0, prev.stats.pendingTeachers - 1)
                },
                recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
            }));
            setLastUpdate(new Date());
        });

        newSocket.on('instructor-rejected', (data) => {
            console.log('❌ Instructor rejected:', data);
            setRealTimeData(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    pendingTeachers: Math.max(0, prev.stats.pendingTeachers - 1)
                },
                recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
            }));
            setLastUpdate(new Date());
        });

        newSocket.on('new-user', (data) => {
            console.log('👤 New user registered:', data);
            setRealTimeData(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    totalUsers: prev.stats.totalUsers + 1
                },
                recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
            }));
            setLastUpdate(new Date());
        });

        newSocket.on('new-course', (data) => {
            console.log('📚 New course created:', data);
            setRealTimeData(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    totalCourses: prev.stats.totalCourses + 1
                },
                recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
            }));
            setLastUpdate(new Date());
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);
    };

    const requestUpdate = () => {
        if (socket && isConnected) {
            socket.emit('request-dashboard-update');
        }
    };

    const addNotification = (notification) => {
        setRealTimeData(prev => ({
            ...prev,
            notifications: [notification, ...prev.notifications.slice(0, 4)]
        }));
    };

    return {
        socket,
        isConnected,
        realTimeData,
        lastUpdate,
        requestUpdate,
        addNotification
    };
};

export default useRealTimeAdmin;
