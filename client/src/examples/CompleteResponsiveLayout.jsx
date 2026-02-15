import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Settings,
    LogOut,
    Shield,
    Activity,
    DollarSign,
    X,
    Menu,
    Bell,
    TrendingUp,
    Eye,
    BarChart3,
    AlertTriangle
} from 'lucide-react';
import { Badge, Avatar, Card, Statistic, Row, Col, Button } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';

// Complete Responsive Layout Example
const CompleteResponsiveLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [notifications, setNotifications] = useState(3);
    const location = useLocation();
    const { currentUser } = useAuth();

    // Mobile detection and responsive handling
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
                setIsMobileMenuOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSidebarToggle = () => {
        if (isMobile) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
        }
    };

    const handleMobileClose = () => {
        setIsMobileMenuOpen(false);
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', badge: null },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Users', badge: null },
        { path: '/admin/teachers', icon: <GraduationCap size={20} />, label: 'Teachers', badge: 5 },
        { path: '/admin/courses', icon: <BookOpen size={20} />, label: 'Courses', badge: null },
        { path: '/admin/analytics', icon: <Activity size={20} />, label: 'Analytics', badge: null },
        { path: '/admin/finance', icon: <DollarSign size={20} />, label: 'Finance', badge: null },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings', badge: null }
    ];

    const isActive = (path) => location.pathname === path;

    // Sample data for demonstration
    const stats = {
        totalUsers: 1234,
        activeUsers: 856,
        totalTeachers: 45,
        pendingTeachers: 5,
        totalCourses: 67,
        monthlyRevenue: 45678
    };

    const recentActivity = [
        { id: 1, user: 'John Doe', action: 'Created new course', time: '2 hours ago', status: 'success' },
        { id: 2, user: 'Jane Smith', action: 'Enrolled in course', time: '3 hours ago', status: 'success' },
        { id: 3, user: 'Bob Johnson', action: 'Teacher application', time: '5 hours ago', status: 'pending' },
    ];

    const columns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (text) => <span className="text-white font-medium whitespace-nowrap">{text}</span>
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <span className="text-dark-300 whitespace-nowrap">{text}</span>
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            render: (text) => <span className="text-dark-400 whitespace-nowrap">{text}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'success' ? 'bg-green-500/20 text-green-400' :
                    status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                }`}>
                    {status.toUpperCase()}
                </span>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Mobile Overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={handleMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${
                    isMobile 
                        ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                          }`
                        : `hidden lg:flex flex-col bg-dark-900 border-r border-dark-800 transition-all duration-300 ease-in-out ${
                            isSidebarOpen ? 'w-64' : 'w-20'
                          }`
                }`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800 flex-shrink-0">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 min-w-0">
                        <img src={logo} alt="Ngwavha" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                        {(isMobile || isSidebarOpen) && (
                            <div className="overflow-hidden">
                                <span className="text-lg font-bold text-white block">Ngwavha</span>
                                <span className="text-xs text-primary-500 block">Admin Panel</span>
                            </div>
                        )}
                    </Link>
                    {isMobile ? (
                        <button
                            onClick={handleMobileClose}
                            className="text-dark-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSidebarToggle}
                            className="text-dark-400 hover:text-white p-1 rounded hover:bg-dark-800 transition-colors"
                        >
                            <Menu size={18} />
                        </button>
                    )}
                </div>

                {/* Admin Badge */}
                {(isMobile || isSidebarOpen) && (
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                            <Shield size={14} className="text-primary-500 flex-shrink-0" />
                            <span className="text-xs font-medium text-primary-400 whitespace-nowrap">Administrator Access</span>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={isMobile ? handleMobileClose : undefined}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-primary-500 text-dark-950'
                                            : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                                    }`}
                                    title={!isSidebarOpen && !isMobile ? item.label : undefined}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-dark-950' : ''}`}>
                                            {item.icon}
                                        </span>
                                        {(isMobile || isSidebarOpen) && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </div>
                                    {(isMobile || isSidebarOpen) && item.badge && (
                                        <Badge
                                            count={item.badge}
                                            className="bg-primary-500 text-dark-950 flex-shrink-0"
                                            style={{ backgroundColor: '#FFA500', color: '#000' }}
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                {(isMobile || isSidebarOpen) && (
                    <div className="border-t border-dark-800 p-3">
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <Avatar
                                src={currentUser?.avatar}
                                className="bg-primary-500 flex-shrink-0"
                            >
                                {currentUser?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {currentUser?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-dark-400 truncate">
                                    {currentUser?.email || 'admin@ngwavha.com'}
                                </p>
                            </div>
                        </div>
                        <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut size={16} className="flex-shrink-0" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 max-w-full">
                {/* Header */}
                <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <button
                            onClick={handleSidebarToggle}
                            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex-shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-semibold text-white truncate">
                            Admin Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <button className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-dark-950 text-xs font-bold flex items-center justify-center rounded-full">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white truncate max-w-32">
                                    {currentUser?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-dark-400 truncate max-w-32">
                                    {currentUser?.email || 'admin@ngwavha.com'}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-dark-950 text-sm font-bold">
                                {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6 min-w-0">
                    <div className="space-y-6 max-w-full">
                        {/* Stats Grid */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} lg={8} xl={6}>
                                <Card className="bg-dark-800 border-dark-700 h-full">
                                    <Statistic
                                        title={
                                            <span className="text-dark-300 flex items-center gap-2">
                                                <Users size={16} />
                                                Total Users
                                            </span>
                                        }
                                        value={stats.totalUsers}
                                        prefix={<TrendingUp size={16} className="text-green-500" />}
                                        valueStyle={{ color: '#10b981' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={8} xl={6}>
                                <Card className="bg-dark-800 border-dark-700 h-full">
                                    <Statistic
                                        title={
                                            <span className="text-dark-300 flex items-center gap-2">
                                                <Eye size={16} />
                                                Active Users
                                            </span>
                                        }
                                        value={stats.activeUsers}
                                        prefix={<BarChart3 size={16} className="text-blue-500" />}
                                        valueStyle={{ color: '#3b82f6' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={8} xl={6}>
                                <Card className="bg-dark-800 border-dark-700 h-full">
                                    <Statistic
                                        title={
                                            <span className="text-dark-300 flex items-center gap-2">
                                                <GraduationCap size={16} />
                                                Pending Teachers
                                            </span>
                                        }
                                        value={stats.pendingTeachers}
                                        prefix={<AlertTriangle size={16} className="text-orange-500" />}
                                        valueStyle={{ color: '#f59e0b' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={8} xl={6}>
                                <Card className="bg-dark-800 border-dark-700 h-full">
                                    <Statistic
                                        title={
                                            <span className="text-dark-300 flex items-center gap-2">
                                                <DollarSign size={16} />
                                                Monthly Revenue
                                            </span>
                                        }
                                        value={stats.monthlyRevenue}
                                        prefix="$"
                                        valueStyle={{ color: '#10b981' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Activity Table */}
                        <Card
                            className="bg-dark-800 border-dark-700"
                            title={
                                <span className="text-white flex items-center gap-2">
                                    <Activity size={20} />
                                    Recent Activity
                                </span>
                            }
                            extra={
                                <Button type="text" className="text-primary-400 hover:text-primary-300">
                                    View All
                                </Button>
                            }
                        >
                            <div className="overflow-x-auto">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="overflow-hidden rounded-lg border border-dark-700">
                                        <table className="w-full bg-dark-800">
                                            <thead className="bg-dark-900">
                                                <tr>
                                                    {columns.map((col) => (
                                                        <th
                                                            key={col.key}
                                                            className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider whitespace-nowrap"
                                                        >
                                                            {col.title}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dark-700">
                                                {recentActivity.map((item) => (
                                                    <tr key={item.id} className="hover:bg-dark-700 transition-colors">
                                                        {columns.map((col) => (
                                                            <td
                                                                key={col.key}
                                                                className="px-6 py-4 whitespace-nowrap text-sm"
                                                            >
                                                                {col.render ? col.render(item[col.dataIndex]) : item[col.dataIndex]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CompleteResponsiveLayout;
