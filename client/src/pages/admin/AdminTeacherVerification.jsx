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
    Card,
    Tabs,
    Badge,
    Avatar
} from 'antd';
import {
    CheckCircle,
    XCircle,
    Eye,
    Search,
    ShieldCheck,
    FileText,
    IdCard,
    User,
    Mail
} from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminTeacherVerification = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/teachers');
            setTeachers(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            message.error('Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await api.put(`/admin/teachers/${id}/verify`);
            message.success('Teacher verified successfully');
            fetchTeachers();
        } catch (error) {
            message.error('Failed to verify teacher');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            return message.warning('Please provide a reason for rejection');
        }
        try {
            await api.put(`/admin/teachers/${selectedTeacher.id}/reject-verification`, { reason: rejectionReason });
            message.success('Verification rejected');
            setRejectModalVisible(false);
            setRejectionReason('');
            fetchTeachers();
        } catch (error) {
            message.error('Failed to reject verification');
        }
    };

    const getFilteredData = () => {
        let filtered = teachers;
        if (activeTab === 'pending') {
            filtered = teachers.filter(t => t.verificationStatus === 'pending' || !t.isVerified);
        } else if (activeTab === 'verified') {
            filtered = teachers.filter(t => t.verificationStatus === 'verified' || t.isVerified);
        }

        if (searchText) {
            filtered = filtered.filter(t =>
                t.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                t.email?.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        return filtered;
    };

    const columns = [
        {
            title: 'Teacher',
            key: 'teacher',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar} icon={<User size={16} />} className="border border-dark-700" />
                    <Space direction="vertical" size={0}>
                        <Text strong className="text-white">{record.name}</Text>
                        <Space>
                            <Mail size={12} className="text-dark-400" />
                            <Text type="secondary" size="small">{record.email}</Text>
                        </Space>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Documents',
            key: 'documents',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View National ID">
                        <Button
                            size="small"
                            disabled={!record.nationalIDUrl}
                            icon={<IdCard size={14} />}
                            className="bg-dark-900 border-dark-700 text-white flex items-center"
                            onClick={() => window.open(record.nationalIDUrl, '_blank')}
                        >
                            ID
                        </Button>
                    </Tooltip>
                    <Tooltip title="View Certificates">
                        <Button
                            size="small"
                            disabled={!record.certificatesUrl}
                            icon={<FileText size={14} />}
                            className="bg-dark-900 border-dark-700 text-white flex items-center"
                            onClick={() => window.open(record.certificatesUrl, '_blank')}
                        >
                            Certs
                        </Button>
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'verificationStatus',
            key: 'status',
            render: (status, record) => {
                const isVerified = record.isVerified || status === 'verified';
                return (
                    <Tag color={isVerified ? 'green' : (status === 'rejected' ? 'red' : 'gold')}>
                        {isVerified ? 'VERIFIED' : (status?.toUpperCase() || 'PENDING')}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (activeTab === 'pending' || !record.isVerified) && (
                <Space size="middle">
                    <Tooltip title="Approve Verification">
                        <Button
                            type="text"
                            icon={<CheckCircle size={18} className="text-green-500" />}
                            onClick={() => handleVerify(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Reject Verification">
                        <Button
                            type="text"
                            icon={<XCircle size={18} className="text-red-500" />}
                            onClick={() => {
                                setSelectedTeacher(record);
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
                <Title level={2} className="!text-white !m-0">Teacher Verification</Title>
                <div className="flex gap-4">
                    <Input
                        prefix={<Search size={16} className="text-dark-400" />}
                        placeholder="Search by name or email..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="bg-dark-800 border-dark-700 text-white w-64"
                    />
                </div>
            </div>

            <Card className="bg-dark-800 border-dark-700">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="dark-tabs"
                >
                    <TabPane
                        tab={
                            <Badge count={teachers.filter(t => t.verificationStatus === 'pending' || !t.isVerified).length} offset={[10, 0]} overflowCount={99}>
                                <span className="pr-4">Pending Review</span>
                            </Badge>
                        }
                        key="pending"
                    />
                    <TabPane tab="Verified Teachers" key="verified" />
                </TabPane>

                <Table
                    columns={columns}
                    dataSource={getFilteredData()}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    rowClassName="hover:bg-dark-700/50 transition-colors"
                />
            </Card>

            <Modal
                title={<Title level={4} className="!text-white !m-0">Reject Verification</Title>}
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
                        Please provide a reason for rejecting <Text strong className="text-white">"{selectedTeacher?.name}"</Text>.
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

export default AdminTeacherVerification;
