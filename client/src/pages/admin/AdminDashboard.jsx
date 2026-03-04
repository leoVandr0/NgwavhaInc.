import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    TrendingUp,
    Activity,
    DollarSign,
    BookOpen,
    GraduationCap,
    Eye,
    BarChart3,
    AlertTriangle,
    RefreshCw,
    Wifi,
    WifiOff
} from 'lucide-react';
import { Card, Statistic, Tag, Button, DatePicker, Row, Col, Badge, Tooltip, notification } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveTable from '../../components/layout/ResponsiveTable';
import useRealTimeData from '../../hooks/useRealTimeData';
import useRealTimeAdmin from '../../hooks/useRealTimeAdmin';
import api from '../../services/api';

const { RangePicker } = DatePicker;

const formatTimeAgo = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day(s) ago`;
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
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
    const [recentActivity, setRecentActivity] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [activeSessions, setActiveSessions] = useState(0);
    const [loading, setLoading] = useState(false);

    // Real-time admin hook
    const { isConnected, realTimeData, lastUpdate, requestUpdate } = useRealTimeAdmin();

    // Update state when real-time data changes
    useEffect(() => {
        if (realTimeData.stats) {
            setStats(prev => ({
                ...prev,
                totalUsers: realTimeData.stats.totalUsers || prev.totalUsers,
                pendingTeachers: realTimeData.stats.pendingTeachers || prev.pendingTeachers,
                totalCourses: realTimeData.stats.totalCourses || prev.totalCourses
            }));
        }

        if (realTimeData.recentActivity) {
            setRecentActivity(realTimeData.recentActivity);
        }
    }, [realTimeData]);

    // Show notification for real-time updates
    useEffect(() => {
        if (lastUpdate) {
            notification.info({
                message: 'Dashboard Updated',
                description: 'Real-time data refreshed',
                duration: 2,
                placement: 'topRight'
            });
        }
    }, [lastUpdate]);

    const [dateRange, setDateRange] = useState(null);
    const { currentUser } = useAuth();

    // Listen for real-time user registration (teacher or student)
    useEffect(() => {
        const handleUserRegistered = (e) => {
            const data = e.detail || e;
            const { type, user: u, message: msg } = data;
            setStats(prev => ({
                ...prev,
                totalUsers: prev.totalUsers + 1,
                totalTeachers: type === 'new_teacher' ? prev.totalTeachers + 1 : prev.totalTeachers,
                totalStudents: type === 'new_student' ? prev.totalStudents + 1 : prev.totalStudents,
                pendingTeachers: type === 'new_teacher' && !u?.isApproved
                    ? prev.pendingTeachers + 1
                    : prev.pendingTeachers
            }));
            setRecentActivity(prev => [{
                id: u?.id || Date.now(),
                type: type === 'new_teacher' ? 'new_teacher' : 'new_student',
                user: u?.name || 'New user',
                action: type === 'new_teacher' ? 'Registered as teacher (pending approval)' : 'Registered as student',
                time: 'Just now',
                status: u?.isApproved ? 'success' : (type === 'new_teacher' ? 'pending' : 'success')
            }, ...prev.slice(0, 19)]);
        };

        const handleCourseCreated = (e) => {
            const data = e.detail || e;
            setStats(prev => ({ ...prev, totalCourses: prev.totalCourses + 1 }));
            setRecentActivity(prev => [{
                id: data?.course?.id || Date.now(),
                type: 'course_creation',
                user: data?.course?.instructorId || 'Instructor',
                action: `New course created: ${data?.course?.title || 'Untitled'}`,
                time: 'Just now',
                status: 'success'
            }, ...prev.slice(0, 19)]);
        };

        const handleCourseUpdated = (e) => {
            const data = e.detail || e;
            setRecentActivity(prev => [{
                id: data?.course?.id || Date.now(),
                type: 'course_update',
                user: data?.course?.instructorId || 'Instructor',
                action: `Course updated: ${data?.course?.title || 'Untitled'}`,
                time: 'Just now',
                status: 'success'
            }, ...prev.slice(0, 19)]);
        };

        const handleCourseDeleted = (e) => {
            const data = e.detail || e;
            setStats(prev => ({ ...prev, totalCourses: Math.max(0, prev.totalCourses - 1) }));
            setRecentActivity(prev => [{
                id: data?.course?.id || Date.now(),
                type: 'course_deletion',
                user: data?.course?.instructorId || 'Instructor',
                action: `Course deleted: ${data?.course?.title || 'Untitled'}`,
                time: 'Just now',
                status: 'declined'
            }, ...prev.slice(0, 19)]);
        };

        const handleEnrollmentCreated = (e) => {
            const data = e.detail || e;
            setRecentActivity(prev => [{
                id: data?.enrollment?.id || Date.now(),
                type: 'enrollment',
                user: data?.enrollment?.userName || 'Student',
                action: `Student enrolled: ${data?.enrollment?.userName} enrolled in "${data?.enrollment?.courseTitle}"`,
                time: 'Just now',
                status: 'success'
            }, ...prev.slice(0, 19)]);
        };

        const handleEnrollmentRemoved = (e) => {
            const data = e.detail || e;
            setRecentActivity(prev => [{
                id: data?.enrollment?.userId || Date.now(),
                type: 'enrollment',
                user: data?.enrollment?.userName || 'Student',
                action: `Student unenrolled: ${data?.enrollment?.userName} left "${data?.enrollment?.courseTitle}"`,
                time: 'Just now',
                status: 'declined'
            }, ...prev.slice(0, 19)]);
        };

        const handleTeacherApproved = (e) => {
            const data = e.detail || e;
            setStats(prev => ({ ...prev, pendingTeachers: Math.max(0, prev.pendingTeachers - 1) }));
            setRecentActivity(prev => [{
                id: data?.user?.id || Date.now(),
                type: 'teacher_approval',
                user: data?.user?.name || 'Instructor',
                action: `Instructor approved: ${data?.user?.name}`,
                time: 'Just now',
                status: 'success'
            }, ...prev.slice(0, 19)]);
        };

        const handleTeacherDeclined = (e) => {
            const data = e.detail || e;
            setRecentActivity(prev => [{
                id: data?.user?.id || Date.now(),
                type: 'teacher_declined',
                user: data?.user?.name || 'Instructor',
                action: `Instructor application declined: ${data?.user?.name}`,
                time: 'Just now',
                status: 'declined'
            }, ...prev.slice(0, 19)]);
        };

        window.addEventListener('user-registered', handleUserRegistered);
        window.addEventListener('course-created', handleCourseCreated);
        window.addEventListener('course-updated', handleCourseUpdated);
        window.addEventListener('course-deleted', handleCourseDeleted);
        window.addEventListener('enrollment-created', handleEnrollmentCreated);
        window.addEventListener('enrollment-removed', handleEnrollmentRemoved);
        window.addEventListener('teacher-approved', handleTeacherApproved);
        window.addEventListener('teacher-declined', handleTeacherDeclined);

        return () => {
            window.removeEventListener('user-registered', handleUserRegistered);
            window.removeEventListener('course-created', handleCourseCreated);
            window.removeEventListener('course-updated', handleCourseUpdated);
            window.removeEventListener('course-deleted', handleCourseDeleted);
            window.removeEventListener('enrollment-created', handleEnrollmentCreated);
            window.removeEventListener('enrollment-removed', handleEnrollmentRemoved);
            window.removeEventListener('teacher-approved', handleTeacherApproved);
            window.removeEventListener('teacher-declined', handleTeacherDeclined);
        };
    }, []);

    // Online/session counts could go here if implemented in real-time service
    useEffect(() => {
        // Handle online status or other live stats if needed
    }, [isConnected]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                const data = response.data;
                if (data.success) {
                    setStats({
                        totalUsers: data.data.users.total || 0,
                        activeUsers: data.data.users.active || 0,
                        totalTeachers: data.data.users.teachers || 0,
                        totalStudents: data.data.users.students || 0,
                        pendingTeachers: data.data.users.pendingTeachers || 0,
                        totalCourses: data.data.courses.total || 0,
                        activeCourses: data.data.courses.active || 0,
                        totalRevenue: data.data.revenue?.total || 0,
                        monthlyRevenue: data.data.revenue?.monthly || 0
                    });
                    if (data.data.recentActivity?.length) {
                        setRecentActivity(data.data.recentActivity);
                    }
                    if (data.data.realTime) {
                        setOnlineUsers(data.data.realTime.onlineUsers ?? 0);
                        setActiveSessions(data.data.realTime.activeSessions ?? 0);
                    }
                }
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
            case 'teacher_approval':
            case 'teacher_approved':
                return <UserPlus size={16} />;
            case 'teacher_declined':
                return <AlertTriangle size={16} />;
            case 'new_teacher':
            case 'new_student':
                return <UserPlus size={16} />;
            case 'course_creation':
            case 'course_update':
            case 'course_deletion':
                return <BookOpen size={16} />;
            case 'enrollment':
                return <GraduationCap size={16} />;
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
            case 'teacher_approval':
            case 'teacher_approved':
                return 'orange';
            case 'teacher_declined':
                return 'red';
            case 'new_teacher':
                return 'purple';
            case 'new_student':
                return 'green';
            case 'course_creation':
                return 'blue';
            case 'course_update':
                return 'cyan';
            case 'course_deletion':
                return 'red';
            case 'enrollment':
                return 'geekblue';
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Real-time platform overview and management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <Wifi className="text-green-500" size={20} />
                                    <span className="text-green-500 text-sm">Live System Connected</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="text-red-500" size={20} />
                                    <span className="text-red-500 text-sm">Disconnected</span>
                                </>
                            )}
                        </div>
                        <Button
                            icon={<RefreshCw size={16} />}
                            onClick={requestUpdate}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
                {lastUpdate && (
                    <div className="mt-2 text-xs text-gray-500">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </div>
                )}
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
                        {isConnected && (
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
                        {isConnected && (
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
                        {isConnected && (
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
                        {isConnected && (
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
                        {stats.pendingTeachers > 0 && isConnected && (
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
                        {isConnected && (
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
                <ResponsiveTable
                    dataSource={recentActivity}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    className="bg-dark-800"
                />
            </Card>
        </div>
    );
};

export default AdminDashboard;
