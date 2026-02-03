import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin } from 'antd';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const authStore = useAuthStore();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            console.error('OAuth Error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            localStorage.setItem('token', token);

            // Verify token and get user profile
            const verifyAndRedirect = async () => {
                try {
                    const response = await api.get('/auth/profile');
                    const userData = response.data;

                    // Sync with auth store/context
                    authStore.login(userData, token);

                    // Redirect based on role
                    if (userData.role === 'teacher' || userData.role === 'instructor') {
                        navigate('/teacher/dashboard');
                    } else {
                        navigate('/student/dashboard');
                    }
                } catch (err) {
                    console.error('Token verification failed after OAuth:', err);
                    localStorage.removeItem('token');
                    navigate('/login?error=verification_failed');
                }
            };

            verifyAndRedirect();
        } else {
            navigate('/login');
        }
    }, [location, navigate, authStore]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
            <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-white font-medium">Completing your sign-in...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
