import React, { useState } from 'react';
import { Card, Button, Input, Select, Form, Alert, Badge, Space, Typography, message } from 'antd';
import { Send, Megaphone, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const priorityConfig = {
  low: { color: 'blue', icon: <Info size={16} />, label: 'Low' },
  medium: { color: 'default', icon: <Bell size={16} />, label: 'Medium' },
  high: { color: 'orange', icon: <AlertTriangle size={16} />, label: 'High' },
  urgent: { color: 'red', icon: <AlertTriangle size={16} />, label: 'Urgent' }
};

const AdminSendAlert = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleSendAlert = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/notifications/broadcast', values);
      
      if (res.data?.success) {
        message.success(`Alert sent successfully to ${res.data.deliveryCount} users!`);
        form.resetFields();
        setPreview(null);
      } else {
        message.error('Failed to send alert');
      }
    } catch (err) {
      console.error('Error sending alert:', err);
      message.error(err?.response?.data?.message || 'Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    setPreview(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <Megaphone className="text-primary-500" size={28} />
            Send Public Alert
          </h1>
          <p className="text-dark-300">Broadcast important notifications to all platform users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Form */}
        <Card className="bg-dark-800 border-dark-700">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendAlert}
            initialValues={{
              priority: 'medium',
              targetAudience: 'all'
            }}
          >
            <Form.Item
              name="title"
              label={<Text className="text-white">Alert Title</Text>}
              rules={[
                { required: true, message: 'Please enter alert title' },
                { max: 100, message: 'Title must be less than 100 characters' }
              ]}
            >
              <Input
                placeholder="e.g., Platform Maintenance Notice"
                className="bg-dark-900 border-dark-700 text-white"
                maxLength={100}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="message"
              label={<Text className="text-white">Message</Text>}
              rules={[
                { required: true, message: 'Please enter alert message' },
                { max: 1000, message: 'Message must be less than 1000 characters' }
              ]}
            >
              <TextArea
                placeholder="Describe the alert details..."
                className="bg-dark-900 border-dark-700 text-white"
                rows={6}
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="priority"
                label={<Text className="text-white">Priority</Text>}
                rules={[{ required: true }]}
              >
                <Select className="dark-select">
                  <Option value="low">
                    <Space>
                      <Badge status="default" />
                      Low
                    </Space>
                  </Option>
                  <Option value="medium">
                    <Space>
                      <Badge status="processing" />
                      Medium
                    </Space>
                  </Option>
                  <Option value="high">
                    <Space>
                      <Badge status="warning" />
                      High
                    </Space>
                  </Option>
                  <Option value="urgent">
                    <Space>
                      <Badge status="error" />
                      Urgent
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="targetAudience"
                label={<Text className="text-white">Target Audience</Text>}
                rules={[{ required: true }]}
              >
                <Select className="dark-select">
                  <Option value="all">All Users</Option>
                  <Option value="students">Students Only</Option>
                  <Option value="instructors">Instructors Only</Option>
                  <Option value="admins">Admins Only</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item className="mb-0 pt-4">
              <Space className="w-full justify-end">
                <Button
                  onClick={handlePreview}
                  icon={<Bell size={16} />}
                  className="bg-dark-700 border-dark-600 text-white"
                >
                  Preview
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<Send size={16} />}
                  className="bg-primary-500 hover:bg-primary-600 text-dark-950 font-semibold border-none"
                >
                  Send Alert
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card className="bg-dark-800 border-dark-700">
            <Title level={5} className="text-white mb-4">Preview</Title>
            
            {preview ? (
              <Alert
                message={
                  <div className="flex items-center gap-2">
                    {priorityConfig[preview.priority]?.icon}
                    <span className="font-semibold">{preview.title}</span>
                  </div>
                }
                description={preview.message}
                type={priorityConfig[preview.priority]?.color === 'default' ? 'info' : priorityConfig[preview.priority]?.color}
                showIcon={false}
                className="mb-4"
              />
            ) : (
              <div className="text-center py-8 text-dark-400">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>Fill the form and click Preview to see how your alert will appear</p>
              </div>
            )}
          </Card>

          <Card className="bg-dark-800 border-dark-700">
            <Title level={5} className="text-white mb-4">Delivery Info</Title>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Text className="text-dark-300">Target:</Text>
                <Text className="text-white capitalize">{preview?.targetAudience || 'All Users'}</Text>
              </div>
              <div className="flex justify-between text-sm">
                <Text className="text-dark-300">Priority:</Text>
                <Badge 
                  color={priorityConfig[preview?.priority || 'medium']?.color} 
                  text={priorityConfig[preview?.priority || 'medium']?.label}
                />
              </div>
              <div className="flex justify-between text-sm">
                <Text className="text-dark-300">Real-time:</Text>
                <Text className="text-green-400 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Enabled
                </Text>
              </div>
            </div>

            <Alert
              message="Important Notice"
              description="Urgent alerts will persist until users acknowledge them. Use responsibly."
              type="warning"
              showIcon
              className="mt-4"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSendAlert;
