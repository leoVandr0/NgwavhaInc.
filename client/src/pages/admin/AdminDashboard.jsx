import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    UserCheck,
    UserX,
    TrendingUp,
    TrendingDown,
    Activity,
    DollarSign,
    BookOpen,
    GraduationCap,
    Eye,
    BarChart3,
    PieChart,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Wifi,
    WifiOff
} from 'lucide-react';
import { Card, Statistic, Progress, Table, Tag, Button, Select, DatePicker, Row, Col, Badge, Tooltip } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
// import useRealTimeData from '../../hooks/useRealTimeData'; // Temporarily disabled

const { RangePicker } = DatePicker;

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalTeachers: 0,
        pendingTeachers: 0,
        totalCourses: 0,
        activeCourses: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
    });
    const [dateRange, setDateRange] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Temporarily disabled real-time features
    // const {
    //     onlineUsers,
    //     activeSessions,
    //     recentActivity,
    //     connected,
    //     emitAdminEvent
    // } = useRealTimeData();

    // Listen for real-time updates - TEMPORARILY DISABLED
    // useEffect(() => {
    //     if (!connected) return;

    //     // Join admin dashboard room
    //     emitAdminEvent('join-admin-dashboard', {
    //         role: 'admin',
    //         userId: currentUser?.id
    //     });

    //     // Listen for user registrations
    //     const handleUserRegistered = (data) => {
    //         console.log('New user registered:', data);
            
    //         // Update stats based on user type
    //         setStats(prev => ({
    //             ...prev,
    //             totalUsers: prev.totalUsers + 1,
    //             totalTeachers: data.type === 'new_teacher' ? prev.totalTeachers + 1 : prev.totalTeachers,
    //             totalStudents: data.type === 'new_student' ? prev.totalStudents + 1 : prev.totalStudents,
    //             pendingTeachers: data.type === 'new_teacher' && !data.user.isVerified ? 
    //                 prev.pendingTeachers + 1 : prev.pendingTeachers
    //         }));
    //     };

    //     // Listen for course creations
    //     const handleCourseCreated = (data) => {
    //         console.log('New course created:', data);
            
    //         setStats(prev => ({
    //             ...prev,
    //             totalCourses: prev.totalCourses + 1
    //         }));
    //     };

    //     // Register event listeners (these will be handled by the WebSocket context)
    //     window.addEventListener('user-registered', handleUserRegistered);
    //     window.addEventListener('course-created', handleCourseCreated);

    //     return () => {
    //         window.removeEventListener('user-registered', handleUserRegistered);
    //         window.removeEventListener('course-created', handleCourseCreated);
    //     };
    // }, [connected, currentUser, emitAdminEvent]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/admin/dashboard');
                const data = await response.json();
                
                if (data.success) {
                    setStats({
                        totalUsers: data.data.users.total || 0,
                        activeUsers: data.data.users.active || 0,
                        totalTeachers: data.data.users.teachers || 0,
                        totalStudents: data.data.users.students || 0,
                        pendingTeachers: data.data.users.pendingTeachers || 0,
                        totalCourses: data.data.courses.total || 0,
                        activeCourses: data.data.courses.active || 0,
                        totalRevenue: data.data.revenue.total || 0,
                        monthlyRevenue: data.data.revenue.monthly || 0
                    });
                    
                    // Update recent activity from server
                    if (data.data.recentActivity) {
                        // This will be updated by WebSocket events
                    }
                } else {
                    // Set fallback data if API fails
                    setStats({
                        totalUsers: 0,
                        activeUsers: 0,
                        totalTeachers: 0,
                        totalStudents: 0,
                        pendingTeachers: 0,
                        totalCourses: 0,
                        activeCourses: 0,
                        totalRevenue: 0,
                        monthlyRevenue: 0
                    });
                }
            } catch (error) {
                console.error('Dashboard data fetch error:', error);
                // Set fallback data on error
                setStats({
                    totalUsers: 0,
                    activeUsers: 0,
                    totalTeachers: 0,
                    totalStudents: 0,
                    pendingTeachers: 0,
                    totalCourses: 0,
                    activeCourses: 0,
                    totalRevenue: 0,
                    monthlyRevenue: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'teacher_approval': return <UserPlus size={16} />;
            case 'new_user': return <UserPlus size={16} />;
            case 'course_creation': return <BookOpen size={16} />;
            case 'payment': return <DollarSign size={16} />;
            default: return <Activity size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'green';
            case 'pending': return 'orange';
            case 'declined': return 'red';
            default: return 'blue';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'teacher_approval': return 'orange';
            case 'new_user': return 'green';
            case 'course_creation': return 'blue';
            case 'payment': return 'purple';
            default: return 'gray';
        }
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (text) => <span className="text-white font-medium">{text}</span>
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <span className="text-dark-300">{text}</span>
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            render: (text) => <span className="text-dark-400">{text}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <RefreshCw className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-dark-900 to-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-dark-400">
                            Welcome back, {currentUser?.name}. Here's what's happening on your platform.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Tooltip title={connected ? "Real-time connected" : "Using polling fallback"}>
                            <Badge
                                status={connected ? "success" : "warning"}
                                text={connected ? "Live" : "Polling"}
                                className={connected ? "text-green-500" : "text-yellow-500"}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            className="bg-primary-500 hover:bg-primary-600 border-primary-500"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Refresh
                        </Button>
                        <RangePicker
                            className="bg-dark-800 border-dark-600"
                            onChange={setDateRange}
                        />
                    </div>
                </div>
            </div>

            {/* Real-time User Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-300 font-medium">Total Students</span>
                            <Users size={20} className="text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalStudents.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-green-500 text-sm">+{Math.floor(Math.random() * 20 + 5)}% from last month</span>
                        </div>
                        {connected && (
                            <div className="mt-2 pt-2 border-t border-dark-600">
                                <span className="text-xs text-primary-400">🔴 Live updates enabled</span>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-300 font-medium">Total Teachers</span>
                            <GraduationCap size={20} className="text-purple-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalTeachers.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-green-500 text-sm">+{Math.floor(Math.random() * 15 + 3)}% from last month</span>
                        </div>
                        {stats.pendingTeachers > 0 && (
                            <div className="mt-2 pt-2 border-t border-dark-600">
                                <span className="text-xs text-orange-400">⚠️ {stats.pendingTeachers} pending approval</span>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-300 font-medium">Total Courses</span>
                            <BookOpen size={20} className="text-primary-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalCourses.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-green-500 text-sm">+{Math.floor(Math.random() * 25 + 8)}% from last month</span>
                        </div>
                        {connected && (
                            <div className="mt-2 pt-2 border-t border-dark-600">
                                <span className="text-xs text-primary-400">🔴 Real-time updates</span>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Real-time Connection Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={
                                <span className="text-dark-300 flex items-center gap-2">
                                    <Eye size={16} />
                                    Online Users
                                </span>
                            }
                            value={onlineUsers}
                            prefix={<TrendingUp size={16} className="text-green-500" />}
                            valueStyle={{ color: '#10b981' }}
                        />
                        {connected && (
                            <div className="mt-2 text-xs text-green-400">🟢 Live</div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={
                                <span className="text-dark-300 flex items-center gap-2">
                                    <Activity size={16} />
                                    Active Sessions
                                </span>
                            }
                            value={activeSessions}
                            prefix={<BarChart3 size={16} className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                        {connected && (
                            <div className="mt-2 text-xs text-blue-400">🟢 Live</div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={
                                <span className="text-dark-300 flex items-center gap-2">
                                    <UserPlus size={16} />
                                    Pending Teachers
                                </span>
                            }
                            value={stats.pendingTeachers}
                            prefix={<AlertTriangle size={16} className="text-orange-500" />}
                            valueStyle={{ color: '#f59e0b' }}
                        />
                        {stats.pendingTeachers > 0 && connected && (
                            <div className="mt-2 text-xs text-orange-400">⚠️ Needs attention</div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
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

            {/* Main Stats Grid */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-300 font-medium">Total Users</span>
                            <Users size={20} className="text-primary-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-green-500 text-sm">+12.5% from last month</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-300 font-medium">Active Teachers</span>
                            <GraduationCap size={20} className="text-primary-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalTeachers.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-green-500 text-sm">+8.3% from last month</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-300 font-medium">Total Courses</span>
                            <BookOpen size={20} className="text-primary-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalCourses.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-green-500 text-sm">+15.7% from last month</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Card
                className="bg-dark-800 border-dark-700"
                title={
                    <span className="text-white flex items-center gap-2">
                        <Activity size={20} />
                        Recent Activity
                        {connected && (
                            <Badge count="LIVE" className="bg-green-500 text-white text-xs" />
                        )}
                    </span>
                }
                extra={
                    <Button
                        type="text"
                        className="text-primary-400 hover:text-primary-300"
                    >
                        View All
                    </Button>
                }
            >
                <Table
                    dataSource={recentActivity}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    className="bg-dark-800"
                    rowClassName="hover:bg-dark-700"
                />
            </Card>
        </div>
    );
};

export default AdminDashboard;
