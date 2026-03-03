import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, Select, Tabs, message, Divider } from 'antd';
import { Save, Settings, Globe, Shield, Bell, Mail } from 'lucide-react';
import api from '../../services/api';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Ngwavha Learning Platform',
        siteDescription: 'Empowering learners worldwide',
        contactEmail: 'support@ngwavha.com',
        maintenanceMode: false,
        allowRegistrations: true,
        defaultUserRole: 'student'
    });

    const [emailSettings, setEmailSettings] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@ngwavha.com',
        fromName: 'Ngwavha Platform'
    });

    const [securitySettings, setSecuritySettings] = useState({
        passwordMinLength: 8,
        requireEmailVerification: true,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        lockoutDuration: 15
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        welcomeEmail: true,
        courseUpdateEmail: true,
        paymentConfirmationEmail: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            const settings = response.data || {};
            
            if (settings.general) setGeneralSettings(settings.general);
            if (settings.email) setEmailSettings(settings.email);
            if (settings.security) setSecuritySettings(settings.security);
            if (settings.notifications) setNotificationSettings(settings.notifications);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSave = async (category, settings) => {
        setLoading(true);
        try {
            await api.put('/admin/settings', {
                category,
                settings
            });
            message.success(`${category} settings saved successfully`);
        } catch (error) {
            console.error('Error saving settings:', error);
            message.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const onGeneralFinish = (values) => {
        handleSave('general', values);
    };

    const onEmailFinish = (values) => {
        handleSave('email', values);
    };

    const onSecurityFinish = (values) => {
        handleSave('security', values);
    };

    const onNotificationFinish = (values) => {
        handleSave('notifications', values);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Platform Settings</h1>
                <p className="text-gray-600">Configure platform-wide settings and preferences</p>
            </div>

            <Card>
                <Tabs defaultActiveKey="general">
                    <TabPane 
                        tab={
                            <span>
                                <Globe size={16} />
                                General
                            </span>
                        } 
                        key="general"
                    >
                        <Form
                            layout="vertical"
                            initialValues={generalSettings}
                            onFinish={onGeneralFinish}
                        >
                            <Form.Item
                                label="Site Name"
                                name="siteName"
                                rules={[{ required: true, message: 'Please enter site name' }]}
                            >
                                <Input placeholder="Enter site name" />
                            </Form.Item>

                            <Form.Item
                                label="Site Description"
                                name="siteDescription"
                            >
                                <TextArea rows={3} placeholder="Enter site description" />
                            </Form.Item>

                            <Form.Item
                                label="Contact Email"
                                name="contactEmail"
                                rules={[
                                    { required: true, message: 'Please enter contact email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input placeholder="contact@ngwavha.com" />
                            </Form.Item>

                            <Form.Item
                                label="Default User Role"
                                name="defaultUserRole"
                            >
                                <Select>
                                    <Option value="student">Student</Option>
                                    <Option value="instructor">Instructor</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Maintenance Mode"
                                name="maintenanceMode"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                label="Allow New Registrations"
                                name="allowRegistrations"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
                                    Save General Settings
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane 
                        tab={
                            <span>
                                <Mail size={16} />
                                Email
                            </span>
                        } 
                        key="email"
                    >
                        <Form
                            layout="vertical"
                            initialValues={emailSettings}
                            onFinish={onEmailFinish}
                        >
                            <Form.Item
                                label="SMTP Host"
                                name="smtpHost"
                                rules={[{ required: true, message: 'Please enter SMTP host' }]}
                            >
                                <Input placeholder="smtp.gmail.com" />
                            </Form.Item>

                            <Form.Item
                                label="SMTP Port"
                                name="smtpPort"
                                rules={[{ required: true, message: 'Please enter SMTP port' }]}
                            >
                                <Input type="number" placeholder="587" />
                            </Form.Item>

                            <Form.Item
                                label="SMTP Username"
                                name="smtpUser"
                            >
                                <Input placeholder="your-email@gmail.com" />
                            </Form.Item>

                            <Form.Item
                                label="SMTP Password"
                                name="smtpPassword"
                            >
                                <Input.Password placeholder="Enter SMTP password" />
                            </Form.Item>

                            <Form.Item
                                label="From Email"
                                name="fromEmail"
                                rules={[
                                    { required: true, message: 'Please enter from email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input placeholder="noreply@ngwavha.com" />
                            </Form.Item>

                            <Form.Item
                                label="From Name"
                                name="fromName"
                            >
                                <Input placeholder="Ngwavha Platform" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
                                    Save Email Settings
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane 
                        tab={
                            <span>
                                <Shield size={16} />
                                Security
                            </span>
                        } 
                        key="security"
                    >
                        <Form
                            layout="vertical"
                            initialValues={securitySettings}
                            onFinish={onSecurityFinish}
                        >
                            <Form.Item
                                label="Minimum Password Length"
                                name="passwordMinLength"
                                rules={[{ required: true, message: 'Please enter minimum password length' }]}
                            >
                                <Input type="number" placeholder="8" />
                            </Form.Item>

                            <Form.Item
                                label="Require Email Verification"
                                name="requireEmailVerification"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                label="Session Timeout (hours)"
                                name="sessionTimeout"
                                rules={[{ required: true, message: 'Please enter session timeout' }]}
                            >
                                <Input type="number" placeholder="24" />
                            </Form.Item>

                            <Form.Item
                                label="Max Login Attempts"
                                name="maxLoginAttempts"
                                rules={[{ required: true, message: 'Please enter max login attempts' }]}
                            >
                                <Input type="number" placeholder="5" />
                            </Form.Item>

                            <Form.Item
                                label="Lockout Duration (minutes)"
                                name="lockoutDuration"
                                rules={[{ required: true, message: 'Please enter lockout duration' }]}
                            >
                                <Input type="number" placeholder="15" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
                                    Save Security Settings
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane 
                        tab={
                            <span>
                                <Bell size={16} />
                                Notifications
                            </span>
                        } 
                        key="notifications"
                    >
                        <Form
                            layout="vertical"
                            initialValues={notificationSettings}
                            onFinish={onNotificationFinish}
                        >
                            <Divider>Notification Channels</Divider>

                            <Form.Item
                                label="Email Notifications"
                                name="emailNotifications"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                label="Push Notifications"
                                name="pushNotifications"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                label="SMS Notifications"
                                name="smsNotifications"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Divider>Email Templates</Divider>

                            <Form.Item
                                label="Welcome Email"
                                name="welcomeEmail"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                label="Course Update Email"
                                name="courseUpdateEmail"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                label="Payment Confirmation Email"
                                name="paymentConfirmationEmail"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
                                    Save Notification Settings
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default AdminSettings;
