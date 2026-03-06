import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Select,
    DatePicker,
    Space,
    Spin
} from 'antd';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    BookOpen,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar
} from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/dashboard');
            // Mocking trend data for the charts since the backend might not have it yet
            const mockTrendData = [
                { name: 'Mon', revenue: 4000, students: 2400 },
                { name: 'Tue', revenue: 3000, students: 1398 },
                { name: 'Wed', revenue: 2000, students: 9800 },
                { name: 'Thu', revenue: 2780, students: 3908 },
                { name: 'Fri', revenue: 1890, students: 4800 },
                { name: 'Sat', revenue: 2390, students: 3800 },
                { name: 'Sun', revenue: 3490, students: 4300 },
            ];

            const platformStats = response.data?.data || {};
            setData({
                ...platformStats,
                trendData: mockTrendData,
                courseData: [
                    { name: 'Programming', value: 400 },
                    { name: 'Design', value: 300 },
                    { name: 'Marketing', value: 300 },
                    { name: 'Business', value: 200 },
                ]
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!text-white !m-0">Platform Analytics</Title>
                    <Text className="text-dark-400">Comprehensive overview of Ngwavha platform performance</Text>
                </div>
                <Space>
                    <Select
                        defaultValue="30d"
                        onChange={value => setTimeRange(value)}
                        className="dark-select w-32"
                    >
                        <Select.Option value="7d">Last 7 Days</Select.Option>
                        <Select.Option value="30d">Last 30 Days</Select.Option>
                        <Select.Option value="90d">Last 90 Days</Select.Option>
                    </Select>
                </Space>
            </div>

            {/* Top Level Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Space direction="vertical" className="w-full">
                            <div className="flex justify-between">
                                <Text className="text-dark-400 text-sm">Total Revenue</Text>
                                <DollarSign size={16} className="text-primary-500" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <Title level={3} className="!text-white !m-0">${data?.revenue?.total?.toLocaleString() || '0'}</Title>
                                <Text className="text-green-500 text-xs flex items-center">
                                    <ArrowUpRight size={12} /> 12.5%
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Space direction="vertical" className="w-full">
                            <div className="flex justify-between">
                                <Text className="text-dark-400 text-sm">Active Students</Text>
                                <Users size={16} className="text-blue-500" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <Title level={3} className="!text-white !m-0">{data?.users?.students?.toLocaleString() || '0'}</Title>
                                <Text className="text-green-500 text-xs flex items-center">
                                    <ArrowUpRight size={12} /> 8.2%
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Space direction="vertical" className="w-full">
                            <div className="flex justify-between">
                                <Text className="text-dark-400 text-sm">Courses Published</Text>
                                <BookOpen size={16} className="text-emerald-500" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <Title level={3} className="!text-white !m-0">{data?.courses?.total || '0'}</Title>
                                <Text className="text-green-500 text-xs flex items-center">
                                    <ArrowUpRight size={12} /> 3.1%
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Space direction="vertical" className="w-full">
                            <div className="flex justify-between">
                                <Text className="text-dark-400 text-sm">Monthly Growth</Text>
                                <TrendingUp size={16} className="text-purple-500" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <Title level={3} className="!text-white !m-0">24%</Title>
                                <Text className="text-green-500 text-xs flex items-center">
                                    <ArrowUpRight size={12} /> 2.4%
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<span className="text-white">Revenue Trend</span>}
                        className="bg-dark-800 border-dark-700 h-[400px]"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data?.trendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f97316"
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card
                        title={<span className="text-white">Courses by Category</span>}
                        className="bg-dark-800 border-dark-700 h-[400px]"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data?.courseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data?.courseData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                            {data?.courseData?.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-dark-400">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Bottom Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title={<span className="text-white">Daily Signups</span>} className="bg-dark-800 border-dark-700">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data?.trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title={<span className="text-white">Recent Activity Performance</span>} className="bg-dark-800 border-dark-700">
                        <div className="space-y-4">
                            {data?.recentActivity?.slice(0, 5).map(activity => (
                                <div key={activity.id} className="flex justify-between items-center border-b border-dark-700 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar size="small" icon={<User size={12} />} />
                                        <div>
                                            <p className="text-white text-sm font-medium mb-0">{activity.user}</p>
                                            <p className="text-dark-400 text-xs mb-0">{activity.action}</p>
                                        </div>
                                    </div>
                                    <Text type="secondary" size="small" className="text-xs">
                                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminAnalytics;
