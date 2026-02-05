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
import useRealTimeData from '../../hooks/useRealTimeData';

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

    // Use real-time data hook
    const {
        onlineUsers,
        activeSessions,
        recentActivity,
        connected,
        emitAdminEvent
    } = useRealTimeData();

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In real app, fetch from API
                const mockStats = {
                    totalUsers: 1247,
                    activeUsers: 892,
                    totalTeachers: 156,
                    pendingTeachers: 5,
                    totalCourses: 342,
                    activeCourses: 289,
                    totalRevenue: 45678,
                    monthlyRevenue: 12450
                };
                setStats(mockStats);
            } catch (error) {
                console.error('Dashboard data fetch error:', error);
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

            {/* Real-time Stats */}
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
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={
                                <span className="text-dark-300 flex items-center gap-2">
                                    <Clock size={16} />
                                    Pending Approvals
                                </span>
                            }
                            value={stats.pendingTeachers}
                            prefix={<AlertTriangle size={16} className="text-orange-500" />}
                            valueStyle={{ color: '#f59e0b' }}
                        />
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
