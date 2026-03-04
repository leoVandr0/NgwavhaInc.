import React, { useState, useEffect } from 'react';
import { 
    Mail, 
    MessageSquare, 
    Smartphone, 
    Bell, 
    CheckCircle,
    Info,
    X,
    Wifi,
    Send,
    Shield,
    Star,
    Lock
} from 'lucide-react';

const NotificationPreferences = ({ preferences, onChange, onSkip, phoneNumbers: externalPhoneNumbers, onPhoneNumbersChange }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState(externalPhoneNumbers || {
        whatsapp: '+263 ',
        sms: '+263 '
    });
    const [phoneErrors, setPhoneErrors] = useState({
        whatsapp: '',
        sms: ''
    });
    const [saveStatus, setSaveStatus] = useState('');

    // Update local phone numbers when external ones change
    useEffect(() => {
        if (externalPhoneNumbers) {
            setPhoneNumbers(externalPhoneNumbers);
        }
    }, [externalPhoneNumbers]);

    const notificationTypes = [
        {
            key: 'email',
            icon: <Mail className="w-5 h-5" />,
            title: 'Email Notifications',
            description: 'Receive updates via email',
            default: true,
            color: 'blue',
            primary: true
        },
        {
            key: 'whatsapp',
            icon: <MessageSquare className="w-5 h-5" />,
            title: 'WhatsApp Notifications',
            description: 'Get updates on WhatsApp',
            default: false,
            color: 'green',
            requiresPhone: true,
            recommended: true
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

    const validateZimbabweNumber = (number) => {
        // Remove all non-digit characters
        const cleanNumber = number.replace(/\D/g, '');
        
        // Check if it starts with 263 and has correct length
        if (cleanNumber.startsWith('263')) {
            // Remove 263 and check the remaining number
            const localNumber = cleanNumber.substring(3);
            // Zimbabwe numbers are typically 9 digits after country code
            if (localNumber.length === 9 && /^[67]\d{8}$/.test(localNumber)) {
                return true;
            }
        }
        
        return false;
    };

    const formatZimbabweNumber = (number) => {
        let cleanNumber = number.replace(/\D/g, '');
        
        // If number starts with 263, keep it
        if (!cleanNumber.startsWith('263')) {
            // If it's a local number (starts with 7 or 8), add 263
            if (/^[67]/.test(cleanNumber)) {
                cleanNumber = '263' + cleanNumber;
            }
        }
        
        // Format as +263 XX XXX XXXX
        if (cleanNumber.length === 12) {
            return `+263 ${cleanNumber.substring(3, 5)} ${cleanNumber.substring(5, 8)} ${cleanNumber.substring(8)}`;
        }
        
        return number;
    };

    const handlePhoneChange = (type, value) => {
        const formattedValue = formatZimbabweNumber(value);
        const newPhoneNumbers = { ...phoneNumbers, [type]: formattedValue };
        setPhoneNumbers(newPhoneNumbers);
        
        // Notify parent component if callback exists
        if (onPhoneNumbersChange) {
            onPhoneNumbersChange(newPhoneNumbers);
        }
        
        // Validate number
        if (value && !validateZimbabweNumber(value)) {
            setPhoneErrors(prev => ({
                ...prev,
                [type]: 'Please enter a valid Zimbabwe number (e.g., +263 77 123 4567)'
            }));
        } else {
            setPhoneErrors(prev => ({ ...prev, [type]: '' }));
        }
    };

    const requestPushPermission = async () => {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setSaveStatus('Push notifications enabled!');
                    setTimeout(() => setSaveStatus(''), 3000);
                    return true;
                } else if (permission === 'denied') {
                    setSaveStatus('Push notifications are blocked. Please enable them in browser settings.');
                    setTimeout(() => setSaveStatus(''), 5000);
                    return false;
                }
            } catch (error) {
                console.error('Error requesting push permission:', error);
                return false;
            }
        }
        return false;
    };

    const handleToggle = async (key) => {
        const newPrefs = {
            ...preferences,
            [key]: !preferences[key]
        };
        
        // Special handling for push notifications
        if (key === 'push' && newPrefs.push) {
            const granted = await requestPushPermission();
            if (!granted) {
                newPrefs.push = false;
            }
        }
        
        // If disabling phone-based notifications, clear the phone numbers
        if ((key === 'whatsapp' || key === 'sms') && !newPrefs[key]) {
            setPhoneNumbers(prev => ({ ...prev, [key]: '+263 ' }));
            setPhoneErrors(prev => ({ ...prev, [key]: '' }));
        }
        
        onChange(newPrefs);
        setSaveStatus('Settings updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleCategoryToggle = (key) => {
        const newPrefs = {
            ...preferences,
            [key]: !preferences[key]
        };
        onChange(newPrefs);
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
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleToggle(type.key);
                            }
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getColorClasses(type.color, preferences[type.key])}`}>
                                {type.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                                    {type.title}
                                    {type.recommended && (
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            Recommended
                                        </span>
                                    )}
                                    {type.primary && (
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                            Primary
                                        </span>
                                    )}
                                </h4>
                                <p className="text-dark-400 text-sm">
                                    {type.description}
                                </p>
                                {type.requiresPhone && (
                                    <div className="mt-3 space-y-2">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={phoneNumbers[type.key] || ''}
                                                onChange={(e) => handlePhoneChange(type.key, e.target.value)}
                                                placeholder="+263 77 123 4567"
                                                disabled={!preferences[type.key]}
                                                className={`w-full px-3 py-2 border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 transition-all ${
                                                    preferences[type.key]
                                                        ? 'bg-dark-700 border-dark-600 focus:ring-primary-500 focus:border-primary-500'
                                                        : 'bg-dark-800 border-dark-700 opacity-50 cursor-not-allowed'
                                                }`}
                                            />
                                            {phoneErrors[type.key] && (
                                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                    <Info className="w-3 h-3" />
                                                    {phoneErrors[type.key]}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-dark-400">
                                            <Lock className="w-3 h-3" />
                                            <span>Your number is encrypted and never shared</span>
                                        </div>
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

            {/* Save Status Message */}
            {saveStatus && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    saveStatus.includes('blocked') 
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                    {saveStatus.includes('blocked') ? (
                        <Info className="w-4 h-4" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    {saveStatus}
                </div>
            )}

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
