import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Space, Tag, Empty, message } from 'antd';
import { FilePdfOutlined, DownloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StudentAssignmentsPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/assignments/student');
            setAssignments(response.data);
        } catch (error) {
            message.error('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Assignment',
            key: 'assignment',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                        <Text strong>{record.title}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '28px' }}>
                        {record.description}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Course',
            dataIndex: ['course', 'title'],
            key: 'course',
            render: (text) => <Tag color="orange">{text}</Tag>
        },
        {
            title: 'Instructor',
            dataIndex: ['instructor', 'name'],
            key: 'instructor',
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ color: date && dayjs().isAfter(dayjs(date)) ? '#ff4d4f' : '#64748b' }} />
                    <span style={{ color: date && dayjs().isAfter(dayjs(date)) ? '#ff4d4f' : 'inherit' }}>
                        {date ? dayjs(date).format('MMM D, YYYY') : 'No Due Date'}
                    </span>
                </Space>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${record.fileUrl}`}
                    target="_blank"
                    download
                >
                    Download PDF
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>My Assignments</Title>
                <Text type="secondary">Download assignments posted by your instructors.</Text>
            </div>

            <Card bordered={false} className="shadow-sm">
                {assignments.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={assignments}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                ) : (
                    <Empty
                        description="No assignments found for your enrolled courses."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '40px 0' }}
                    />
                )}
            </Card>
        </div>
    );
};

export default StudentAssignmentsPage;
