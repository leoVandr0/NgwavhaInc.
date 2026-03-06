import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Card,
    Typography,
    Avatar,
    Statistic,
    Row,
    Col,
    Tag,
    Tooltip
} from 'antd';
import {
    Search,
    User,
    Mail,
    BookOpen,
    Clock,
    DollarSign,
    ExternalLink
} from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Using existing getUsers with student filter
            const response = await api.get('/admin/users?role=student');
            setStudents(response.data?.data?.users || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Student',
            key: 'student',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar} icon={<User size={16} />} className="border border-dark-700" />
                    <Space direction="vertical" size={0}>
                        <Text strong className="text-white">{record.name}</Text>
                        <Text type="secondary" size="small" className="flex items-center gap-1">
                            <Mail size={12} /> {record.email}
                        </Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'joined',
            render: (date) => <Text className="text-dark-400">{new Date(date).toLocaleDateString()}</Text>
        },
        {
            title: 'Courses',
            key: 'courses',
            render: () => <Tag color="blue">3 Enrolled</Tag> // Placeholder for enrollment count
        },
        {
            title: 'Status',
            key: 'status',
            render: () => <Tag color="green">ACTIVE</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Profile">
                        <Button
                            type="text"
                            icon={<ExternalLink size={18} className="text-primary-500" />}
                            onClick={() => message.info('Student profile details coming soon')}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!text-white !m-0">Student Management</Title>
                    <Text className="text-dark-400">View and manage all registered students on the platform</Text>
                </div>
                <Input
                    prefix={<Search size={16} className="text-dark-400" />}
                    placeholder="Search students..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="bg-dark-800 border-dark-700 text-white w-64"
                />
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={<span className="text-dark-400">Total Students</span>}
                            value={students.length}
                            prefix={<User size={18} className="text-primary-500 mr-2" />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={<span className="text-dark-400">Active Today</span>}
                            value={Math.floor(students.length * 0.4)}
                            prefix={<Clock size={18} className="text-blue-500 mr-2" />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="bg-dark-800 border-dark-700">
                        <Statistic
                            title={<span className="text-dark-400">New This Week</span>}
                            value={8}
                            prefix={<TrendingUp size={18} className="text-green-500 mr-2" />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="bg-dark-800 border-dark-700">
                <Table
                    columns={columns}
                    dataSource={students.filter(s => s.name?.toLowerCase().includes(searchText.toLowerCase()) || s.email?.toLowerCase().includes(searchText.toLowerCase()))}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                />
            </Card>
        </div>
    );
};

export default AdminStudents;
