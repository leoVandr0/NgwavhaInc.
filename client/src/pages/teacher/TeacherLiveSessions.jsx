import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Video,
    Plus,
    Calendar,
    Clock,
    Trash2,
    Play,
    AlertCircle,
    ChevronRight,
    Search,
    ExternalLink
} from 'lucide-react';
import {
    App,
    Button,
    Card,
    Typography,
    Modal,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Select,
    Tag,
    Empty,
    Spin,
    Divider,
    Space,
    Table
} from 'antd';
import dayjs from 'dayjs';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TeacherLiveSessions = () => {
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);
    const [form] = Form.useForm();
    const queryParams = new URLSearchParams(location.search);

    // Fetch Instructor Sessions
    const { data: sessions, isLoading: sessionsLoading } = useQuery('instructor-sessions', async () => {
        const { data } = await api.get('/live-sessions/instructor');
        return data;
    });

    // Fetch Instructor Courses (for the select dropdown)
    const { data: courses } = useQuery('instructor-courses', async () => {
        const { data } = await api.get('/courses/my');
        return data;
    });

    // Fetch Content for the selected course in modal
    const { data: courseContent } = useQuery(['course-curriculum', selectedCourseForModal], async () => {
        if (!selectedCourseForModal) return null;
        const { data } = await api.get(`/courses/${selectedCourseForModal}/content`);
        return data;
    }, { enabled: !!selectedCourseForModal });

    useEffect(() => {
        const courseId = queryParams.get('courseId');
        const lectureId = queryParams.get('lectureId');
        const lectureTitle = queryParams.get('lectureTitle');

        if (courseId && lectureId) {
            setSelectedCourseForModal(courseId);
            setIsModalOpen(true);
            form.setFieldsValue({
                courseId: isNaN(courseId) ? courseId : parseInt(courseId),
                lectureId,
                title: lectureTitle || ''
            });
        }
    }, [location.search]);

    // Mutations
    const scheduleMutation = useMutation(async (values) => {
        const { data } = await api.post('/live-sessions', values);
        return data;
    }, {
        onSuccess: () => {
            message.success('Live lesson scheduled successfully!');
            setIsModalOpen(false);
            form.resetFields();
            queryClient.invalidateQueries('instructor-sessions');
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Failed to schedule session');
        }
    });

    const statusMutation = useMutation(async ({ id, status }) => {
        const { data } = await api.patch(`/live-sessions/${id}/status`, { status });
        return data;
    }, {
        onSuccess: () => queryClient.invalidateQueries('instructor-sessions')
    });

    const deleteMutation = useMutation(async (id) => {
        await api.delete(`/live-sessions/${id}`);
    }, {
        onSuccess: () => {
            message.success('Session deleted');
            queryClient.invalidateQueries('instructor-sessions');
        }
    });

    const handleSchedule = (values) => {
        scheduleMutation.mutate({
            ...values,
            startTime: values.startTime.toISOString()
        });
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: 'Delete Session?',
            content: 'Are you sure you want to cancel this live lesson?',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => deleteMutation.mutate(id)
        });
    };

    const handleStartSession = (session) => {
        statusMutation.mutate({ id: session.id, status: 'live' });
        navigate(`/teacher/live-room/${session.meetingId}?title=${encodeURIComponent(session.title)}`);
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'scheduled': return <Tag color="blue">Scheduled</Tag>;
            case 'live': return <Tag color="orange" className="animate-pulse">Live Now</Tag>;
            case 'ended': return <Tag color="default">Ended</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Topic',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="flex flex-col">
                    <Text strong className="text-white text-base">{text}</Text>
                    <Text className="text-dark-500 text-xs">{record.course?.title}</Text>
                </div>
            )
        },
        {
            title: 'Date & Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (time) => (
                <div className="flex flex-col">
                    <Text className="text-dark-300">{dayjs(time).format('MMM D, YYYY')}</Text>
                    <Text className="text-dark-500 text-xs">{dayjs(time).format('h:mm A')}</Text>
                </div>
            )
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (val) => <Text className="text-dark-400">{val} mins</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        size="small"
                        icon={<Play className="h-3 w-3" />}
                        onClick={() => handleStartSession(record)}
                        className={record.status === 'live' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                        {record.status === 'live' ? 'Join Again' : 'Start Lesson'}
                    </Button>
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-white min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20">
                        <Video className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: 'white' }}>Live Lessons</Title>
                        <Text className="text-dark-400">Host real-time interactive classes with your students.</Text>
                    </div>
                </div>

                <Button
                    type="primary"
                    size="large"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setIsModalOpen(true)}
                    className="h-12 px-8"
                >
                    Schedule Live Lesson
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-12">
                    {sessionsLoading ? (
                        <div className="flex justify-center py-20">
                            <Spin size="large" tip="Loading sessions..." />
                        </div>
                    ) : sessions?.length === 0 ? (
                        <Card className="bg-dark-900 border-dark-800 rounded-2xl text-center py-20 border-dashed border-2">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div className="space-y-4">
                                        <Text className="text-dark-400 text-lg block">No live lessons scheduled yet.</Text>
                                        <Button
                                            type="primary"
                                            ghost
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            Schedule your first session
                                        </Button>
                                    </div>
                                }
                            />
                        </Card>
                    ) : (
                        <Card className="bg-dark-900 border-dark-800 rounded-2xl overflow-hidden p-0">
                            <Table
                                columns={columns}
                                dataSource={sessions}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                className="custom-table"
                            />
                        </Card>
                    )}
                </div>
            </div>

            {/* Schedule Modal */}
            <Modal
                title={<span className="text-white text-xl font-bold">Schedule New Live Lesson</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={scheduleMutation.isLoading}
                okText="Schedule Session"
                cancelText="Cancel"
                width={600}
                centered
                className="dark-modal"
            >
                <Divider className="my-4 border-dark-800" />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSchedule}
                    initialValues={{ duration: 60 }}
                >
                    <Form.Item
                        name="courseId"
                        label={<span className="text-dark-300">Target Course</span>}
                        rules={[{ required: true, message: 'Please select a course' }]}
                    >
                        <Select
                            placeholder="Which course is this for?"
                            onChange={(val) => setSelectedCourseForModal(val)}
                        >
                            {courses?.map(c => (
                                <Select.Option key={c.id} value={c.id}>{c.title}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="lectureId"
                        label={<span className="text-dark-300">Curriculum Lecture (Optional)</span>}
                        help="Link this session to a specific item in your course curriculum"
                    >
                        <Select
                            placeholder="Link to a curriculum lecture"
                            allowClear
                            disabled={!selectedCourseForModal}
                        >
                            {courseContent?.sections?.map(section => (
                                <Select.OptGroup key={section._id} label={section.title}>
                                    {section.lectures?.filter(l => l.type === 'live').map(lecture => (
                                        <Select.Option key={lecture._id} value={lecture._id}>
                                            {lecture.title}
                                        </Select.Option>
                                    ))}
                                </Select.OptGroup>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label={<span className="text-dark-300">Lesson Topic</span>}
                        rules={[{ required: true, message: 'Please enter a topic' }]}
                    >
                        <Input placeholder="e.g., Weekly Q&A Session or Project Review" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={<span className="text-dark-300">Description (Optional)</span>}
                    >
                        <Input.TextArea rows={3} placeholder="What will be covered in this session?" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="startTime"
                            label={<span className="text-dark-300">Start Time</span>}
                            rules={[{ required: true, message: 'Please select start time' }]}
                        >
                            <DatePicker showTime className="w-full" />
                        </Form.Item>

                        <Form.Item
                            name="duration"
                            label={<span className="text-dark-300">Duration (Minutes)</span>}
                            rules={[{ required: true, message: 'Please enter duration' }]}
                        >
                            <InputNumber min={15} max={300} className="w-full" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <style inset>{`
                .custom-table .ant-table {
                    background: transparent !important;
                    color: white !important;
                }
                .custom-table .ant-table-thead > tr > th {
                    background: #1A1A1A !important;
                    color: #999 !important;
                    border-bottom: 1px solid #222 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                .custom-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #1A1A1A !important;
                }
                .custom-table .ant-table-tbody > tr:hover > td {
                    background: #111 !important;
                }
                .dark-modal .ant-modal-content {
                    background: #0D0D0D !important;
                    border: 1px solid #222 !important;
                    border-radius: 16px !important;
                }
                .dark-modal .ant-modal-header {
                    background: transparent !important;
                    border-bottom: none !important;
                }
                .dark-modal .ant-modal-footer {
                    border-top: 1px solid #222 !important;
                    padding-top: 16px !important;
                }
                .ant-picker {
                    background: #111 !important;
                    border: 1px solid #333 !important;
                    color: white !important;
                }
                .ant-picker-input > input {
                    color: white !important;
                }
                .ant-input-number {
                    background: #111 !important;
                    border: 1px solid #333 !important;
                }
                .ant-input-number-input {
                    color: white !important;
                }
                .ant-select-selector {
                    background: #111 !important;
                    border: 1px solid #333 !important;
                    color: white !important;
                    border-radius: 8px !important;
                }
            `}</style>
        </div>
    );
};

export default TeacherLiveSessions;
