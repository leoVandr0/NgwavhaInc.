import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Trash2, Clock, MessageSquare, BookOpen } from 'lucide-react';
import { Badge, Button, Divider, Empty, List, Typography } from 'antd';
import { useNotifications } from '../../hooks/useNotifications';

const { Text } = Typography;

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getNotificationIcon = (type) => {
        const icons = {
            course_update: <BookOpen className="w-4 h-4 text-blue-500" />,
            assignment_reminder: <Clock className="w-4 h-4 text-orange-500" />,
            new_message: <MessageSquare className="w-4 h-4 text-green-500" />,
            system_update: <Bell className="w-4 h-4 text-purple-500" />
        };
        return icons[type] || <Bell className="w-4 h-4 text-gray-500" />;
    };

    const getNotificationColor = (type) => {
        const colors = {
            course_update: 'border-blue-500',
            assignment_reminder: 'border-orange-500',
            new_message: 'border-green-500',
            system_update: 'border-purple-500'
        };
        return colors[type] || 'border-gray-500';
    };

    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
    };

    const handleDelete = async (notificationId) => {
        await deleteNotification(notificationId);
    };

    const formatNotificationTime = (timestamp) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            return date.toLocaleDateString();
        } catch {
            return 'Just now';
        }
    };

    const sortedNotifications = [...notifications].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-dark-950 text-xs font-bold flex items-center justify-center rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-dark-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        // Mark all as read logic would go here
                                        console.log('Mark all as read');
                                    }}
                                    className="text-xs"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {sortedNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Empty
                                    description="No notifications"
                                    image={<Bell className="w-8 h-8 text-dark-600" />}
                                />
                            </div>
                        ) : (
                            <List
                                dataSource={sortedNotifications}
                                renderItem={(notification) => (
                                    <List.Item
                                        className={`border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-dark-700' : 'bg-transparent'
                                            } hover:bg-dark-700 transition-colors cursor-pointer`}
                                        onClick={() => {
                                            if (!notification.read) {
                                                handleMarkAsRead(notification.id);
                                            }
                                        }}
                                        actions={[
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<Trash2 className="w-3 h-3" />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                                className="text-dark-400 hover:text-red-400"
                                            />
                                        ]}
                                    >
                                        <List.Item.Meta>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <Text className="text-white text-sm">
                                                            {notification.title}
                                                        </Text>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                                        )}
                                                    </div>
                                                    <Text className="text-dark-400 text-xs">
                                                        {notification.message}
                                                    </Text>
                                                    <Text className="text-dark-500 text-xs">
                                                        {formatNotificationTime(notification.createdAt)}
                                                    </Text>
                                                </div>
                                            </div>
                                        </List.Item.Meta>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-dark-700">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => navigate('/settings/notifications')}
                            className="w-full text-center"
                        >
                            View all notifications
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
