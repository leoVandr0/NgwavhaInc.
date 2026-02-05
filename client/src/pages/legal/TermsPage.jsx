import { useState } from 'react';
import { FileText, Shield, CreditCard, Users, AlertTriangle, CheckCircle, BookOpen, Award, ChevronRight } from 'lucide-react';
import { Typography, Card, Button, Space, Timeline } from 'antd';

const { Title, Paragraph, Text } = Typography;

const TermsPage = () => {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        {
            key: 'overview',
            title: 'Overview',
            icon: <FileText size={16} />,
            content: (
                <div className="space-y-4">
                    <Paragraph className="text-dark-300">
                        Welcome to Ngwavha Inc! These Terms of Service govern your use of our learning platform 
                        and services. By accessing or using Ngwavha, you agree to comply with and be bound by these terms.
                    </Paragraph>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="text-primary-500" size={20} />
                                <Text strong className="text-white">Fair Use</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Clear rules for everyone</Text>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="text-primary-500" size={20} />
                                <Text strong className="text-white">Protected</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Your rights are safeguarded</Text>
                        </Card>
                        <Card className="bg-dark-800 border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="text-primary-500" size={20} />
                                <Text strong className="text-white">Community</Text>
                            </div>
                            <Text className="text-dark-400 text-sm">Respectful learning environment</Text>
                        </Card>
                    </div>
                </div>
            )
        },
        {
            key: 'services',
            title: 'Our Services',
            icon: <BookOpen size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Platform Features</Title>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Title level={5} className="text-primary-400">For Students</Title>
                                <ul className="space-y-2 text-dark-300">
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Access to online courses and learning materials</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Progress tracking and certification</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Interactive learning tools and assessments</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Community forums and discussion boards</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <Title level={5} className="text-primary-400">For Instructors</Title>
                                <ul className="space-y-2 text-dark-300">
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Course creation and management tools</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Student analytics and insights</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Payment processing and revenue sharing</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="text-primary-500 mt-1" size={14} />
                                        <span>Marketing and promotional support</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Service Availability</Title>
                        <Paragraph className="text-dark-300">
                            We strive to maintain high service availability but cannot guarantee 100% uptime. 
                            Scheduled maintenance will be announced in advance, and we'll work to minimize 
                            any disruption to your learning experience.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'accounts',
            title: 'Account Responsibilities',
            icon: <Users size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Account Creation & Security</Title>
                        <div className="space-y-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Accurate Information</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    You must provide accurate, current, and complete information when creating an account. 
                                    You are responsible for maintaining the confidentiality of your account credentials.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Account Security</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    You are responsible for all activities that occur under your account. 
                                    Notify us immediately of any unauthorized use of your account.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">One Account Per Person</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Each person may maintain only one account. Creating multiple accounts may result 
                                    in suspension or termination of all associated accounts.
                                </Paragraph>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Account Termination</Title>
                        <Paragraph className="text-dark-300">
                            We reserve the right to suspend or terminate accounts that violate these terms or 
                            engage in fraudulent activity. You may terminate your account at any time through 
                            your account settings.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'payments',
            title: 'Payment Terms',
            icon: <CreditCard size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Course Pricing</Title>
                        <Paragraph className="text-dark-300">
                            Course prices are clearly displayed on each course page. Prices may change for new 
                            enrollments, but once enrolled, you maintain access at the price you paid.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Payment Methods</Title>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Available Methods</Title>
                                <ul className="space-y-1 text-dark-400 text-sm">
                                    <li>• Credit/Debit Cards (Visa, Mastercard)</li>
                                    <li>• EcoCash (via PayNow)</li>
                                    <li>• Bank Transfers</li>
                                    <li>• Mobile Money</li>
                                </ul>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Security</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    All payment transactions are encrypted and processed securely through 
                                    certified payment gateways.
                                </Paragraph>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Refund Policy</Title>
                        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                            <Title level={5} className="text-primary-400 mb-3">30-Day Money-Back Guarantee</Title>
                            <ul className="space-y-2 text-dark-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="text-green-500 mt-1" size={14} />
                                    <span>Full refund within 30 days if not satisfied</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="text-green-500 mt-1" size={14} />
                                    <span>No questions asked policy</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="text-yellow-500 mt-1" size={14} />
                                    <span>Certificate courses may have different terms</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Instructor Payments</Title>
                        <Paragraph className="text-dark-300">
                            Instructors receive revenue share according to our instructor agreement. 
                            Payments are processed monthly within 15 days of month-end.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'conduct',
            title: 'Code of Conduct',
            icon: <Shield size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Community Guidelines</Title>
                        <Paragraph className="text-dark-300 mb-4">
                            We're committed to providing a safe, inclusive, and respectful learning environment. 
                            All users must adhere to the following guidelines:
                        </Paragraph>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-green-900/20 border-green-500/30">
                                <Title level={5} className="text-green-400 mb-3">✅ Acceptable Behavior</Title>
                                <ul className="space-y-1 text-dark-300 text-sm">
                                    <li>• Respectful communication</li>
                                    <li>• Constructive feedback</li>
                                    <li>• Academic integrity</li>
                                    <li>• Helping fellow learners</li>
                                    <li>• Following course guidelines</li>
                                </ul>
                            </Card>
                            <Card className="bg-red-900/20 border-red-500/30">
                                <Title level={5} className="text-red-400 mb-3">❌ Prohibited Behavior</Title>
                                <ul className="space-y-1 text-dark-300 text-sm">
                                    <li>• Harassment or bullying</li>
                                    <li>• Spam or excessive promotion</li>
                                    <li>• Sharing copyrighted materials</li>
                                    <li>• Academic dishonesty</li>
                                    <li>• Disruptive behavior</li>
                                </ul>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Enforcement</Title>
                        <Paragraph className="text-dark-300">
                            Violations of the code of conduct may result in warnings, temporary suspension, 
                            or permanent account termination. We investigate all reports thoroughly and fairly.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'intellectual',
            title: 'Intellectual Property',
            icon: <Award size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Course Content</Title>
                        <div className="space-y-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Instructor Rights</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Instructors retain ownership of their course content but grant Ngwavha 
                                    a license to host, distribute, and promote the content on our platform.
                                </Paragraph>
                            </Card>
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">Student Access</Title>
                                <Paragraph className="text-dark-400 text-sm">
                                    Enrolled students have access to course materials for the duration of their 
                                    enrollment. Unauthorized sharing, reproduction, or distribution is prohibited.
                                </Paragraph>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Platform Content</Title>
                        <Paragraph className="text-dark-300">
                            The Ngwavha platform, including its design, features, and original content, 
                            is owned by Ngwavha Inc and protected by copyright and other intellectual 
                            property laws.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4} className="text-white">User-Generated Content</Title>
                        <Paragraph className="text-dark-300">
                            By posting content on our platform, you grant us a license to use, modify, 
                            and display that content for the purpose of operating and improving our services.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'liability',
            title: 'Limitation of Liability',
            icon: <AlertTriangle size={16} />,
            content: (
                <div className="space-y-6">
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                        <Title level={4} className="text-yellow-400 mb-4">Important Disclaimer</Title>
                        <Paragraph className="text-dark-300">
                            Ngwavha Inc provides our services "as is" without warranties of any kind. 
                            We are not liable for any indirect, incidental, or consequential damages 
                            arising from your use of our platform.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Service Limitations</Title>
                        <ul className="space-y-2 text-dark-300">
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <span>We do not guarantee specific learning outcomes or results</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <span>Course availability may change without notice</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <span>We are not responsible for third-party content or links</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-primary-500 mt-1" size={14} />
                                <span>Maximum liability is limited to the amount you paid for services</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Indemnification</Title>
                        <Paragraph className="text-dark-300">
                            You agree to indemnify and hold Ngwavha Inc harmless from any claims, 
                            damages, or expenses arising from your violation of these terms or 
                            infringement of third-party rights.
                        </Paragraph>
                    </div>
                </div>
            )
        },
        {
            key: 'changes',
            title: 'Terms Changes',
            icon: <FileText size={16} />,
            content: (
                <div className="space-y-6">
                    <div>
                        <Title level={4} className="text-white">Updating Our Terms</Title>
                        <Paragraph className="text-dark-300">
                            We may update these Terms of Service periodically to reflect changes in our 
                            services, legal requirements, or business practices.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Notification Process</Title>
                        <div className="space-y-4">
                            <Card className="bg-dark-800 border-dark-700">
                                <Title level={5} className="text-primary-400">How We'll Notify You</Title>
                                <ul className="space-y-2 text-dark-300 text-sm">
                                    <li>• Email notification for significant changes</li>
                                    <li>• In-platform announcements</li>
                                    <li>• Website banners for major updates</li>
                                    <li>• Updated "Last Modified" date</li>
                                </ul>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Title level={4} className="text-white">Continued Use</Title>
                        <Paragraph className="text-dark-300">
                            Your continued use of our services after changes take effect constitutes 
                            acceptance of the updated terms. If you disagree with any changes, 
                            you may terminate your account.
                        </Paragraph>
                    </div>

                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                        <Text className="text-primary-400">Last Updated: </Text>
                        <Text className="text-white">January 15, 2025</Text>
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
                        <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                        <Title level={1} className="text-white mb-4">
                            Terms of Service
                        </Title>
                        <Paragraph className="text-xl text-dark-300 max-w-3xl mx-auto">
                            Our rules and guidelines for using Ngwavha's learning platform. 
                            Please read these terms carefully.
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

                        {/* Acceptance Section */}
                        <div className="mt-8 bg-gradient-to-r from-primary-600/20 to-orange-600/20 border border-primary-500/30 rounded-xl p-6">
                            <Title level={4} className="text-white mb-4">Acceptance of Terms</Title>
                            <Paragraph className="text-dark-300 mb-4">
                                By using Ngwavha's services, you acknowledge that you have read, understood, 
                                and agree to be bound by these Terms of Service.
                            </Paragraph>
                            <Space size="large" wrap>
                                <Button type="primary" className="bg-primary-500 hover:bg-primary-600">
                                    I Agree to These Terms
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Contact Support
                                </Button>
                                <Button className="border-dark-600 text-white hover:bg-dark-800">
                                    Print Terms
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
