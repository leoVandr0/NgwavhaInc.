import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Modal, Input, Tag, Space, message, Typography } from 'antd';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminCoursePreviews = () => {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [reason, setReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const fetchPreviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses/previews/pending');
      if (res.data?.success) {
        setPreviews(res.data.data || []);
      } else {
        message.error('Failed to load previews');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to load previews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviews();
  }, []);

  const approve = async (courseId) => {
    try {
      const res = await api.post(`/admin/courses/${courseId}/preview/approve`);
      if (res.data?.success) {
        message.success('Preview approved');
        setReviewModalVisible(false);
        setSelectedCourse(null);
        fetchPreviews();
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to approve preview');
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      return message.warning('Please provide a reason for rejection');
    }
    try {
      const res = await api.post(`/admin/courses/${selectedCourse.id}/preview/reject`, { reason });
      if (res.data?.success) {
        message.success('Preview rejected');
        setReason('');
        setRejectModalVisible(false);
        setReviewModalVisible(false);
        setSelectedCourse(null);
        fetchPreviews();
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to reject preview');
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
      key: 'instructor',
      render: (_, record) => record.instructor?.name || 'Unknown'
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => {
        const duration = record.previewVideoDuration || 0;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="gold">PENDING REVIEW</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Eye size={16} />}
          onClick={() => {
            setSelectedCourse(record);
            setReviewModalVisible(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-dark-950 border-none font-medium"
        >
          Review Video
        </Button>
      )
    }
  ];

  // Helper to format video URL (assuming uploaded locally to /uploads or fully qualified)
  const getVideoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Course Approvals</h1>
          <p className="text-dark-300">Review pending course previews from instructors.</p>
        </div>
      </div>

      <Card className="bg-dark-800 border-dark-700 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          rowKey={record => record.id}
          dataSource={previews}
          columns={columns}
          loading={loading}
          pagination={false}
          className="admin-table text-white"
          rowClassName="hover:bg-dark-700/50 transition-colors"
        />
      </Card>

      {/* Video Review Modal */}
      <Modal
        title={<Title level={4} className="!text-white !m-0">Review Course Preview</Title>}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setSelectedCourse(null);
        }}
        width={800}
        footer={[
          <Button
            key="reject"
            danger
            icon={<XCircle size={16} />}
            onClick={() => setRejectModalVisible(true)}
          >
            Reject Preview
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircle size={16} />}
            className="bg-green-500 hover:bg-green-600 border-none text-white"
            onClick={() => approve(selectedCourse?.id)}
          >
            Approve & Publish
          </Button>
        ]}
        className="dark-modal"
      >
        {selectedCourse && (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{selectedCourse.title}</h3>
              <p className="text-dark-300">{selectedCourse.description}</p>
            </div>

            <div className="bg-dark-950 rounded-lg overflow-hidden border border-dark-700 aspect-video flex items-center justify-center">
              {selectedCourse.previewVideoPath ? (
                <video
                  src={getVideoUrl(selectedCourse.previewVideoPath)}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-dark-400">No preview video available</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        title={<Title level={5} className="!text-white !m-0">Rejection Reason</Title>}
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setReason('');
        }}
        onOk={reject}
        okText="Submit Rejection"
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ className: "bg-dark-800 border-dark-700 text-white" }}
        className="dark-modal"
      >
        <div className="py-4 space-y-4">
          <Text className="text-dark-300">
            Please provide a reason to help the instructor understand why this preview was rejected.
          </Text>
          <TextArea
            rows={4}
            placeholder="E.g., The video quality is too low, or it does not meet our content guidelines..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="bg-dark-900 border-dark-700 text-white"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminCoursePreviews;

