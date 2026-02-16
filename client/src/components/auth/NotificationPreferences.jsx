import React, { useState } from 'react';
import { 
    Mail, 
    MessageSquare, 
    Smartphone, 
    Bell, 
    CheckCircle,
    Info,
    X,
    Wifi,
    Send
} from 'lucide-react';

const NotificationPreferences = ({ preferences, onChange, onSkip }) => {
    const [showDetails, setShowDetails] = useState(false);

    const notificationTypes = [
        {
            key: 'email',
            icon: <Mail className="w-5 h-5" />,
            title: 'Email Notifications',
            description: 'Receive updates via email',
            default: true,
            color: 'blue'
        },
        {
            key: 'whatsapp',
            icon: <MessageSquare className="w-5 h-5" />,
            title: 'WhatsApp Notifications',
            description: 'Get updates on WhatsApp',
            default: false,
            color: 'green',
            requiresPhone: true
        },
        {
            key: 'sms',
            icon: <Smartphone className="w-5 h-5" />,
            title: 'SMS Notifications',
            description: 'Receive text messages',
            default: false,
            color: 'purple',
            requiresPhone: true
        },
        {
            key: 'push',
            icon: <Bell className="w-5 h-5" />,
            title: 'Push Notifications',
            description: 'Browser push notifications',
            default: true,
            color: 'orange'
        },
        {
            key: 'inApp',
            icon: <CheckCircle className="w-5 h-5" />,
            title: 'In-App Notifications',
            description: 'See notifications when you\'re logged in',
            default: true,
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
            icon: <Send className="w-4 h-4" />
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
            icon: <Wifi className="w-4 h-4" />
        }
    ];

    const handleToggle = (key) => {
        onChange({
            ...preferences,
            [key]: !preferences[key]
        });
    };

    const handleCategoryToggle = (key) => {
        onChange({
            ...preferences,
            [key]: !preferences[key]
        });
    };

    const getColorClasses = (color, enabled) => {
        const colors = {
            blue: enabled ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300',
            green: enabled ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300',
            purple: enabled ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300',
            orange: enabled ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300',
            indigo: enabled ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-dark-900 rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                    Choose How You Want to Stay Updated
                </h3>
                <p className="text-dark-400 text-sm">
                    Select your preferred notification channels. You can always change these later in settings.
                </p>
            </div>

            {/* Main Notification Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificationTypes.map((type) => (
                    <div
                        key={type.key}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                            preferences[type.key]
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                        }`}
                        onClick={() => handleToggle(type.key)}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getColorClasses(type.color, preferences[type.key])}`}>
                                {type.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1">
                                    {type.title}
                                </h4>
                                <p className="text-dark-400 text-sm">
                                    {type.description}
                                </p>
                                {type.requiresPhone && preferences[type.key] && (
                                    <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-xs">
                                        <Info className="w-3 h-3 inline mr-1" />
                                        Phone number required for this option
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                {preferences[type.key] ? (
                                    <CheckCircle className="w-5 h-5 text-primary-400" />
                                ) : (
                                    <X className="w-5 h-5 text-dark-400" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notification Categories */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                    <Info className="w-4 h-4" />
                    {showDetails ? 'Hide' : 'Show'} notification categories
                </button>

                {showDetails && (
                    <div className="mt-4 space-y-3">
                        <p className="text-dark-400 text-sm mb-4">
                            Choose what types of notifications you want to receive:
                        </p>
                        {notificationCategories.map((category) => (
                            <div
                                key={category.key}
                                className="flex items-center justify-between p-3 bg-dark-800 rounded-lg border border-dark-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-dark-700 rounded text-primary-400">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-white text-sm">
                                            {category.title}
                                        </h5>
                                        <p className="text-dark-400 text-xs">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.key)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        preferences[category.key]
                                            ? 'bg-primary-500'
                                            : 'bg-dark-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            preferences[category.key]
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onSkip}
                    className="flex-1 px-4 py-3 border border-dark-700 text-dark-300 rounded-lg hover:bg-dark-800 transition-colors"
                >
                    Skip for Now
                </button>
                <button
                    type="button"
                    onClick={() => onChange(preferences)}
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default NotificationPreferences;
