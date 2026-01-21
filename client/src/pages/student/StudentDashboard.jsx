import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const StudentDashboard = () => {
    const { data: enrollments, isLoading } = useQuery('my-courses', async () => {
        const { data } = await api.get('/enrollments/my-courses');
        return data;
    });

    return (
        <div className="min-h-screen bg-dark-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Learning</h1>
                    <p className="text-dark-400">Continue your learning journey</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { icon: BookOpen, label: 'Enrolled Courses', value: enrollments?.length || 0 },
                        { icon: Clock, label: 'Hours Learned', value: '24' },
                        { icon: Award, label: 'Certificates', value: enrollments?.filter(e => e.isCompleted).length || 0 },
                        { icon: TrendingUp, label: 'Avg Progress', value: '65%' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="card p-6"
                        >
                            <stat.icon className="h-8 w-8 text-primary-500 mb-3" />
                            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-dark-400 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Courses */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Your Courses</h2>
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="aspect-video bg-dark-700"></div>
                                    <div className="p-6 space-y-3">
                                        <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-dark-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : enrollments?.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enrollment, index) => (
                                <motion.div
                                    key={enrollment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Link to={`/learn/${enrollment.course.slug}`} className="card group block">
                                        <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20 overflow-hidden">
                                            {enrollment.course.thumbnail && (
                                                <img
                                                    src={enrollment.course.thumbnail}
                                                    alt={enrollment.course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                                                {enrollment.course.title}
                                            </h3>
                                            <p className="text-dark-400 text-sm mb-4">
                                                By {enrollment.course.instructor?.name}
                                            </p>
                                            <div className="mb-2">
                                                <div className="flex justify-between text-sm text-dark-400 mb-1">
                                                    <span>Progress</span>
                                                    <span>{Math.round(enrollment.progress)}%</span>
                                                </div>
                                                <div className="w-full bg-dark-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${enrollment.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {enrollment.isCompleted && (
                                                <div className="mt-4 flex items-center gap-2 text-primary-400">
                                                    <Award className="h-5 w-5" />
                                                    <span className="text-sm font-semibold">Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <BookOpen className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                            <p className="text-dark-400 mb-6">Start learning by enrolling in a course</p>
                            <Link to="/courses" className="btn-primary inline-block">
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
