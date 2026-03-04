import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Modal, message, Input, Select, Space, Badge } from 'antd';
import { Eye, Edit, Trash2, Search, Filter, BookOpen, DollarSign } from 'lucide-react';
import api from '../../services/api';

const { Search: SearchInput } = Input;
const { Option } = Select;

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/courses');
            const courseData = response.data?.data || response.data;
            setCourses(Array.isArray(courseData) ? courseData : []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            message.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        Modal.confirm({
            title: 'Delete Course',
            content: 'Are you sure you want to delete this course? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await api.delete(`/admin/courses/${courseId}`);
                    message.success('Course deleted successfully');
                    fetchCourses();
                } catch (error) {
                    console.error('Error deleting course:', error);
                    message.error('Failed to delete course');
                }
            },
        });
    };

    const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'Course',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    {record.thumbnail && (
                        <img
                            src={record.thumbnail}
                            alt={text}
                            className="w-12 h-12 rounded object-cover"
                        />
                    )}
                    <div>
                        <div className="font-medium">{text}</div>
                        <div className="text-sm text-gray-500">by {record.instructor?.name}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    draft: 'default',
                    published: 'green',
                    archived: 'red'
                };
                return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    ${price || 0}
                </div>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'enrollments_count',
            key: 'enrollments_count',
            render: (count) => (
                <Badge count={count || 0} showZero color="blue" />
            ),
        },
        {
            title: 'Rating',
            dataIndex: 'average_rating',
            key: 'average_rating',
            render: (rating) => (
                <div className="flex items-center gap-1">
                    <span>⭐</span>
                    {rating?.toFixed(1) || '0.0'}
                </div>
            ),
        },
        {
            title: 'Created',
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
                    <Button size="small" icon={<Edit size={14} />}>
                        Edit
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const stats = {
        total: courses.length,
        published: courses.filter(c => c.status === 'published').length,
        draft: courses.filter(c => c.status === 'draft').length,
        archived: courses.filter(c => c.status === 'archived').length,
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Courses Management</h1>
                <p className="text-gray-600">Manage all courses on the platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Total Courses</div>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </div>
                        <BookOpen className="text-blue-500" size={24} />
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Published</div>
                            <div className="text-2xl font-bold text-green-500">{stats.published}</div>
                        </div>
                        <Badge count={stats.published} color="green" />
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Draft</div>
                            <div className="text-2xl font-bold text-orange-500">{stats.draft}</div>
                        </div>
                        <Badge count={stats.draft} color="orange" />
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Archived</div>
                            <div className="text-2xl font-bold text-red-500">{stats.archived}</div>
                        </div>
                        <Badge count={stats.archived} color="red" />
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex gap-4 mb-4">
                    <SearchInput
                        placeholder="Search courses..."
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
                        <Option value="draft">Draft</Option>
                        <Option value="published">Published</Option>
                        <Option value="archived">Archived</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredCourses}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} courses`,
                    }}
                />
            </Card>
        </div>
    );
};

export default AdminCourses;
