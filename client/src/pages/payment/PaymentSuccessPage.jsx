import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Typography, Card } from 'antd';
import { CheckCircle, LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const reference = searchParams.get('reference');
        const status = searchParams.get('status');

        if (reference) {
            checkPaymentStatus(reference);
        } else {
            // If no reference, assume success and redirect after delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        }
    }, [searchParams, navigate]);

    const checkPaymentStatus = async (reference) => {
        try {
            const response = await api.get(`/payments/paynow/status/${reference}`);
            setPaymentStatus(response.data);
            
            if (response.data.status === 'succeeded') {
                // Redirect to learning page after a short delay
                setTimeout(() => {
                    navigate(`/learn/${response.data.course.slug}`);
                }, 2000);
            } else {
                setError('Payment was not successful. Please try again.');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setError('Unable to verify payment status. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: '#f5f5f5'
            }}>
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin 
                        indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />}
                    />
                    <Title level={3} style={{ marginTop: '20px' }}>
                        Verifying your payment...
                    </Title>
                    <Text type="secondary">
                        Please wait while we confirm your enrollment
                    </Text>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: '#f5f5f5'
            }}>
                <Result
                    status="error"
                    title="Payment Verification Failed"
                    subTitle={error}
                    extra={[
                        <Button key="dashboard" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>,
                        <Button key="courses" type="primary" onClick={() => navigate('/courses')}>
                            Browse Courses
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: '#f5f5f5'
        }}>
            <Result
                status="success"
                icon={<CheckCircle style={{ color: '#52c41a' }} />}
                title="Payment Successful!"
                subTitle={
                    paymentStatus?.course ? 
                        `You are now enrolled in ${paymentStatus.course.title}` :
                        'Your payment was successful and you have been enrolled in the course.'
                }
                extra={[
                    <Button key="learn" type="primary" onClick={() => navigate(`/learn/${paymentStatus?.course?.slug}`)}>
                        Start Learning
                    </Button>,
                    <Button key="dashboard" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                ]}
            />
        </div>
    );
};

export default PaymentSuccessPage;
