import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Radio, message, Steps, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { CreditCard, Smartphone, Mail, Phone, User } from 'lucide-react';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const PaymentCheckoutModal = ({
  visible,
  onClose,
  course,
  onPaymentSuccess,
  user
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('web');
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentData, setPaymentData] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        email: user.email,
        name: user.name
      });
    }
  }, [visible, user, form]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const initiatePayment = async (values) => {
    setLoading(true);
    try {
      const payload = {
        courseId: course.id,
        method: paymentMethod,
        ...values
      };

      if (paymentMethod === 'mobile') {
        payload.phone = values.phone;
        payload.mobileMethod = 'ecocash';
      }

      const response = await api.post('/payments/paynow/initiate', payload);

      if (response.data.success) {
        setPaymentData(response.data);
        setCurrentStep(2);

        if (paymentMethod === 'web') {
          // Redirect to PayNow website for payment
          window.location.href = response.data.redirectUrl;
        } else {
          // Show mobile payment instructions and start polling
          startPolling(response.data.pollUrl);
        }
      } else {
        message.error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      message.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (pollUrl) => {
    setPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.post('/payments/paynow/poll', { pollUrl });

        if (response.data.paid) {
          clearInterval(pollInterval);
          setPolling(false);
          setCurrentStep(3);
          message.success('Payment successful! Enrolling you in the course...');

          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 2000);
        } else if (response.data.status === 'cancelled' || response.data.status === 'failed') {
          clearInterval(pollInterval);
          setPolling(false);
          message.error('Payment was cancelled or failed');
          setCurrentStep(0);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 600000);
  };

  const renderPaymentForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={initiatePayment}
      initialValues={{
        method: 'web'
      }}
    >
      <Form.Item
        label="Payment Method"
        name="method"
        rules={[{ required: true, message: 'Please select a payment method' }]}
      >
        <Radio.Group onChange={handlePaymentMethodChange}>
          <Radio.Button value="web" style={{ marginRight: 8 }}>
            <CreditCard size={16} style={{ marginRight: 4 }} /> Card/Online Payment
          </Radio.Button>
          <Radio.Button value="mobile">
            <Smartphone size={16} style={{ marginRight: 4 }} /> EcoCash
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="Email Address"
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input
          prefix={<Mail size={16} />}
          placeholder="your@email.com"
          disabled={!!user?.email}
        />
      </Form.Item>

      <Form.Item
        label="Full Name"
        name="name"
        rules={[{ required: true, message: 'Please enter your full name' }]}
      >
        <Input
          prefix={<User size={16} />}
          placeholder="John Doe"
          disabled={!!user?.name}
        />
      </Form.Item>

      {paymentMethod === 'mobile' && (
        <Form.Item
          label="EcoCash Phone Number"
          name="phone"
          rules={[
            { required: true, message: 'Please enter your EcoCash number' },
            { pattern: /^(07|263)[0-9]{8,9}$/, message: 'Please enter a valid Zimbabwean phone number' }
          ]}
        >
          <Input
            prefix={<Phone size={16} />}
            placeholder="0771234567 or 263771234567"
          />
        </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
        >
          {loading ? (
            <>
              <LoadingOutlined /> Processing...
            </>
          ) : (
            `Pay $${course.price} with ${paymentMethod === 'web' ? 'Card/Online' : 'EcoCash'}`
          )}
        </Button>
      </Form.Item>
    </Form>
  );

  const renderMobileInstructions = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Title level={4}>EcoCash Payment Instructions</Title>
      <div style={{
        background: '#f0f8ff',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #1890ff'
      }}>
        <Text strong>{paymentData?.instructions || 'Dial *151# and follow the prompts to complete the payment'}</Text>
      </div>
      {polling && (
        <div>
          <LoadingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <br />
          <Text>Waiting for payment confirmation...</Text>
          <br />
          <Text type="secondary">This may take a few moments</Text>
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}>✓</div>
      <Title level={3} style={{ color: '#52c41a' }}>Payment Successful!</Title>
      <Text>You are now being enrolled in {course.title}</Text>
    </div>
  );

  const steps = [
    {
      title: 'Payment Details',
      content: renderPaymentForm()
    },
    {
      title: 'Processing',
      content: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <br />
          <Title level={4}>Initiating Payment...</Title>
          <Text>Please wait while we process your payment</Text>
        </div>
      )
    },
    {
      title: paymentMethod === 'web' ? 'Redirecting' : 'Mobile Payment',
      content: paymentMethod === 'web' ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <br />
          <Title level={4}>Redirecting to PayNow...</Title>
          <Text>You will be redirected to complete your payment</Text>
        </div>
      ) : renderMobileInstructions()
    },
    {
      title: 'Complete',
      content: renderSuccess()
    }
  ];

  return (
    <Modal
      title={`Enroll in ${course.title}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Course:</Text> {course.title}
            </div>
            <div>
              <Text strong>Amount:</Text> <span style={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}>${course.price}</span>
            </div>
          </div>
        </div>

        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>
      </div>

      <div style={{ minHeight: '300px' }}>
        {steps[currentStep].content}
      </div>
    </Modal>
  );
};

export default PaymentCheckoutModal;
