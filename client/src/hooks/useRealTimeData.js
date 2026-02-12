import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const useRealTimeData = () => {
    const { realTimeData, connected, emitEvent } = useWebSocket();
    const [localStats, setLocalStats] = useState({
        onlineUsers: 0,
        activeSessions: 0,
        recentActivity: [],
        notifications: []
    });

    // Fallback polling if WebSocket is not connected
    useEffect(() => {
        if (!connected) {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch('http://localhost:5001/api/admin/activity');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setLocalStats(prev => ({
                                ...prev,
                                ...data.data
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(interval);
        }
    }, [connected]);

    // Update local stats when WebSocket data changes
    useEffect(() => {
        if (connected && realTimeData) {
            setLocalStats(prev => ({
                ...prev,
                ...realTimeData
            }));
        }
    }, [connected, realTimeData]);

    // Emit admin events
    const emitAdminEvent = (eventType, data) => {
        emitEvent('admin_event', {
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        });
    };

    return {
        ...localStats,
        connected,
        emitAdminEvent
    };
};

export default useRealTimeData;
