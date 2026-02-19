import React, { useState, useEffect } from 'react';
import {
    Search,
    UserPlus,
    UserCheck,
    UserX,
    Shield,
    Eye,
    Trash2,
    ChevronDown,
    Download,
    Upload
} from 'lucide-react';
import {
    Table,
    Card,
    Button,
    Input,
    Select,
    Tag,
    Avatar,
    Modal,
    message,
    Space,
    Tooltip,
    Dropdown,
    Badge
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const { Option } = Select;

// Map API user to table row (role: instructor -> teacher for display)
const mapUserToRow = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === 'instructor' ? 'teacher' : u.role,
    status: u.role === 'instructor'
        ? (u.isApproved ? 'approved' : 'pending')
        : 'active',
    avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
    joinDate: u.createdAt ? format(new Date(u.createdAt), 'yyyy-MM-dd') : '-',
    lastLogin: u.lastLogin ? format(new Date(u.lastLogin), 'yyyy-MM-dd') : '-',
    courses: u.courses ?? 0,
    students: u.students ?? 0,
    revenue: u.revenue ?? 0,
    bio: u.bio,
    skills: typeof u.skills === 'string' ? (u.skills || '').split(',').map(s => s.trim()).filter(Boolean) : (u.skills || []),
    certifications: typeof u.certifications === 'string' ? (u.certifications || '').split(',').map(s => s.trim()).filter(Boolean) : (u.certifications || []),
    isVerified: !!u.isVerified,
    isApproved: !!u.isApproved
});

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userType, setUserType] = useState('all');
    const [status, setStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const { currentUser } = useAuth();

    const fetchUsers = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pageSize,
                search: searchTerm || undefined,
                role: userType !== 'all' ? (userType === 'teacher' ? 'instructor' : userType) : undefined,
                status: status !== 'all' ? status : undefined
            };
            const response = await api.get('/admin/users', { params });
            const data = response.data;
            if (data.success && data.data?.users) {
                const rows = data.data.users.map(mapUserToRow);
                setUsers(rows);
                setPagination(prev => ({
                    ...prev,
                    current: data.data.pagination?.current ?? page,
                    pageSize: data.data.pagination?.pageSize ?? pageSize,
                    total: data.data.pagination?.total ?? 0
                }));
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize);
    }, [searchTerm, userType, status]);

    // Real-time: when a new user registers, prepend to list and bump total
    useEffect(() => {
        const handleUserRegistered = (e) => {
            const data = e.detail || e;
            const u = data.user;
            if (!u?.id) return;
            const row = mapUserToRow({
                ...u,
                createdAt: u.createdAt || new Date().toISOString(),
                role: data.type === 'new_teacher' ? 'instructor' : 'student'
            });
            setUsers(prev => {
                if (prev.some(uu => uu.id === row.id)) return prev;
                return [row, ...prev];
            });
            setPagination(prev => ({ ...prev, total: (prev.total || 0) + 1 }));
            message.success(`${row.name} just registered as ${row.role}`);
        };

        const handleTeacherApproved = (e) => {
            const data = e.detail || e;
            const u = data.user;
            if (!u?.id) return;
            setUsers(prev => prev.map(user =>
                user.id === u.id ? { ...user, status: 'approved', isApproved: true, isVerified: true } : user
            ));
            message.success(`Instructor ${u.name} has been approved`);
        };

        const handleTeacherDeclined = (e) => {
            const data = e.detail || e;
            const u = data.user;
            if (!u?.id) return;
            setUsers(prev => prev.map(user =>
                user.id === u.id ? { ...user, status: 'declined', isApproved: false } : user
            ));
            message.warning(`Instructor application for ${u.name} has been declined`);
        };

        window.addEventListener('user-registered', handleUserRegistered);
        window.addEventListener('teacher-approved', handleTeacherApproved);
        window.addEventListener('teacher-declined', handleTeacherDeclined);
        
        return () => {
            window.removeEventListener('user-registered', handleUserRegistered);
            window.removeEventListener('teacher-approved', handleTeacherApproved);
            window.removeEventListener('teacher-declined', handleTeacherDeclined);
        };
    }, []);

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = userType === 'all' || user.role === userType;
        const matchesStatus = status === 'all' || user.status === status;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleApproveTeacher = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/approve`);
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, status: 'approved', isVerified: true, isApproved: true } : user
            ));
            message.success('Teacher approved successfully');
            setActionModal(null);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to approve teacher');
        }
    };

    const handleDeclineTeacher = async (userId, reason) => {
        try {
            await api.put(`/admin/users/${userId}/decline`, { reason });
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, status: 'declined' } : user
            ));
            message.success('Teacher declined');
            setActionModal(null);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to decline teacher');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser?.id) {
            message.error('You cannot delete your own account');
            return;
        }
        Modal.confirm({
            title: 'Delete User',
            content: 'Are you sure you want to delete this user? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await api.delete(`/admin/users/${userId}`);
                    setUsers(prev => prev.filter(user => user.id !== userId));
                    setPagination(prev => ({ ...prev, total: Math.max(0, (prev.total || 1) - 1) }));
                    message.success('User deleted successfully');
                } catch (error) {
                    message.error(error.response?.data?.message || 'Failed to delete user');
                }
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'pending': return 'orange';
            case 'declined': return 'red';
            case 'active': return 'blue';
            default: return 'gray';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'teacher': return 'purple';
            case 'student': return 'blue';
            case 'admin': return 'red';
            default: return 'gray';
        }
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar src={record.avatar} className="bg-primary-500">
                        {record.name.charAt(0)}
                    </Avatar>
                    <div>
                        <div className="font-medium text-white">{record.name}</div>
                        <div className="text-sm text-dark-400">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Join Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            render: (date) => <span className="text-dark-300">{date}</span>
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (date) => <span className="text-dark-300">{date}</span>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<Eye size={16} />}
                            className="text-dark-400 hover:text-white"
                            onClick={() => setSelectedUser(record)}
                        />
                    </Tooltip>
                    
                    {record.role === 'teacher' && record.status === 'pending' && (
                        <>
                            <Tooltip title="Approve Teacher">
                                <Button
                                    type="text"
                                    icon={<UserCheck size={16} />}
                                    className="text-green-500 hover:text-green-400"
                                    onClick={() => setActionModal({ type: 'approve', user: record })}
                                />
                            </Tooltip>
                            <Tooltip title="Decline Teacher">
                                <Button
                                    type="text"
                                    icon={<UserX size={16} />}
                                    className="text-red-500 hover:text-red-400"
                                    onClick={() => setActionModal({ type: 'decline', user: record })}
                                />
                            </Tooltip>
                        </>
                    )}
                    
                    <Tooltip title="Delete User">
                        <Button
                            type="text"
                            icon={<Trash2 size={16} />}
                            className="text-red-500 hover:text-red-400"
                            onClick={() => handleDeleteUser(record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const actionMenuItems = [
        {
            key: 'export',
            label: 'Export Users',
            icon: <Download size={16} />
        },
        {
            key: 'import',
            label: 'Import Users',
            icon: <Upload size={16} />
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-dark-900 to-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
                        <p className="text-dark-400">
                            Manage students and teachers, approve applications, and monitor platform activity.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Dropdown
                            menu={{ items: actionMenuItems }}
                            trigger={['click']}
                        >
                            <Button className="bg-dark-800 border-dark-600 text-white">
                                Actions <ChevronDown size={16} className="ml-2" />
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-dark-800 border-dark-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        <Search size={20} className="text-dark-400" />
                        <Input.Search
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-dark-700 border-dark-600"
                            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                        />
                    </div>
                    
                    <Select
                        value={userType}
                        onChange={setUserType}
                        className="w-full"
                        style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                    >
                        <Option value="all">All Users</Option>
                        <Option value="teacher">Teachers</Option>
                        <Option value="student">Students</Option>
                    </Select>
                    
                    <Select
                        value={status}
                        onChange={setStatus}
                        className="w-full"
                        style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                    >
                        <Option value="all">All Status</Option>
                        <Option value="active">Active</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="approved">Approved</Option>
                        <Option value="declined">Declined</Option>
                    </Select>

                    <div className="text-sm text-dark-400">
                        {filteredUsers.length} of {users.length} users
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="bg-dark-800 border-dark-700">
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
                    }}
                    onChange={(newPagination) => {
                        fetchUsers(newPagination.current, newPagination.pageSize);
                    }}
                    rowKey="id"
                    className="bg-dark-800"
                    rowClassName="hover:bg-dark-700"
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* User Details Modal */}
            <Modal
                title="User Details"
                open={!!selectedUser}
                onCancel={() => setSelectedUser(null)}
                footer={null}
                className="bg-dark-800"
                width={800}
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar size={64} src={selectedUser.avatar} className="bg-primary-500">
                                {selectedUser.name.charAt(0)}
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                                <p className="text-dark-400">{selectedUser.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <Tag color={getRoleColor(selectedUser.role)}>
                                        {selectedUser.role.toUpperCase()}
                                    </Tag>
                                    <Tag color={getStatusColor(selectedUser.status)}>
                                        {selectedUser.status.toUpperCase()}
                                    </Tag>
                                    {selectedUser.isVerified && (
                                        <Tag color="green" icon={<Shield size={14} />}>
                                            VERIFIED
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {selectedUser.bio && (
                            <div>
                                <h4 className="text-white font-medium mb-2">Bio</h4>
                                <p className="text-dark-300">{selectedUser.bio}</p>
                            </div>
                        )}
                        
                        {selectedUser.skills && selectedUser.skills.length > 0 && (
                            <div>
                                <h4 className="text-white font-medium mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.skills.map((skill, index) => (
                                        <Tag key={index} color="blue">{skill}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedUser.certifications && selectedUser.certifications.length > 0 && (
                            <div>
                                <h4 className="text-white font-medium mb-2">Certifications</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.certifications.map((cert, index) => (
                                        <Tag key={index} color="green">{cert}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h4 className="text-white font-medium mb-2">Join Date</h4>
                                <p className="text-dark-300">{selectedUser.joinDate}</p>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">Last Login</h4>
                                <p className="text-dark-300">{selectedUser.lastLogin}</p>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-2">Courses</h4>
                                <p className="text-dark-300">{selectedUser.courses || 0}</p>
                            </div>
                        </div>
                        
                        {selectedUser.role === 'teacher' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-white font-medium mb-2">Students</h4>
                                    <p className="text-dark-300">{selectedUser.students || 0}</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-2">Revenue</h4>
                                    <p className="text-dark-300">${selectedUser.revenue || 0}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Action Modal */}
            <Modal
                title={
                    actionModal?.type === 'approve' 
                        ? 'Approve Teacher Application'
                        : 'Decline Teacher Application'
                }
                open={!!actionModal}
                onCancel={() => setActionModal(null)}
                footer={[
                    <Button key="cancel" onClick={() => setActionModal(null)}>
                        Cancel
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        className={actionModal?.type === 'approve' ? 'bg-green-500' : 'bg-red-500'}
                        onClick={() => {
                            if (actionModal?.type === 'approve') {
                                handleApproveTeacher(actionModal.user.id);
                            } else {
                                handleDeclineTeacher(actionModal.user.id);
                            }
                        }}
                    >
                        {actionModal?.type === 'approve' ? 'Approve' : 'Decline'}
                    </Button>
                ]}
            >
                {actionModal && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar size={48} src={actionModal.user.avatar} className="bg-primary-500">
                                {actionModal.user.name.charAt(0)}
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-bold text-white">{actionModal.user.name}</h3>
                                <p className="text-dark-400">{actionModal.user.email}</p>
                            </div>
                        </div>
                        
                        {actionModal.user.bio && (
                            <div>
                                <h4 className="text-white font-medium mb-2">Application Bio</h4>
                                <p className="text-dark-300">{actionModal.user.bio}</p>
                            </div>
                        )}
                        
                        <div className="text-sm text-dark-400">
                            {actionModal.type === 'approve' 
                                ? 'This will approve the teacher to publish courses and teach on the platform.'
                                : 'This will decline the teacher application. The user will be notified.'
                            }
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsers;
