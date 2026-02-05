import { useState } from 'react';
import { Shield, Eye, Lock, Database, Globe, Mail, User, Calendar, ChevronRight } from 'lucide-react';
import { Typography, Card, Collapse, Button, Space } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const PrivacyPage = () => {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        {
            key: 'overview',
            title: 'Overview',
            icon: <Shield size={16} />,
            content: (
                <div className="space-y-4">
                    <Paragraph className="text-dark-300">
                        At Ngwavha Inc, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                        and protect your information when you use our learning platform. We are committed to transparency 
                        and giving you control over your personal data.
                    </Paragraph>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Lock className="text-primary-500" size={20} />
                                <Text strong className="text-white">Secure</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Bank-level encryption for all data</Text>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Eye className="text-primary-500" size={20} />
                                <Text strong className="text-white">Transparent</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Clear policies and practices</Text>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="text-primary-500" size={20} />
                                <Text strong className="text-white">User Control</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">You control your data</Text>
                        </Card>
                    </div>
                </div>
            )
        },
        {
            key: 'collection',
            title: 'Information We Collect',
            icon: <Database size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Personal Information</Title>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User className="text-primary-500 mt-1" size={16} />
                                <div>
                                    <Text strong className="text-white">Account Information</Text>
                                    <Paragraph className="text-dark-400 text-sm mt-1">
                                        Name, email address, password, profile information, and learning preferences
                                    </Paragraph>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-primary-500 mt-1" size={16} />
                                <div>
                                    <Text strong className="text-white">Communication Data</Text>
                                    <Paragraph className="text-dark-400 text-sm mt-1">
                                        Messages, support requests, feedback, and course interactions
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Usage Data</Title>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Globe className="text-primary-500 mt-1" size={16} />
                                <div>
                                    <Text strong className="text-white">Learning Analytics</Text>
                                    <Paragraph className="text-dark-400 text-sm mt-1">
                                        Course progress, quiz scores, video watch time, and learning patterns
                                    </Paragraph>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-primary-500 mt-1" size={16} />
                                <div>
                                    <Text strong className="text-white">Activity Logs</Text>
                                    <Paragraph className="text-dark-400 text-sm mt-1">
                                        Login times, course access, payment history, and platform interactions
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Technical Data</Title>
                        <Paragraph className="text-dark-400">
                            IP address, browser type, device information, cookies, and usage patterns to improve 
                            our services and ensure security.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'usage',
            title: 'How We Use Your Data',
            icon: <Eye size={16} />,
            content: (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Title level={4} className="text-white">Service Delivery</Title>
                            <ul className="space-y-2 text-dark-300">
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Provide and maintain our learning platform</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Process payments and manage subscriptions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Track learning progress and achievements</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Provide customer support and assistance</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <Title level={4} className="text-white">Improvement & Analytics</Title>
                            <ul className="space-y-2 text-dark-300">
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Analyze platform usage patterns</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Improve course recommendations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Optimize user experience</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-primary-500 mt-1" size={14} />
                                    <span>Develop new features and services</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'protection',
            title: 'Data Protection',
            icon: <Lock size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Security Measures</Title>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Encryption</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    All data is encrypted using industry-standard AES-256 encryption 
                                    both in transit and at rest.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Access Control</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Strict access controls and authentication mechanisms ensure 
                                    only authorized personnel can access your data.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Regular Audits</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    We conduct regular security audits and penetration testing 
                                    to identify and address vulnerabilities.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Compliance</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    We comply with GDPR, CCPA, and other data protection regulations 
                                    to ensure your rights are protected.
                                </Paragraph>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Data Retention</Title>
                        <Paragraph className="text-dark-300">
                            We retain your personal information only as long as necessary to provide our services 
                            and comply with legal obligations. You can request deletion of your account and data 
                            at any time through your account settings.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'rights',
            title: 'Your Rights',
            icon: <User size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Data Subject Rights</Title>
                        <div className="space-y-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Access</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Request a copy of all personal data we hold about you
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Correction</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Update or correct inaccurate personal information
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Deletion</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Request deletion of your personal data (right to be forgotten)
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Portability</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Request transfer of your data to another service provider
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Objection</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Object to processing of your personal data in certain circumstances
                                </Paragraph>
                            </Card>
                        </div>
                    </div>

                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                        <Title level={4} className="text-white mb-4">How to Exercise Your Rights</Title>
                        <Paragraph className="text-dark-300 mb-4">
                            To exercise any of these rights, please contact us at:
                        </Paragraph>
                        <div className="space-y-2">
                            <Text className="text-primary-400">Email: </Text>
                            <Text className="text-white">privacy@ngwavha.com</Text>
                            <br />
                            <Text className="text-primary-400">Mail: </Text>
                            <Text className="text-white">Ngwavha Inc, Privacy Officer, 123 Innovation Drive, Harare, Zimbabwe</Text>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            title: 'Contact & Updates',
            icon: <Mail size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Questions & Concerns</Title>
                        <Paragraph className="text-dark-300">
                            If you have any questions about this Privacy Policy or how we handle your data, 
                            please don't hesitate to contact our privacy team.
                        </Paragraph>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-dark-800 border-dark-700">
                            <Title level={5} className="text-primary-400 mb-3">Privacy Inquiries</Title>
                            <div className="space-y-2">
                                <Text className="text-dark-300">Email: privacy@ngwavha.com</Text>
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
                            We may update this Privacy Policy from time to time. We will notify you of any 
                            significant changes by email or by prominently posting the updated policy on our platform. 
                            The updated policy will be effective immediately upon posting.
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
                        <Shield className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                        <Title level={1} className="text-white mb-4">
                            Privacy Policy
                        </Title>
                        <Paragraph className="text-xl text-dark-300 max-w-3xl mx-auto">
                            Your privacy is our priority. Learn how we collect, use, and protect your personal information.
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

                        {/* Quick Actions */}
                        <div className="mt-8 bg-gradient-to-r from-primary-600/20 to-orange-600/20 border border-primary-500/30 rounded-xl p-6">
                            <Title level={4} className="text-white mb-4">Quick Actions</Title>
                            <Space size="large" wrap>
                                <Button type="primary" className="bg-primary-500 hover:bg-primary-600">
                                    Download My Data
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Request Data Deletion
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Privacy Settings
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Contact Privacy Team
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
