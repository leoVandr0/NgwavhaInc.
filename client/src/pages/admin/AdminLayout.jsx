import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
    Layout, 
    Menu, 
    Typography 
} from 'antd';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    BookOpen,
    BarChart3,
    DollarSign,
    Settings,
    Eye
} from 'lucide-react';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <LayoutDashboard size={18} />,
            label: <Link to="/admin/dashboard">Dashboard</Link>,
        },
        {
            key: '/admin/users',
            icon: <Users size={18} />,
            label: <Link to="/admin/users">Users</Link>,
        },
        {
            key: '/admin/teachers',
            icon: <UserCheck size={18} />,
            label: <Link to="/admin/teachers">Teachers</Link>,
        },
        {
            key: '/admin/courses',
            icon: <BookOpen size={18} />,
            label: <Link to="/admin/courses">Courses</Link>,
        },
        {
            key: '/admin/course-previews',
            icon: <Eye size={18} />,
            label: <Link to="/admin/course-previews">Course Previews</Link>,
        },
        {
            key: '/admin/analytics',
            icon: <BarChart3 size={18} />,
            label: <Link to="/admin/analytics">Analytics</Link>,
        },
        {
            key: '/admin/finance',
            icon: <DollarSign size={18} />,
            label: <Link to="/admin/finance">Finance</Link>,
        },
        {
            key: '/admin/settings',
            icon: <Settings size={18} />,
            label: <Link to="/admin/settings">Settings</Link>,
        },
    ];

    // Get the current selected key based on pathname
    const selectedKey = location.pathname || '/admin/dashboard';

    return (
        <ResponsiveLayout title="Admin Dashboard">
            <Layout style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Sider width={250} theme="dark" style={{ background: '#001529' }}>
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <Title level={4} style={{ color: '#fff', margin: 0 }}>
                            Admin Panel
                        </Title>
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        style={{ borderRight: 0 }}
                    />
                </Sider>
                <Layout>
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '8px' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ResponsiveLayout>
    );
};

export default AdminLayout;
