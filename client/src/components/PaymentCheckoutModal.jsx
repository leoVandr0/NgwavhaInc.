import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Radio, message, Steps, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { CreditCard, Smartphone, Mail, Phone, User, Calendar, Lock } from 'lucide-react';
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
        label={<span style={{ color: '#aaa' }}>Select Payment Method</span>}
        name="method"
        rules={[{ required: true, message: 'Please select a payment method' }]}
      >
        <Radio.Group
          onChange={handlePaymentMethodChange}
          className="w-full flex gap-4"
          style={{ width: '100%', display: 'flex', gap: '16px' }}
        >
          <Radio.Button
            value="web"
            style={{
              flex: 1,
              height: 'auto',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: paymentMethod === 'web' ? 'rgba(255, 165, 0, 0.1)' : '#1a1a1a',
              borderColor: paymentMethod === 'web' ? '#FFA500' : '#333',
              color: paymentMethod === 'web' ? '#FFA500' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <CreditCard size={24} style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Card/Online</div>
          </Radio.Button>
          <Radio.Button
            value="mobile"
            style={{
              flex: 1,
              height: 'auto',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: paymentMethod === 'mobile' ? 'rgba(255, 165, 0, 0.1)' : '#1a1a1a',
              borderColor: paymentMethod === 'mobile' ? '#FFA500' : '#333',
              color: paymentMethod === 'mobile' ? '#FFA500' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <Smartphone size={24} style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>EcoCash / Mobile</div>
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

      {paymentMethod === 'web' && (
        <div style={{ marginTop: '24px', padding: '20px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>
          <Title level={5} style={{ color: '#FFA500', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Card Information
          </Title>

          <Form.Item
            label={<span style={{ color: '#aaa' }}>Card Number</span>}
            name="cardNumber"
            rules={[
              { required: true, message: 'Please enter card number' },
              { pattern: /^[0-9\s]{13,19}$/, message: 'Invalid card number' }
            ]}
            className="custom-form-item"
          >
            <Input
              prefix={<CreditCard size={16} style={{ color: '#FFA500' }} />}
              placeholder="0000 0000 0000 0000"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
              maxLength={19}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#aaa' }}>Card Holder Name</span>}
            name="cardHolder"
            rules={[{ required: true, message: 'Please enter card holder name' }]}
            className="custom-form-item"
          >
            <Input
              prefix={<User size={16} style={{ color: '#FFA500' }} />}
              placeholder="NAME ON CARD"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label={<span style={{ color: '#aaa' }}>Expiry Date</span>}
              name="expiry"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: 'Required' },
                { pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: 'MM/YY' }
              ]}
              className="custom-form-item"
            >
              <Input
                prefix={<Calendar size={16} style={{ color: '#FFA500' }} />}
                placeholder="MM/YY"
                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                maxLength={5}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#aaa' }}>CVV</span>}
              name="cvv"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: 'Required' },
                { pattern: /^[0-9]{3,4}$/, message: 'Enter 3-4 digits' }
              ]}
              className="custom-form-item"
            >
              <Input
                prefix={<Lock size={16} style={{ color: '#FFA500' }} />}
                placeholder="123"
                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                maxLength={4}
              />
            </Form.Item>
          </div>
        </div>
      )}

      {paymentMethod === 'mobile' && (
        <Form.Item
          label={<span style={{ color: '#aaa' }}>EcoCash Phone Number</span>}
          name="phone"
          rules={[
            { required: true, message: 'Please enter your EcoCash number' },
            { pattern: /^(07|263)[0-9]{8,9}$/, message: 'Please enter a valid Zimbabwean phone number' }
          ]}
          style={{ marginTop: '16px' }}
        >
          <Input
            prefix={<Phone size={16} style={{ color: '#FFA500' }} />}
            placeholder="0771234567 or 263771234567"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
          />
        </Form.Item>
      )}

      <div style={{ marginTop: '24px' }}>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            style={{ height: '54px', fontWeight: 'bold' }}
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
      </div>
    </Form>
  );

  const renderMobileInstructions = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Title level={4} style={{ color: '#fff' }}>EcoCash Payment Instructions</Title>
      <div style={{
        background: 'rgba(255, 165, 0, 0.1)',
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '1px solid #FFA500'
      }}>
        <Text strong style={{ color: '#fff', fontSize: '16px' }}>
          {paymentData?.instructions || 'Check your phone for the PIN prompt to complete the payment. If no prompt appears, dial *151*2*1#'}
        </Text>
      </div>
      {polling && (
        <div style={{ marginTop: '24px' }}>
          <LoadingOutlined style={{ fontSize: '32px', color: '#FFA500', marginBottom: '16px' }} />
          <br />
          <Text style={{ color: '#fff', display: 'block' }}>Waiting for payment confirmation...</Text>
          <Text style={{ color: '#666', fontSize: '12px' }}>Please do not close this window</Text>
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
          <LoadingOutlined style={{ fontSize: '48px', color: '#FFA500' }} />
          <br />
          <Title level={4} style={{ color: '#fff' }}>Initiating Payment...</Title>
          <Text style={{ color: '#aaa' }}>Please wait while we process your payment</Text>
        </div>
      )
    },
    {
      title: paymentMethod === 'web' ? 'Redirecting' : 'Mobile Payment',
      content: paymentMethod === 'web' ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingOutlined style={{ fontSize: '48px', color: '#FFA500' }} />
          <br />
          <Title level={4} style={{ color: '#fff' }}>Redirecting to PayNow...</Title>
          <Text style={{ color: '#aaa' }}>You will be redirected to complete your payment</Text>
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
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ maxWidth: '70%' }}>
              <Text style={{ color: '#aaa', fontSize: '12px', display: 'block', textTransform: 'uppercase' }}>Selected Course</Text>
              <Text strong style={{ color: '#fff', fontSize: '16px' }}>{course.title}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ color: '#aaa', fontSize: '12px', display: 'block', textTransform: 'uppercase' }}>Amount to Pay</Text>
              <span style={{ color: '#FFA500', fontSize: '24px', fontWeight: 'bold' }}>${course.price}</span>
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
