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
        <div className="bg-dark-950/40 border border-dark-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-dark-800 bg-dark-900/50">
                <h3 className="text-lg font-semibold text-white mb-1">
                    Notification Preferences
                </h3>
                <p className="text-dark-400 text-xs">
                    Get updates where you want them. You can customize these at any time.
                </p>
            </div>

            <div className="p-2">
                {/* Channels List */}
                <div className="space-y-1">
                    {notificationTypes.map((type) => (
                        <div key={type.key} className="group">
                            <div
                                className={`flex items-center justify-between p-4 rounded-xl transition-all ${preferences[type.key]
                                    ? 'bg-primary-500/5'
                                    : 'hover:bg-dark-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${getColorClasses(type.color, preferences[type.key])} shadow-sm`}>
                                        {React.cloneElement(type.icon, { className: "w-4 h-4" })}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{type.title}</span>
                                            {type.recommended && (
                                                <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-green-500/10">
                                                    Best
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-dark-500 text-[11px] leading-tight mt-0.5">
                                            {type.description}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggle(type.key)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences[type.key] ? 'bg-primary-500' : 'bg-dark-700'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences[type.key] ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Inline Phone Input for WhatsApp/SMS */}
                            {type.requiresPhone && preferences[type.key] && (
                                <div className="mx-4 mb-4 mt-1 p-4 bg-dark-900/80 rounded-xl border border-dark-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none border-r border-dark-700 pr-3 my-2">
                                                <span className="text-xs font-bold text-dark-400">+263</span>
                                            </div>
                                            <input
                                                type="tel"
                                                value={(phoneNumbers[type.key] || '').replace('+263 ', '')}
                                                onChange={(e) => handlePhoneChange(type.key, '+263 ' + e.target.value.replace(/\D/g, ''))}
                                                placeholder="77 123 4567"
                                                className="block w-full pl-16 pr-3 py-2 bg-dark-950 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-dark-500 whitespace-nowrap bg-dark-950 border border-dark-800 px-2 py-1.5 rounded-md">
                                            <Shield className="w-3 h-3 text-primary-500/40" />
                                            <span>Private</span>
                                        </div>
                                    </div>
                                    {phoneErrors[type.key] && (
                                        <p className="text-red-500/90 text-[10px] mt-2 font-medium flex items-center gap-1">
                                            <Info className="w-3 h-3" />
                                            {phoneErrors[type.key]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* More Settings Footer */}
                <div className="mt-4 pt-2 border-t border-dark-800/50 px-4 pb-4">
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-dark-400 hover:text-white text-[11px] font-medium transition-colors"
                    >
                        <div className={`p-1 rounded bg-dark-800 transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                            <Info className="w-3 h-3" />
                        </div>
                        {showDetails ? 'Hide' : 'Customize'} specific alerts
                    </button>

                    {showDetails && (
                        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {notificationCategories.map((category) => (
                                <div
                                    key={category.key}
                                    className="flex items-center justify-between p-2.5 bg-dark-900/40 rounded-lg border border-dark-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-dark-800 rounded text-dark-400 group-hover:text-primary-400 transition-colors">
                                            {React.cloneElement(category.icon, { className: "w-3 h-3" })}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-dark-200 text-xs">
                                                {category.title}
                                            </h5>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.key)}
                                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${preferences[category.key] ? 'bg-primary-500/80' : 'bg-dark-700'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${preferences[category.key] ? 'translate-x-3.5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Save Status Overlay (Subtle) */}
            {saveStatus && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-dark-800 border border-primary-500/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md">
                        <CheckCircle className="w-3 h-3 text-primary-500" />
                        {saveStatus}
                    </div>
                </div>
            )}

            {/* Action Footer */}
            <div className="p-6 bg-dark-900/80 border-t border-dark-800 flex gap-3">
                <button
                    type="button"
                    onClick={onSkip}
                    className="flex-1 px-4 py-2.5 border border-dark-700 text-dark-400 text-sm font-medium rounded-xl hover:bg-dark-800 hover:text-white transition-all"
                >
                    Skip
                </button>
                <button
                    type="button"
                    onClick={() => onChange(preferences)}
                    className="flex-1 px-4 py-2.5 bg-primary-500 text-dark-950 text-sm font-bold rounded-xl hover:bg-primary-400 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all"
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default NotificationPreferences;
