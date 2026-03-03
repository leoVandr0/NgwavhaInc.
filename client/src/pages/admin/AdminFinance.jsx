import React, { useState, useEffect } from 'react';
import { Card, Table, Button, DatePicker, Select, Statistic, Row, Col, Tag } from 'antd';
import { 
    DollarSign, 
    TrendingUp, 
    Download, 
    Filter,
    CreditCard,
    ShoppingCart,
    Receipt
} from 'lucide-react';
import api from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminFinance = () => {
    const [transactions, setTransactions] = useState([]);
    const [revenue, setRevenue] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        dailyRevenue: 0,
        totalTransactions: 0,
        pendingPayouts: 0
    });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchFinanceData();
    }, [dateRange, statusFilter]);

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange && dateRange.length === 2) {
                params.startDate = dateRange[0].toISOString();
                params.endDate = dateRange[1].toISOString();
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            
            const [transactionsRes, revenueRes] = await Promise.all([
                api.get('/admin/transactions', { params }),
                api.get('/admin/revenue', { params })
            ]);
            
            setTransactions(transactionsRes.data || []);
            setRevenue(revenueRes.data || {});
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Export functionality
        console.log('Exporting transactions...');
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        return matchesStatus;
    });

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <span className="font-mono text-sm">{id}</span>,
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
            ),
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            render: (course) => course?.title || 'N/A',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span className="font-medium text-green-500">
                    ${amount?.toFixed(2) || '0.00'}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    completed: 'green',
                    pending: 'orange',
                    failed: 'red',
                    refunded: 'blue'
                };
                return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => method || 'N/A',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button size="small" icon={<Receipt size={14} />}>
                    View Details
                </Button>
            ),
        },
    ];

    const mockTransactions = [
        {
            id: 'txn_123456789',
            user: { name: 'John Doe', email: 'john@example.com' },
            course: { title: 'Introduction to React' },
            amount: 99.99,
            status: 'completed',
            payment_method: 'credit_card',
            created_at: '2024-01-15T10:30:00Z'
        },
        {
            id: 'txn_123456790',
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            course: { title: 'Advanced JavaScript' },
            amount: 149.99,
            status: 'completed',
            payment_method: 'paypal',
            created_at: '2024-01-15T11:45:00Z'
        },
        {
            id: 'txn_123456791',
            user: { name: 'Mike Johnson', email: 'mike@example.com' },
            course: { title: 'Node.js Masterclass' },
            amount: 199.99,
            status: 'pending',
            payment_method: 'stripe',
            created_at: '2024-01-15T14:20:00Z'
        },
        {
            id: 'txn_123456792',
            user: { name: 'Sarah Wilson', email: 'sarah@example.com' },
            course: { title: 'CSS Grid & Flexbox' },
            amount: 79.99,
            status: 'completed',
            payment_method: 'credit_card',
            created_at: '2024-01-15T16:10:00Z'
        },
        {
            id: 'txn_123456793',
            user: { name: 'Tom Brown', email: 'tom@example.com' },
            course: { title: 'Python for Beginners' },
            amount: 89.99,
            status: 'refunded',
            payment_method: 'paypal',
            created_at: '2024-01-15T18:30:00Z'
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Finance Dashboard</h1>
                <p className="text-gray-600">Manage revenue, transactions, and financial insights</p>
            </div>

            {/* Revenue Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={revenue.totalRevenue}
                            prefix={<DollarSign className="text-green-500" />}
                            precision={2}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Monthly Revenue"
                            value={revenue.monthlyRevenue}
                            prefix={<TrendingUp className="text-blue-500" />}
                            precision={2}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Weekly Revenue"
                            value={revenue.weeklyRevenue}
                            prefix={<TrendingUp className="text-purple-500" />}
                            precision={2}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Transactions"
                            value={revenue.totalTransactions}
                            prefix={<CreditCard className="text-orange-500" />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Transactions Table */}
            <Card 
                title="Transactions"
                extra={
                    <div className="flex gap-2">
                        <Button 
                            icon={<Download size={16} />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </div>
                }
            >
                <div className="flex gap-4 mb-4">
                    <RangePicker 
                        onChange={setDateRange}
                        placeholder={['Start date', 'End date']}
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                        prefix={<Filter size={16} />}
                    >
                        <Option value="all">All Status</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="failed">Failed</Option>
                        <Option value="refunded">Refunded</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredTransactions.length > 0 ? filteredTransactions : mockTransactions}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} transactions`,
                    }}
                />
            </Card>
        </div>
    );
};

export default AdminFinance;
