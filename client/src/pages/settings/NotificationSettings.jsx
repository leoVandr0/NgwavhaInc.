import React, { useState, useEffect } from 'react';
import { 
    Mail, 
    MessageSquare, 
    Smartphone, 
    Bell, 
    CheckCircle,
    Info,
    Save,
    Settings
} from 'lucide-react';
import { message, Switch, Card, Divider } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const NotificationSettings = () => {
    const { currentUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        email: true,
        whatsapp: false,
        sms: false,
        push: true,
        inApp: true,
        courseUpdates: true,
        assignmentReminders: true,
        newMessages: true,
        promotionalEmails: false,
        weeklyDigest: false
    });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    useEffect(() => {
        if (currentUser) {
            setPreferences(currentUser.notificationPreferences || preferences);
            setPhoneNumber(currentUser.phoneNumber || '');
            setWhatsappNumber(currentUser.whatsappNumber || '');
        }
    }, [currentUser]);

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await api.put('/auth/profile', {
                notificationPreferences: preferences,
                phoneNumber,
                whatsappNumber
            });

            updateUser(response.data);
            message.success('Notification preferences updated successfully!');
        } catch (error) {
            message.error('Failed to update notification preferences');
        } finally {
            setLoading(false);
        }
    };

    const notificationChannels = [
        {
            key: 'email',
            icon: <Mail className="w-5 h-5" />,
            title: 'Email Notifications',
            description: 'Receive updates via email',
            color: 'blue'
        },
        {
            key: 'whatsapp',
            icon: <MessageSquare className="w-5 h-5" />,
            title: 'WhatsApp Notifications',
            description: 'Get updates on WhatsApp',
            color: 'green',
            requiresPhone: true
        },
        {
            key: 'sms',
            icon: <Smartphone className="w-5 h-5" />,
            title: 'SMS Notifications',
            description: 'Receive text messages',
            color: 'purple',
            requiresPhone: true
        },
        {
            key: 'push',
            icon: <Bell className="w-5 h-5" />,
            title: 'Push Notifications',
            description: 'Browser push notifications',
            color: 'orange'
        },
        {
            key: 'inApp',
            icon: <CheckCircle className="w-5 h-5" />,
            title: 'In-App Notifications',
            description: 'See notifications when you\'re logged in',
            color: 'indigo'
        }
    ];

    const notificationCategories = [
        {
            key: 'courseUpdates',
            title: 'Course Updates',
            description: 'New lessons, announcements, and course materials',
            icon: <Info className="w-4 h-4" />
        },
        {
            key: 'assignmentReminders',
            title: 'Assignment Reminders',
            description: 'Due dates and new assignments',
            icon: <Settings className="w-4 h-4" />
        },
        {
            key: 'newMessages',
            title: 'New Messages',
            description: 'Messages from instructors and students',
            icon: <MessageSquare className="w-4 h-4" />
        },
        {
            key: 'promotionalEmails',
            title: 'Promotional Emails',
            description: 'Special offers and new course announcements',
            icon: <Mail className="w-4 h-4" />
        },
        {
            key: 'weeklyDigest',
            title: 'Weekly Digest',
            description: 'Summary of your weekly activity',
            icon: <Bell className="w-4 h-4" />
        }
    ];

    const getColorClasses = (color, enabled) => {
        const colors = {
            blue: enabled ? 'bg-blue-500' : 'bg-gray-700',
            green: enabled ? 'bg-green-500' : 'bg-gray-700',
            purple: enabled ? 'bg-purple-500' : 'bg-gray-700',
            orange: enabled ? 'bg-orange-500' : 'bg-gray-700',
            indigo: enabled ? 'bg-indigo-500' : 'bg-gray-700'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-dark-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
                    <p className="text-dark-400">
                        Choose how you want to receive notifications and what types of updates you want to get.
                    </p>
                </div>

                {/* Notification Channels */}
                <Card className="mb-8 bg-dark-900 border-dark-800">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Notification Channels
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notificationChannels.map((channel) => (
                            <div
                                key={channel.key}
                                className="bg-dark-800 rounded-lg p-6 border border-dark-700"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg text-white ${getColorClasses(channel.color, preferences[channel.key])}`}>
                                        {channel.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-2">
                                            {channel.title}
                                        </h3>
                                        <p className="text-dark-400 text-sm mb-4">
                                            {channel.description}
                                        </p>
                                        
                                        {channel.requiresPhone && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={channel.key === 'whatsapp' ? whatsappNumber : phoneNumber}
                                                        onChange={(e) => channel.key === 'whatsapp' 
                                                            ? setWhatsappNumber(e.target.value)
                                                            : setPhoneNumber(e.target.value)
                                                        }
                                                        placeholder="+1234567890"
                                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-dark-300">Enable</span>
                                            <Switch
                                                checked={preferences[channel.key]}
                                                onChange={(checked) => handlePreferenceChange(channel.key, checked)}
                                                disabled={channel.requiresPhone && !((channel.key === 'whatsapp' ? whatsappNumber : phoneNumber))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Notification Categories */}
                <Card className="mb-8 bg-dark-900 border-dark-800">
                    <h2 className="text-xl font-semibold mb-6">Notification Types</h2>
                    
                    <div className="space-y-4">
                        {notificationCategories.map((category) => (
                            <div key={category.key} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-dark-700 rounded text-primary-400">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">
                                            {category.title}
                                        </h4>
                                        <p className="text-dark-400 text-sm">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences[category.key]}
                                    onChange={(checked) => handlePreferenceChange(category.key, checked)}
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
