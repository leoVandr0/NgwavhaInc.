import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Space,
    Input,
    Modal,
    message,
    Tooltip,
    Typography,
    Card
} from 'antd';
import {
    CheckCircle,
    XCircle,
    Eye,
    Search,
    Filter,
    BookOpen,
    User
} from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminApprovals = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingCourses();
    }, []);

    const fetchPendingCourses = async () => {
        setLoading(true);
        try {
            // Fetch all courses and filter for pending on frontend or use a specialized endpoint if available
            const response = await api.get('/admin/courses');
            const allCourses = response.data?.data || [];
            setCourses(allCourses.filter(c => c.status === 'pending' || c.status === 'draft'));
        } catch (error) {
            console.error('Error fetching courses:', error);
            message.error('Failed to load pending courses');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/courses/${id}/approve`);
            message.success('Course approved and published');
            fetchPendingCourses();
        } catch (error) {
            message.error('Failed to approve course');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            return message.warning('Please provide a reason for rejection');
        }
        try {
            await api.put(`/admin/courses/${selectedCourse.id}/reject`, { reason: rejectionReason });
            message.success('Course rejected');
            setRejectModalVisible(false);
            setRejectionReason('');
            fetchPendingCourses();
        } catch (error) {
            message.error('Failed to reject course');
        }
    };

    const columns = [
        {
            title: 'Course Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong className="text-white">{text}</Text>
                    <Text type="secondary" size="small">ID: {record.id.substring(0, 8)}...</Text>
                </Space>
            )
        },
        {
            title: 'Instructor',
            dataIndex: 'instructor',
            key: 'instructor',
            render: (instructor) => (
                <Space>
                    <User size={14} className="text-primary-500" />
                    <Text className="text-dark-200">{instructor?.name || 'Unknown'}</Text>
                </Space>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <Text className="text-green-500 font-mono">${parseFloat(price).toFixed(2)}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'approved') color = 'green';
                if (status === 'rejected') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Preview Content">
                        <Button
                            type="text"
                            icon={<Eye size={18} className="text-blue-500" />}
                            onClick={() => window.open(`/course/${record.slug}`, '_blank')}
                        />
                    </Tooltip>
                    <Tooltip title="Approve Course">
                        <Button
                            type="text"
                            icon={<CheckCircle size={18} className="text-green-500" />}
                            onClick={() => handleApprove(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Reject Course">
                        <Button
                            type="text"
                            icon={<XCircle size={18} className="text-red-500" />}
                            onClick={() => {
                                setSelectedCourse(record);
                                setRejectModalVisible(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Title level={2} className="!text-white !m-0">Course Approvals</Title>
                <div className="flex gap-4">
                    <Input
                        prefix={<Search size={16} className="text-dark-400" />}
                        placeholder="Search courses..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="bg-dark-800 border-dark-700 text-white w-64"
                    />
                    <Button
                        icon={<Filter size={16} />}
                        className="bg-dark-800 border-dark-700 text-white"
                    >
                        Filters
                    </Button>
                </div>
            </div>

            <Card className="bg-dark-800 border-dark-700 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={courses.filter(c => c.title.toLowerCase().includes(searchText.toLowerCase()))}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    rowClassName="hover:bg-dark-700/50 transition-colors"
                />
            </Card>

            <Modal
                title={<Title level={4} className="!text-white !m-0">Reject Course</Title>}
                open={rejectModalVisible}
                onOk={handleReject}
                onCancel={() => setRejectModalVisible(false)}
                okText="Submit Rejection"
                okButtonProps={{ danger: true }}
                cancelButtonProps={{ className: "bg-dark-800 border-dark-700 text-white" }}
                className="dark-modal"
            >
                <div className="space-y-4 py-4">
                    <Text className="text-dark-200">
                        Please provide a reason for rejecting <Text strong className="text-white">"{selectedCourse?.title}"</Text>. This will be sent to the instructor.
                    </Text>
                    <TextArea
                        rows={4}
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        className="bg-dark-900 border-dark-700 text-white hover:border-primary-500 focus:border-primary-500"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AdminApprovals;
