import { useState, useEffect } from 'react';
import { Cookie, X, Settings, Shield } from 'lucide-react';
import { Button, Space, Typography, Card } from 'antd';

const { Text, Paragraph } = Typography;

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAccept = (preferences) => {
        localStorage.setItem('cookie_consent', JSON.stringify(preferences));
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        setVisible(false);
        
        // Here you would typically initialize analytics/marketing scripts based on preferences
        if (preferences.analytics) {
            console.log('Analytics cookies accepted');
            // Initialize Google Analytics, etc.
        }
        if (preferences.marketing) {
            console.log('Marketing cookies accepted');
            // Initialize marketing scripts
        }
    };

    const handleReject = () => {
        handleAccept({
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false
        });
    };

    const handleAcceptAll = () => {
        handleAccept({
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true
        });
    };

    const handleCustomize = () => {
        setShowDetails(true);
    };

    const handleSavePreferences = (preferences) => {
        handleAccept(preferences);
        setShowDetails(false);
    };

    if (!visible) return null;

    if (showDetails) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="bg-dark-800 border-dark-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Cookie className="w-6 h-6 text-primary-500" />
                            <Text className="text-white text-lg font-semibold">Cookie Preferences</Text>
                        </div>
                        <Button
                            type="text"
                            icon={<X size={16} />}
                            onClick={() => setShowDetails(false)}
                            className="text-dark-400 hover:text-white"
                        />
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="bg-dark-900 border border-dark-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Text className="text-white font-medium">Essential Cookies</Text>
                                <Text className="text-green-400 text-sm">Always Required</Text>
                            </div>
                            <Paragraph className="text-dark-400 text-sm">
                                Required for the website to function properly, including authentication and security.
                            </Paragraph>
                        </div>

                        <div className="bg-dark-900 border border-dark-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Text className="text-white font-medium">Analytics Cookies</Text>
                                <Button
                                    type="default"
                                    size="small"
                                    onClick={() => {
                                        // Toggle analytics preference
                                        const current = JSON.parse(localStorage.getItem('cookie_consent') || '{}');
                                        handleSavePreferences({
                                            ...current,
                                            analytics: !current.analytics
                                        });
                                    }}
                                    className="border-dark-600 text-white"
                                >
                                    {JSON.parse(localStorage.getItem('cookie_consent') || '{}').analytics ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <Paragraph className="text-dark-400 text-sm">
                                Help us improve our services by collecting anonymous usage data and performance metrics.
                            </Paragraph>
                        </div>

                        <div className="bg-dark-900 border border-dark-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Text className="text-white font-medium">Marketing Cookies</Text>
                                <Button
                                    type="default"
                                    size="small"
                                    onClick={() => {
                                        // Toggle marketing preference
                                        const current = JSON.parse(localStorage.getItem('cookie_consent') || '{}');
                                        handleSavePreferences({
                                            ...current,
                                            marketing: !current.marketing
                                        });
                                    }}
                                    className="border-dark-600 text-white"
                                >
                                    {JSON.parse(localStorage.getItem('cookie_consent') || '{}').marketing ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <Paragraph className="text-dark-400 text-sm">
                                Used to deliver personalized advertisements and track marketing effectiveness.
                            </Paragraph>
                        </div>

                        <div className="bg-dark-900 border border-dark-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Text className="text-white font-medium">Functional Cookies</Text>
                                <Button
                                    type="default"
                                    size="small"
                                    onClick={() => {
                                        // Toggle functional preference
                                        const current = JSON.parse(localStorage.getItem('cookie_consent') || '{}');
                                        handleSavePreferences({
                                            ...current,
                                            functional: !current.functional
                                        });
                                    }}
                                    className="border-dark-600 text-white"
                                >
                                    {JSON.parse(localStorage.getItem('cookie_consent') || '{}').functional ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <Paragraph className="text-dark-400 text-sm">
                                Enable personalized features like remembering your preferences and learning progress.
                            </Paragraph>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <Button
                            type="link"
                            href="/cookies"
                            className="text-primary-400 hover:text-primary-300 p-0"
                        >
                            Learn more about cookies
                        </Button>
                        <Space>
                            <Button
                                onClick={() => setShowDetails(false)}
                                className="border-dark-600 text-white hover:bg-dark-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => {
                                    const current = JSON.parse(localStorage.getItem('cookie_consent') || '{}');
                                    handleSavePreferences(current);
                                }}
                                className="bg-primary-500 hover:bg-primary-600"
                            >
                                Save Preferences
                            </Button>
                        </Space>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-950 border-t border-dark-800 p-4 z-40">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <Cookie className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <Text className="text-white font-medium">We Use Cookies</Text>
                        <Paragraph className="text-dark-400 text-sm mb-0">
                            We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                            By continuing to use our site, you agree to our use of cookies.
                        </Paragraph>
                    </div>
                </div>
                
                <Space size="small" className="flex-shrink-0">
                    <Button
                        type="link"
                        href="/cookies"
                        className="text-primary-400 hover:text-primary-300"
                    >
                        <Settings size={14} />
                    </Button>
                    <Button
                        onClick={handleReject}
                        className="border-dark-600 text-white hover:bg-dark-700"
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={handleCustomize}
                        className="border-dark-600 text-white hover:bg-dark-700"
                    >
                        Customize
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleAcceptAll}
                        className="bg-primary-500 hover:bg-primary-600"
                    >
                        Accept All
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default CookieConsent;
