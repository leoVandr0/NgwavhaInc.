import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Modal, Input, Tag, Space, message } from 'antd';
import api from '../../services/api';

const AdminCoursePreviews = () => {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState(null);

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
      await api.post(`/admin/courses/${courseId}/preview/approve`);
      message.success('Preview approved');
      fetchPreviews();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to approve preview');
    }
  };

  const reject = async (courseId) => {
    try {
      await api.post(`/admin/courses/${courseId}/preview/reject`, { reason: reason || 'No reason provided' });
      message.success('Preview rejected');
      setReason('');
      fetchPreviews();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to reject preview');
    }
  };

  const columns = [
    { title: 'Course', dataIndex: 'title', key: 'title' },
    { title: 'Instructor', dataIndex: 'instructor', key: 'instructor', render: (text) => text?.name ?? '-' },
    { title: 'Duration (s)', dataIndex: 'previewVideoDuration', key: 'duration' },
    { title: 'Uploaded At', dataIndex: 'previewUploadedAt', key: 'uploaded' },
    {
      title: 'Actions', key: 'actions', render: (_, row) => (
        <Space>
          <Button type="primary" onClick={() => setSelected(row)}>Review</Button>
          <Button onClick={() => approve(row.id)}>Approve</Button>
          <Button danger onClick={() => setSelected(row)}>Reject</Button>
        </Space>
      )
    }
  ];

  // Temp modal for rejection reason
  const actionModal = (
    <Modal
      visible={!!selected}
      title="Reject Preview"
      onCancel={() => setSelected(null)}
      onOk={() => { reject(selected?.id); setSelected(null); }}
      okText="Reject"
      okButtonProps={{ danger: true }}
    >
      <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
    </Modal>
  );

  return (
    <div style={{ padding: 24 }}>
      <Card title="Pending Course Previews" bordered={false}>
        <Table
          rowKey={record => record.id}
          dataSource={previews}
          columns={columns}
          loading={loading}
          pagination={false}
        />
      </Card>
      {actionModal}
    </div>
  );
};

export default AdminCoursePreviews;
