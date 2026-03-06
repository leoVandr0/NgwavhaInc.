import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Modal,
    Form,
    message,
    Card,
    Typography,
    Popconfirm
} from 'antd';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Tag as TagIcon,
    Layers
} from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Check if backend has categories, otherwise use mock for UI development
            const response = await api.get('/categories');
            setCategories(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEdit = async (values) => {
        try {
            if (editingCategory) {
                await api.put(`/admin/categories/${editingCategory.id}`, values);
                message.success('Category updated');
            } else {
                await api.post('/admin/categories', values);
                message.success('Category created');
            }
            setModalVisible(false);
            form.resetFields();
            fetchCategories();
        } catch (error) {
            message.error('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/categories/${id}`);
            message.success('Category deleted');
            fetchCategories();
        } catch (error) {
            message.error('Failed to delete category');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Space>
                    <TagIcon size={16} className="text-primary-500" />
                    <Text className="text-white">{text}</Text>
                </Space>
            )
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (text) => <Text className="text-dark-400 font-mono">{text}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<Edit size={16} className="text-blue-500" />}
                        onClick={() => {
                            setEditingCategory(record);
                            form.setFieldsValue(record);
                            setModalVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="Delete category?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" icon={<Trash2 size={16} className="text-red-500" />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!text-white !m-0">Course Categories</Title>
                    <Text className="text-dark-400">Manage the taxonomy of courses on the platform</Text>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => {
                        setEditingCategory(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                    className="flex items-center"
                >
                    Add Category
                </Button>
            </div>

            <Card className="bg-dark-800 border-dark-700">
                <Table
                    columns={columns}
                    dataSource={categories}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                />
            </Card>

            <Modal
                title={<Title level={4} className="!text-white !m-0">{editingCategory ? 'Edit Category' : 'Add Category'}</Title>}
                open={modalVisible}
                onOk={() => form.submit()}
                onCancel={() => setModalVisible(false)}
                className="dark-modal"
                okText={editingCategory ? 'Update' : 'Create'}
                cancelButtonProps={{ className: "bg-dark-800 border-dark-700 text-white" }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddEdit}
                    className="pt-4"
                >
                    <Form.Item
                        name="name"
                        label={<span className="text-dark-200">Category Name</span>}
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input className="bg-dark-900 border-dark-700 text-white" placeholder="e.g. Programming" />
                    </Form.Item>
                    <Form.Item
                        name="slug"
                        label={<span className="text-dark-200">Slug (URL friendly)</span>}
                        rules={[{ required: true, message: 'Please enter slug' }]}
                    >
                        <Input className="bg-dark-900 border-dark-700 text-white" placeholder="e.g. programming" />
                    </Form.Item>
                    <Form.Item
                        name="icon"
                        label={<span className="text-dark-200">Icon Name (Lucide)</span>}
                    >
                        <Input className="bg-dark-900 border-dark-700 text-white" placeholder="e.g. code" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategories;
