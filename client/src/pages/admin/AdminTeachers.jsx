import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Modal, message, Input, Select, Space } from 'antd';
import { Eye, Check, X, Search, Filter } from 'lucide-react';
import api from '../../services/api';

const { Search: SearchInput } = Input;
const { Option } = Select;

const AdminTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/teachers');
            setTeachers(response.data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            message.error('Failed to fetch teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (teacherId) => {
        try {
            await api.put(`/admin/teachers/${teacherId}/approve`);
            message.success('Teacher approved successfully');
            fetchTeachers();
        } catch (error) {
            console.error('Error approving teacher:', error);
            message.error('Failed to approve teacher');
        }
    };

    const handleReject = async (teacherId) => {
        try {
            await api.put(`/admin/teachers/${teacherId}/reject`);
            message.success('Teacher rejected successfully');
            fetchTeachers();
        } catch (error) {
            console.error('Error rejecting teacher:', error);
            message.error('Failed to reject teacher');
        }
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'pending' && !teacher.is_approved) ||
                            (statusFilter === 'approved' && teacher.is_approved) ||
                            (statusFilter === 'rejected' && teacher.is_rejected);
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-sm text-gray-500">{record.email}</div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_approved',
            key: 'status',
            render: (isApproved, record) => {
                if (record.is_rejected) {
                    return <Tag color="red">Rejected</Tag>;
                }
                if (isApproved) {
                    return <Tag color="green">Approved</Tag>;
                }
                return <Tag color="orange">Pending</Tag>;
            },
        },
        {
            title: 'Courses',
            dataIndex: 'courses_count',
            key: 'courses_count',
            render: (count) => count || 0,
        },
        {
            title: 'Students',
            dataIndex: 'students_count',
            key: 'students_count',
            render: (count) => count || 0,
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<Eye size={14} />}>
                        View
                    </Button>
                    {!record.is_approved && !record.is_rejected && (
                        <>
                            <Button 
                                size="small" 
                                type="primary" 
                                icon={<Check size={14} />}
                                onClick={() => handleApprove(record.id)}
                            >
                                Approve
                            </Button>
                            <Button 
                                size="small" 
                                danger 
                                icon={<X size={14} />}
                                onClick={() => handleReject(record.id)}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Teachers Management</h1>
                <p className="text-gray-600">Manage teacher applications and accounts</p>
            </div>

            <Card className="mb-6">
                <div className="flex gap-4 mb-4">
                    <SearchInput
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                        prefix={<Search size={16} />}
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                        prefix={<Filter size={16} />}
                    >
                        <Option value="all">All Status</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="approved">Approved</Option>
                        <Option value="rejected">Rejected</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredTeachers}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} teachers`,
                    }}
                />
            </Card>
        </div>
    );
};

export default AdminTeachers;
