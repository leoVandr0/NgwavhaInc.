import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message, Card, Typography, Space, Tag } from 'antd';
import { FilePdfOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import ResponsiveTable from '../../components/layout/ResponsiveTable';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const TeacherAssignmentsPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchAssignments();
        fetchCourses();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/assignments/instructor');
            setAssignments(response.data);
        } catch (error) {
            message.error('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses/my');
            setCourses(response.data);
        } catch (error) {
            message.error('Failed to fetch courses');
        }
    };

    const handleCreate = async (values) => {
        if (!file) {
            return message.error('Please select a PDF file');
        }

        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('courseId', values.courseId);
        if (values.dueDate) {
            formData.append('dueDate', values.dueDate.toISOString());
        }
        formData.append('file', file);

        try {
            setLoading(true);
            await api.post('/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Assignment posted successfully');
            setIsModalVisible(false);
            form.resetFields();
            setFile(null);
            fetchAssignments();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to post assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this assignment?',
            onOk: async () => {
                try {
                    await api.delete(`/assignments/${id}`);
                    message.success('Assignment deleted');
                    fetchAssignments();
                } catch (error) {
                    message.error('Failed to delete assignment');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            className: 'min-w-[200px]',
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '16px', flexShrink: 0 }} />
                    <span className="font-medium truncate">{text}</span>
                </div>
            )
        },
        {
            title: 'Course',
            dataIndex: ['course', 'title'],
            key: 'course',
            width: 200,
            className: 'min-w-[150px]',
            render: (text) => (
                <span className="truncate block">{text}</span>
            )
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 150,
            className: 'min-w-[120px]',
            render: (date) => (
                <span className="whitespace-nowrap">
                    {date ? dayjs(date).format('MMM D, YYYY') : 'No Due Date'}
                </span>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 180,
            className: 'min-w-[160px]',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href={`${record.fileUrl}`}
                        target="_blank"
                        size="small"
                        className="px-2"
                    >
                        Download
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        size="small"
                        className="px-2"
                    />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <Title level={2}>Assignments</Title>
                    <Text type="secondary">Post and manage PDF assignments for your students.</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    size="large"
                >
                    Post Assignment
                </Button>
            </div>

            <Card bordered={false} className="shadow-sm">
                <ResponsiveTable
                    columns={columns}
                    dataSource={assignments}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="assignments-table"
                />
            </Card>

            <Modal
                title="Post New Assignment"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        name="title"
                        label="Assignment Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="e.g. Week 1 Math Homework" />
                    </Form.Item>

                    <Form.Item
                        name="courseId"
                        label="Select Course"
                        rules={[{ required: true, message: 'Please select a course' }]}
                    >
                        <Select placeholder="Choose a course">
                            {courses.map(course => (
                                <Option key={course.id} value={course.id}>{course.title}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Description (Optional)">
                        <Input.TextArea placeholder="Additional instructions..." rows={3} />
                    </Form.Item>

                    <Form.Item name="dueDate" label="Due Date (Optional)">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Upload PDF" required>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Post Assignment
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherAssignmentsPage;
