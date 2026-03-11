import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Space, Badge } from 'antd';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  Check,
  Megaphone 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';

const priorityConfig = {
  low: {
    type: 'info',
    icon: <Info size={18} />,
    className: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    titleClass: 'text-blue-400'
  },
  medium: {
    type: 'info',
    icon: <Bell size={18} />,
    className: 'bg-primary-500/10 border-primary-500/30 text-primary-400',
    titleClass: 'text-primary-400'
  },
  high: {
    type: 'warning',
    icon: <AlertTriangle size={18} />,
    className: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    titleClass: 'text-orange-400'
  },
  urgent: {
    type: 'error',
    icon: <AlertCircle size={18} />,
    className: 'bg-red-500/10 border-red-500/30 text-red-400',
    titleClass: 'text-red-400'
  }
};

const PublicAlertBanner = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { emitEvent } = useWebSocket();
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    // Load dismissed alerts from localStorage
    const stored = localStorage.getItem('dismissedAlerts');
    return stored ? JSON.parse(stored) : [];
  });

  // Handle new public alert
  const handlePublicAlert = useCallback((event) => {
    const alertData = event.detail;
    console.log('Received public alert:', alertData);
    
    // Check if user should receive this alert based on role
    const { targetAudience } = alertData;
    if (targetAudience !== 'all' && currentUser?.role !== targetAudience) {
      return;
    }

    // Check if already dismissed
    if (dismissedAlerts.includes(alertData.id)) {
      return;
    }

    // Add alert to state
    setAlerts(prev => {
      // Avoid duplicates
      if (prev.some(a => a.id === alertData.id)) {
        return prev;
      }
      return [...prev, alertData];
    });

    // Auto-dismiss non-urgent alerts after 10 seconds
    if (alertData.priority !== 'urgent') {
      setTimeout(() => {
        dismissAlert(alertData.id);
      }, 10000);
    }
  }, [currentUser, dismissedAlerts]);

  // Dismiss alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    
    // Persist to localStorage
    setDismissedAlerts(prev => {
      const updated = [...prev, alertId];
      localStorage.setItem('dismissedAlerts', JSON.stringify(updated));
      return updated;
    });

    // Notify server of acknowledgment
    emitEvent('alert:acknowledge', {
      alertId,
      userId: currentUser?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentUser, emitEvent]);

  // Acknowledge urgent alert
  const acknowledgeAlert = useCallback((alertId) => {
    dismissAlert(alertId);
  }, [dismissAlert]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    // Listen for public alerts via custom event
    window.addEventListener('public-alert', handlePublicAlert);

    return () => {
      window.removeEventListener('public-alert', handlePublicAlert);
    };
  }, [isAuthenticated, currentUser, handlePublicAlert]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] space-y-2 p-4 pointer-events-none">
      {alerts.map((alert) => {
        const config = priorityConfig[alert.priority] || priorityConfig.medium;
        const isUrgent = alert.priority === 'urgent';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto mx-auto max-w-4xl ${config.className} border rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-top-2`}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone size={14} className="opacity-70" />
                  <span className={`font-semibold ${config.titleClass}`}>
                    {alert.title}
                  </span>
                  <Badge 
                    count={alert.priority.toUpperCase()} 
                    style={{ 
                      backgroundColor: isUrgent ? '#ef4444' : undefined,
                      fontSize: '10px'
                    }} 
                  />
                </div>
                
                <p className="text-sm opacity-90 leading-relaxed">
                  {alert.message}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs opacity-60">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  
                  <Space>
                    {isUrgent ? (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => acknowledgeAlert(alert.id)}
                        icon={<Check size={14} />}
                        className="bg-white/20 border-white/30 hover:bg-white/30"
                      >
                        Acknowledge
                      </Button>
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        onClick={() => dismissAlert(alert.id)}
                        icon={<X size={14} />}
                        className="text-current opacity-70 hover:opacity-100"
                      >
                        Dismiss
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PublicAlertBanner;
