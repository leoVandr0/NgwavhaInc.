import React, { useState, useEffect } from 'react';
import { Table, Avatar, Tag, Input, Space, Card, Typography, Statistic, Row, Col } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TeacherStudentsPage = () => {
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enrollments/teacher-students');
            setEnrollments(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
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
                    <Avatar
                        src={record.student?.avatar?.startsWith('http') ? record.student.avatar : `${record.student?.avatar}`}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.student?.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{record.student?.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Course',
            dataIndex: ['course', 'title'],
            key: 'course',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress) => (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#FFA500', borderRadius: '3px' }} />
                    </div>
                </Space>
            ),
        },
        {
            title: 'Enrolled Date',
            dataIndex: 'createdAt',
            key: 'enrolledAt',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.isCompleted ? 'green' : 'blue'}>
                    {record.isCompleted ? 'Completed' : 'In Progress'}
                </Tag>
            ),
        },
    ];

    const filteredEnrollments = enrollments.filter(item =>
        item.student?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.student?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.course?.title?.toLowerCase().includes(searchText.toLowerCase())
    );

    const totalStudents = new Set(enrollments.map(e => e.student?.id)).size;
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.isCompleted).length;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>Students</Title>
                <Text type="secondary">Manage and track students enrolled in your courses.</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Students"
                            value={totalStudents}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#FFA500' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Active Enrollments"
                            value={totalEnrollments}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Completed Courses"
                            value={completedEnrollments}
                            prefix={<Tag color="green" />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} className="shadow-sm">
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Input
                        placeholder="Search by student or course"
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredEnrollments}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default TeacherStudentsPage;
