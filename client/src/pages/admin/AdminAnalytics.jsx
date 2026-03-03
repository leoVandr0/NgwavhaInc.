import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Table, Progress } from 'antd';
import { 
    Users, 
    BookOpen, 
    DollarSign, 
    TrendingUp, 
    Activity,
    Eye,
    ShoppingCart,
    Star
} from 'lucide-react';
import api from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminAnalytics = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        totalEnrollments: 0,
        activeUsers: 0,
        pendingTeachers: 0,
        publishedCourses: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange && dateRange.length === 2) {
                params.startDate = dateRange[0].toISOString();
                params.endDate = dateRange[1].toISOString();
            }
            
            const response = await api.get('/admin/analytics', { params });
            setStats(response.data || {});
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const topCourses = [
        { title: 'Introduction to React', enrollments: 1250, revenue: 12500, rating: 4.8 },
        { title: 'Advanced JavaScript', enrollments: 980, revenue: 14700, rating: 4.9 },
        { title: 'Node.js Masterclass', enrollments: 750, revenue: 11250, rating: 4.7 },
        { title: 'CSS Grid & Flexbox', enrollments: 620, revenue: 6200, rating: 4.6 },
        { title: 'Python for Beginners', enrollments: 580, revenue: 8700, rating: 4.8 },
    ];

    const recentActivity = [
        { user: 'John Doe', action: 'Enrolled in course', details: 'Introduction to React', time: '2 hours ago' },
        { user: 'Jane Smith', action: 'Completed course', details: 'Advanced JavaScript', time: '3 hours ago' },
        { user: 'Mike Johnson', action: 'Registered as teacher', details: 'Pending approval', time: '5 hours ago' },
        { user: 'Sarah Wilson', action: 'Purchased course', details: 'Node.js Masterclass', time: '6 hours ago' },
        { user: 'Tom Brown', action: 'Left review', details: '5 stars for CSS Grid & Flexbox', time: '8 hours ago' },
    ];

    const courseColumns = [
        {
            title: 'Course',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Enrollments',
            dataIndex: 'enrollments',
            key: 'enrollments',
            render: (count) => <span className="font-medium">{count}</span>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (amount) => <span className="text-green-500">${amount.toLocaleString()}</span>,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    {rating}
                </div>
            ),
        },
    ];

    const activityColumns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Platform performance and insights</p>
            </div>

            {/* Date Filter */}
            <Card className="mb-6">
                <div className="flex items-center gap-4">
                    <RangePicker 
                        onChange={setDateRange}
                        placeholder={['Start date', 'End date']}
                    />
                    <Select defaultValue="all" style={{ width: 150 }}>
                        <Option value="all">All Time</Option>
                        <Option value="today">Today</Option>
                        <Option value="week">This Week</Option>
                        <Option value="month">This Month</Option>
                        <Option value="year">This Year</Option>
                    </Select>
                </div>
            </Card>

            {/* Stats Grid */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<Users className="text-blue-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Courses"
                            value={stats.totalCourses}
                            prefix={<BookOpen className="text-green-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats.totalRevenue}
                            prefix={<DollarSign className="text-yellow-500" />}
                            precision={2}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Enrollments"
                            value={stats.totalEnrollments}
                            prefix={<Activity className="text-purple-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Active Users"
                            value={stats.activeUsers}
                            prefix={<TrendingUp className="text-orange-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Pending Teachers"
                            value={stats.pendingTeachers}
                            prefix={<Users className="text-red-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Published Courses"
                            value={stats.publishedCourses}
                            prefix={<BookOpen className="text-green-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Monthly Revenue"
                            value={stats.monthlyRevenue}
                            prefix={<DollarSign className="text-blue-500" />}
                            precision={2}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Top Courses */}
            <Card title="Top Performing Courses" className="mb-6">
                <Table
                    columns={courseColumns}
                    dataSource={topCourses}
                    pagination={false}
                    size="small"
                />
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Activity">
                <Table
                    columns={activityColumns}
                    dataSource={recentActivity}
                    pagination={false}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default AdminAnalytics;
