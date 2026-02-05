import { useState } from 'react';
import { Cookie, Shield, Eye, Settings, CheckCircle, XCircle, Info, ChevronRight, Lock, Database } from 'lucide-react';
import { Typography, Card, Button, Space, Switch, Table, Tag } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Column } = Table;

const CookiesPage = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [cookiePreferences, setCookiePreferences] = useState({
        necessary: true,
        analytics: true,
        marketing: false,
        functional: true
    });

    const sections = [
        {
            key: 'overview',
            title: 'Cookie Overview',
            icon: <Cookie size={16} />,
            content: (
                <div className="space-y-4">
                    <Paragraph className="text-dark-300">
                        Cookies are small text files stored on your device when you visit our website. 
                        They help us provide you with a better experience by remembering your preferences 
                        and improving our services.
                    </Paragraph>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="text-green-500" size={20} />
                                <Text strong className="text-white">Essential</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Required for basic functionality</Text>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Eye className="text-primary-500" size={20} />
                                <Text strong className="text-white">Analytics</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Helps us improve our services</Text>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Settings className="text-orange-500" size={20} />
                                <Text strong className="text-white">Customizable</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">You control what we use</Text>
                        </Card>
                    </div>
                </div>
            )
        },
        {
            key: 'types',
            title: 'Cookie Types We Use',
            icon: <Database size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Cookie Categories</Title>
                        <div className="space-y-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-start gap-4">
                                    <Lock className="text-green-500 mt-1" size={20} />
                                    <div className="flex-1">
                                        <Title level={5} className="text-white">Necessary Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Essential for the website to function properly. These include authentication 
                                            tokens, security cookies, and basic session management. Cannot be disabled.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Tag className="border-green-500/30 text-green-400 bg-green-500/10">Required</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Session</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Security</Tag>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-start gap-4">
                                    <Eye className="text-primary-500 mt-1" size={20} />
                                    <div className="flex-1">
                                        <Title level={5} className="text-white">Analytics Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Help us understand how visitors interact with our website by collecting 
                                            and reporting information anonymously. Used to improve user experience.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Tag className="border-primary-500/30 text-primary-400 bg-primary-500/10">Optional</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Google Analytics</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Hotjar</Tag>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-start gap-4">
                                    <Settings className="text-orange-500 mt-1" size={20} />
                                    <div className="flex-1">
                                        <Title level={5} className="text-white">Functional Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Enable enhanced functionality and personalization, such as remembering 
                                            your preferences, language settings, and learning progress.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Tag className="border-orange-500/30 text-orange-400 bg-orange-500/10">Optional</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Preferences</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Personalization</Tag>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-start gap-4">
                                    <Info className="text-blue-500 mt-1" size={20} />
                                    <div className="flex-1">
                                        <Title level={5} className="text-white">Marketing Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Used to deliver advertisements relevant to you and your interests. 
                                            These track your browsing habits across different websites.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Tag className="border-blue-500/30 text-blue-400 bg-blue-500/10">Optional</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Facebook</Tag>
                                            <Tag className="border-dark-600 text-dark-400">Google Ads</Tag>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'details',
            title: 'Technical Details',
            icon: <Settings size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Specific Cookies Used</Title>
                        <div className="overflow-x-auto">
                            <Table 
                                dataSource={[
                                    {
                                        key: '1',
                                        name: 'ngwavha_session',
                                        purpose: 'User authentication and session management',
                                        category: 'Necessary',
                                        duration: 'Session',
                                        provider: 'Ngwavha Inc'
                                    },
                                    {
                                        key: '2',
                                        name: 'ngwavha_preferences',
                                        purpose: 'Remember user preferences and settings',
                                        category: 'Functional',
                                        duration: '1 Year',
                                        provider: 'Ngwavha Inc'
                                    },
                                    {
                                        key: '3',
                                        name: '_ga',
                                        purpose: 'Google Analytics - distinguish users',
                                        category: 'Analytics',
                                        duration: '2 Years',
                                        provider: 'Google'
                                    },
                                    {
                                        key: '4',
                                        name: '_gid',
                                        purpose: 'Google Analytics - distinguish users',
                                        category: 'Analytics',
                                        duration: '24 Hours',
                                        provider: 'Google'
                                    },
                                    {
                                        key: '5',
                                        name: 'learning_progress',
                                        purpose: 'Track course progress and bookmarks',
                                        category: 'Functional',
                                        duration: '1 Year',
                                        provider: 'Ngwavha Inc'
                                    },
                                    {
                                        key: '6',
                                        name: 'cart_items',
                                        purpose: 'Shopping cart persistence',
                                        category: 'Functional',
                                        duration: '7 Days',
                                        provider: 'Ngwavha Inc'
                                    }
                                ]}
                                pagination={false}
                                className="bg-dark-800"
                                rowClassName="bg-dark-800 hover:bg-dark-700"
                            >
                                <Column title="Cookie Name" dataIndex="name" className="text-white" />
                                <Column title="Purpose" dataIndex="purpose" className="text-dark-300" />
                                <Column 
                                    title="Category" 
                                    dataIndex="category" 
                                    render={(category) => (
                                        <Tag className={
                                            category === 'Necessary' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                            category === 'Analytics' ? 'border-primary-500/30 text-primary-400 bg-primary-500/10' :
                                            'border-orange-500/30 text-orange-400 bg-orange-500/10'
                                        }>
                                            {category}
                                        </Tag>
                                    )}
                                />
                                <Column title="Duration" dataIndex="duration" className="text-dark-300" />
                                <Column title="Provider" dataIndex="provider" className="text-dark-300" />
                            </Table>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Third-Party Cookies</Title>
                        <Paragraph className="text-dark-300 mb-4">
                            We use trusted third-party services that may set their own cookies:
                        </Paragraph>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Google Services</Title>
                                <ul className="space-y-1 text-dark-400 text-sm">
                                    <li>• Google Analytics (website traffic analysis)</li>
                                    <li>• Google reCAPTCHA (security verification)</li>
                                    <li>• Google Fonts (web typography)</li>
                                </ul>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Payment Processors</Title>
                                <ul className="space-y-1 text-dark-400 text-sm">
                                    <li>• Stripe (payment processing)</li>
                                    <li>• PayNow (payment processing)</li>
                                    <li>• PayPal (payment processing)</li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'management',
            title: 'Cookie Management',
            icon: <Settings size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Your Cookie Preferences</Title>
                        <Paragraph className="text-dark-300 mb-6">
                            Customize your cookie preferences below. Changes will take effect on your next visit.
                        </Paragraph>
                        
                        <div className="space-y-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Title level={5} className="text-white">Necessary Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Required for the website to function properly
                                        </Paragraph>
                                    </div>
                                    <Switch checked={true} disabled />
                                </div>
                            </Card>

                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Title level={5} className="text-white">Analytics Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Help us improve our services through anonymous usage data
                                        </Paragraph>
                                    </div>
                                    <Switch 
                                        checked={cookiePreferences.analytics}
                                        onChange={(checked) => setCookiePreferences(prev => ({...prev, analytics: checked}))}
                                    />
                                </div>
                            </Card>

                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Title level={5} className="text-white">Functional Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Enable personalized features and remember your preferences
                                        </Paragraph>
                                    </div>
                                    <Switch 
                                        checked={cookiePreferences.functional}
                                        onChange={(checked) => setCookiePreferences(prev => ({...prev, functional: checked}))}
                                    />
                                </div>
                            </Card>

                            <Card className="bg-dark-800 border-dark-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Title level={5} className="text-white">Marketing Cookies</Title>
                                        <Paragraph className="text-dark-400 text-sm">
                                            Used for advertising and marketing purposes
                                        </Paragraph>
                                    </div>
                                    <Switch 
                                        checked={cookiePreferences.marketing}
                                        onChange={(checked) => setCookiePreferences(prev => ({...prev, marketing: checked}))}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Browser Controls</Title>
                        <Paragraph className="text-dark-300 mb-4">
                            You can also control cookies through your browser settings:
                        </Paragraph>
                        <div className="space-y-2">
                            <div className="flex items-start gap-3">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <Text className="text-dark-300">Block all cookies or only third-party cookies</Text>
                            </div>
                            <div className="flex items-start gap-3">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <Text className="text-dark-300">Delete existing cookies from your device</Text>
                            </div>
                            <div className="flex items-start gap-3">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <Text className="text-dark-300">Set notifications when cookies are set</Text>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'privacy',
            title: 'Privacy & Security',
            icon: <Shield size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Data Protection</Title>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Encryption</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    All cookie data is encrypted using industry-standard protocols 
                                    to protect your information from unauthorized access.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Limited Access</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Only authorized personnel can access cookie data, and only for 
                                    legitimate business purposes.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Data Minimization</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    We collect only the minimum data necessary to provide our services 
                                    and improve user experience.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Regular Audits</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Our cookie practices are regularly audited to ensure compliance 
                                    with privacy regulations and best practices.
                                </Paragraph>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Compliance</Title>
                        <Paragraph className="text-dark-300 mb-4">
                            We comply with major privacy regulations including:
                        </Paragraph>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card className="bg-dark-800 border-dark-700 text-center">
                                <Title level={5} className="text-primary-400">GDPR</Title>
                                <Text className="text-dark-400 text-sm">General Data Protection Regulation</Text>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700 text-center">
                                <Title level={5} className="text-primary-400">CCPA</Title>
                                <Text className="text-dark-400 text-sm">California Consumer Privacy Act</Text>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700 text-center">
                                <Title level={5} className="text-primary-400">POPIA</Title>
                                <Text className="text-dark-400 text-sm">Protection of Personal Information Act</Text>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            title: 'Contact & Updates',
            icon: <Info size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Questions About Cookies</Title>
                        <Paragraph className="text-dark-300">
                            If you have questions about our cookie policy or how we use cookies, 
                            please don't hesitate to contact us.
                        </Paragraph>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-dark-800 border-dark-700">
                            <Title level={5} className="text-primary-400 mb-3">Cookie Policy Questions</Title>
                            <div className="space-y-2">
                                <Text className="text-dark-300">Email: cookies@ngwavha.com</Text>
                                <Text className="text-dark-300 block">Response Time: Within 48 hours</Text>
                            </div>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <Title level={5} className="text-primary-400 mb-3">Data Protection Officer</Title>
                            <div className="space-y-2">
                                <Text className="text-dark-300">Email: dpo@ngwavha.com</Text>
                                <Text className="text-dark-300 block">Response Time: Within 24 hours</Text>
                            </div>
                        </Card>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Policy Updates</Title>
                        <Paragraph className="text-dark-300">
                            We may update this Cookie Policy to reflect changes in our practices, 
                            legal requirements, or the services we provide. We'll notify you of 
                            significant changes through our website or email.
                        </Paragraph>
                        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mt-4">
                            <Text className="text-primary-400">Last Updated: </Text>
                            <Text className="text-white">January 15, 2025</Text>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <Cookie className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                        <Title level={1} className="text-white mb-4">
                            Cookie Policy
                        </Title>
                        <Paragraph className="text-xl text-dark-300 max-w-3xl mx-auto">
                            Learn about the cookies we use, why we use them, and how you can control them. 
                            Your privacy and control are important to us.
                        </Paragraph>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-2">
                            {sections.map((section) => (
                                <button
                                    key={section.key}
                                    onClick={() => setActiveSection(section.key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                                        activeSection === section.key
                                            ? 'bg-primary-500/20 border-l-4 border-primary-500 text-primary-400'
                                            : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                    }`}
                                >
                                    {section.icon}
                                    <span className="font-medium">{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-dark-800 rounded-xl border border-dark-700 p-8">
                            {sections.map((section) => (
                                <div
                                    key={section.key}
                                    className={activeSection === section.key ? 'block' : 'hidden'}
                                >
                                    <Title level={2} className="text-white mb-6 flex items-center gap-3">
                                        {section.icon}
                                        {section.title}
                                    </Title>
                                    {section.content}
                                </div>
                            ))}
                        </div>

                        {/* Cookie Preference Actions */}
                        <div className="mt-8 bg-gradient-to-r from-primary-600/20 to-orange-600/20 border border-primary-500/30 rounded-xl p-6">
                            <Title level={4} className="text-white mb-4">Manage Your Preferences</Title>
                            <Space size="large" wrap>
                                <Button type="primary" className="bg-primary-500 hover:bg-primary-600">
                                    Save Preferences
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Accept All Cookies
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Reject Non-Essential
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Clear All Cookies
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiesPage;
