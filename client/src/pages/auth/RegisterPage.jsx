import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { App } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import logo from '../../assets/logo.jpg';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { message } = App.useApp();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            message.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Register the user
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            // Then log them in
            const userData = await login(formData.email, formData.password);
            message.success('Account created successfully! Welcome to Ngwavha.');

            // Navigate based on user role
            if (userData.role === 'teacher' || userData.role === 'instructor') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
                        <img src={logo} alt="Ngwavha Logo" className="h-12 w-12 rounded-full object-cover" />
                        <span>Ngwavha</span>
                    </Link>
                </div>

                <div className="bg-dark-900 rounded-none border-t-4 border-primary-500 shadow-2xl p-8 w-full">
                    <h2 className="text-xl font-bold text-white mb-2">
                        Sign up and start learning
                    </h2>
                    <p className="text-dark-400 text-sm mb-6">
                        Join thousands of learners from around the world.
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-dark-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>

                        <div>
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
                                    placeholder="Email"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-dark-400" />
                                </div>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium appearance-none"
                                >
                                    <option value="student">I want to Learn (Student)</option>
                                    <option value="instructor">I want to Teach (Instructor)</option>
                                </select>
                            </div>
                        </div>

                        <div>
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
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-dark-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                                    placeholder="Confirm Password"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold text-dark-950 bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-dark-300">
                            By signing up, you agree to our{' '}
                            <Link to="/terms" className="underline hover:text-white">Terms of Use</Link> and{' '}
                            <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                        </p>
                    </div>

                    <div className="mt-6 border-t border-dark-700 pt-6 text-center">
                        <p className="text-sm text-dark-300">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-primary-500 hover:text-primary-400 hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
