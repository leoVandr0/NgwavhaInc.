import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Users, TrendingUp, BookOpen } from 'lucide-react';

const InstructorDashboard = () => {
    const [stats] = useState({
        totalRevenue: 12450,
        totalStudents: 1234,
        totalCourses: 8,
        avgRating: 4.7,
    });

    return (
        <div className="min-h-screen bg-dark-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Instructor Dashboard</h1>
                        <p className="text-dark-400">Manage your courses and track performance</p>
                    </div>
                    <Link to="/instructor/course/create" className="btn-primary flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create Course
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-green-500' },
                        { icon: Users, label: 'Total Students', value: stats.totalStudents.toLocaleString(), color: 'text-primary-500' },
                        { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses, color: 'text-accent-500' },
                        { icon: TrendingUp, label: 'Avg Rating', value: stats.avgRating, color: 'text-yellow-500' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="card p-6"
                        >
                            <stat.icon className={`h-8 w-8 ${stat.color} mb-3`} />
                            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-dark-400 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Courses */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Your Courses</h2>
                    <div className="card p-12 text-center">
                        <BookOpen className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                        <p className="text-dark-400 mb-6">Create your first course and start teaching</p>
                        <Link to="/instructor/course/create" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create Your First Course
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
