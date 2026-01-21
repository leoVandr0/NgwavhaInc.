import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, Award, TrendingUp, BookOpen, Video, CheckCircle } from 'lucide-react';

const HomePage = () => {
    const categories = [
        { name: 'Web Development', icon: '💻', courses: 1234 },
        { name: 'Data Science', icon: '📊', courses: 892 },
        { name: 'Business', icon: '💼', courses: 756 },
        { name: 'Design', icon: '🎨', courses: 645 },
        { name: 'Marketing', icon: '📱', courses: 534 },
        { name: 'Photography', icon: '📷', courses: 423 },
    ];

    const stats = [
        { icon: Users, label: 'Active Students', value: '50,000+' },
        { icon: BookOpen, label: 'Total Courses', value: '5,000+' },
        { icon: Award, label: 'Expert Instructors', value: '1,200+' },
        { icon: Star, label: 'Average Rating', value: '4.8/5' },
    ];

    const features = [
        {
            icon: Video,
            title: 'HD Video Content',
            description: 'Learn from high-quality video lectures created by industry experts'
        },
        {
            icon: CheckCircle,
            title: 'Verified Certificates',
            description: 'Earn certificates upon completion to showcase your achievements'
        },
        {
            icon: TrendingUp,
            title: 'Track Progress',
            description: 'Monitor your learning journey with detailed analytics and insights'
        },
    ];

    return (
        <div className="bg-dark-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/10 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Master New Skills
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                                    Forge Your Future
                                </span>
                            </h1>
                            <p className="text-xl text-dark-300 mb-8">
                                Learn from industry experts and transform your career with our comprehensive online courses.
                                Join thousands of students already advancing their skills.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/50 group"
                                >
                                    Explore Courses
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:border-primary-500 transition-all"
                                >
                                    Start Learning Free
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-dark-700 bg-dark-800">
                                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                    <button className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <Play className="h-8 w-8 text-primary-600 ml-1" fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-dark-800 border border-dark-700 rounded-xl p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                        <Star className="h-6 w-6 text-white" fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">4.8/5</p>
                                        <p className="text-dark-400 text-sm">Average Rating</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-dark-800 border-y border-dark-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <stat.icon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-dark-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Explore Top Categories</h2>
                        <p className="text-xl text-dark-400">Find the perfect course for your goals</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05 }}
                                className="card p-6 text-center cursor-pointer group"
                            >
                                <div className="text-4xl mb-3">{category.icon}</div>
                                <h3 className="text-white font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-dark-400 text-sm">{category.courses} courses</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Why Choose SkillForge?</h2>
                        <p className="text-xl text-dark-400">Everything you need to succeed in your learning journey</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="card p-8 text-center hover:border-primary-500 transition-all"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-dark-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-12 shadow-2xl"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Ready to Start Learning?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8">
                            Join thousands of students and start your journey today
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                        >
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
