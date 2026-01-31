import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { App } from 'antd'; // Use Ant Design App hook for messages
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { message } = App.useApp(); // Use the hook from the AntApp context

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = await login(formData.email, formData.password);
            message.success('Welcome back to Ngwavha!');

            // Navigate based on user role
            if (userData.role === 'teacher' || userData.role === 'instructor') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error(error.response?.data?.message || 'We could not log you in. Please check your credentials.');
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
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                                    placeholder="Enter your password"
                                />
                            </div>
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
        </div>
    );
};

export default LoginPage;
