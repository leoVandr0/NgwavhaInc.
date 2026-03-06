import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Card,
    Typography,
    Rate,
    message,
    Tooltip,
    Popconfirm,
    Badge
} from 'antd';
import {
    Search,
    Trash2,
    EyeOff,
    Flag,
    CheckCircle,
    User,
    BookOpen
} from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // fetchReviews();
        // Mocking for now since endpoint might vary
        setReviews([
            {
                id: '1',
                userName: 'John Doe',
                courseTitle: 'Introduction to React',
                rating: 4.5,
                comment: 'Great course! Really helpful for beginners.',
                isReported: false,
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                userName: 'Sarah Smith',
                courseTitle: 'Advanced Node.js',
                rating: 2.0,
                comment: 'The audio quality is very poor. Hard to follow.',
                isReported: true,
                reportReason: 'Inappropriate language (Mock)',
                status: 'flagged',
                createdAt: new Date().toISOString()
            }
        ]);
    }, []);

    const handleAction = (id, action) => {
        message.success(`Review ${action} successful`);
        // Actual implementation would call API
    };

    const columns = [
        {
            title: 'Student & Course',
            key: 'review_info',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Space>
                        <User size={14} className="text-primary-500" />
                        <Text strong className="text-white">{record.userName}</Text>
                    </Space>
                    <Space>
                        <BookOpen size={14} className="text-dark-400" />
                        <Text type="secondary" size="small">{record.courseTitle}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Rating & Comment',
            key: 'content',
            width: '40%',
            render: (_, record) => (
                <div className="space-y-1">
                    <Rate disabled defaultValue={record.rating} allowHalf className="text-xs" />
                    <p className="text-dark-200 text-sm italic mb-0">"{record.comment}"</p>
                </div>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Space direction="vertical" size={4}>
                    <Tag color={record.status === 'approved' ? 'green' : (record.status === 'flagged' ? 'red' : 'default')}>
                        {record.status.toUpperCase()}
                    </Tag>
                    {record.isReported && (
                        <Badge status="error" text={<Text type="danger" size="small">Reported</Text>} />
                    )}
                </Space>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Approve">
                        <Button
                            type="text"
                            disabled={record.status === 'approved'}
                            icon={<CheckCircle size={18} className="text-green-500" />}
                            onClick={() => handleAction(record.id, 'approved')}
                        />
                    </Tooltip>
                    <Tooltip title="Hide from Platform">
                        <Button
                            type="text"
                            icon={<EyeOff size={18} className="text-orange-500" />}
                            onClick={() => handleAction(record.id, 'hidden')}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Permanently delete review?"
                        onConfirm={() => handleAction(record.id, 'deleted')}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" icon={<Trash2 size={18} className="text-red-500" />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <Title level={2} className="!text-white !m-0">Reviews Moderation</Title>
                <Text className="text-dark-400">Monitor and moderate course reviews left by students</Text>
            </div>

            <Card className="bg-dark-800 border-dark-700">
                <Table
                    columns={columns}
                    dataSource={reviews}
                    loading={loading}
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default AdminReviews;
