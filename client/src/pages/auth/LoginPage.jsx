import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { App, Tooltip } from 'antd'; // Use Ant Design App hook for messages
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';
import Footer from '../../components/layout/Footer';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lastAttempt, setLastAttempt] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { message } = App.useApp(); // Use the hook from the AntApp context

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Security: Rate limiting check
    const checkRateLimit = () => {
        if (loginAttempts >= 5) {
            const timeSinceLastAttempt = Date.now() - lastAttempt;
            if (timeSinceLastAttempt < 60000) { // 1 minute cooldown
                const remainingSeconds = Math.ceil((60000 - timeSinceLastAttempt) / 1000);
                message.error(`Too many failed attempts. Please wait ${remainingSeconds} seconds.`);
                return false;
            } else {
                // Reset after cooldown
                setLoginAttempts(0);
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Rate limiting check
        if (!checkRateLimit()) {
            return;
        }

        // Basic password validation
        if (formData.password.length < 8) {
            message.warning('Password should be at least 8 characters');
        }

        setLoading(true);
        setLastAttempt(Date.now());

        try {
            const userData = await login(formData.email, formData.password);
            message.success('Welcome back to Ngwavha!');
            setLoginAttempts(0); // Reset on successful login

            // Navigate based on user role
            if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (userData.role === 'teacher' || userData.role === 'instructor') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginAttempts(prev => prev + 1);
            const remainingAttempts = 5 - (loginAttempts + 1);

            let errorMessage = error.response?.data?.message || 'We could not log you in. Please check your credentials.';
            if (remainingAttempts <= 2 && remainingAttempts > 0) {
                errorMessage += ` (${remainingAttempts} attempts remaining)`;
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Header Logo Area */}
                <div className="text-center mb-10">
                    <Link to="/" className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
                        <img src={logo} alt="Ngwavha Logo" className="h-12 w-12 rounded-full object-cover" />
                        <span>Ngwavha</span>
                    </Link>
                </div>

                {/* Login Card - Solid, Professional, Sharp Edges */}
                <div className="bg-dark-900 rounded-none border-t-4 border-primary-500 shadow-2xl p-8 w-full">
                    <h2 className="text-xl font-bold text-white mb-6">
                        Log in to your account
                    </h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-bold text-dark-200">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-dark-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                                    placeholder="email@address.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-bold text-dark-200">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-dark-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-10 py-3 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password security hint */}
                            <Tooltip title="Make sure you're using a strong, unique password">
                                <div className="flex items-center gap-2 mt-1 text-xs text-dark-400">
                                    <Shield size={12} />
                                    <span>Tip: Use a password with letters, numbers, and symbols</span>
                                </div>
                            </Tooltip>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-primary-500 hover:text-primary-400 hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold text-dark-950 bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-dark-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-dark-900 text-dark-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`}
                                className="w-full inline-flex justify-center py-3 px-4 border border-dark-700 shadow-sm bg-dark-800 text-sm font-medium text-white hover:bg-dark-700 focus:outline-none transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Google</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-dark-700 pt-6 text-center">
                        <p className="text-sm text-dark-300">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-primary-500 hover:text-primary-400 hover:underline">
                                Sign up
                            </Link>
                        </p>
                        <div className="mt-4">
                            <Link to="/" className="text-sm font-medium text-dark-400 hover:text-white transition-colors">
                                Log in with your organization
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full mt-20">
                <Footer />
            </div>
        </div>
    );
};

export default LoginPage;
