import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, Award, TrendingUp, BookOpen, Video, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.jpg';

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
        <div className="bg-dark-950 min-h-screen">
            {/* Simple Header for Public Page */}
            <div className="border-b border-dark-900 bg-dark-950 px-8 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white hover:opacity-90">
                    <img src={logo} alt="Ngwavha Logo" className="h-10 w-10 rounded-full object-cover" />
                    <span>Ngwavha</span>
                </Link>
                <div className="flex gap-4">
                    <Link to="/login" className="px-5 py-2 text-white font-bold border border-white hover:bg-dark-900 transition-colors">
                        Log in
                    </Link>
                    <Link to="/register" className="px-5 py-2 bg-primary-500 text-dark-950 font-bold hover:bg-primary-600 transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-dark-950 py-24 lg:py-32">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Master New Skills
                                <span className="block text-primary-500">
                                    Forge Your Future
                                </span>
                            </h1>
                            <p className="text-xl text-dark-300 mb-8 max-w-lg">
                                Learn from industry experts and transform your career with our comprehensive online courses.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/courses" // Note: Likely needs a public course listing page, but /courses might be guarded.
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-dark-950 bg-primary-500 hover:bg-primary-600 transition-colors"
                                >
                                    Explore Courses
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative rounded-none border-4 border-dark-800 bg-dark-900 shadow-2xl p-2">
                                <div className="aspect-video bg-dark-800 flex items-center justify-center">
                                    <Play className="h-16 w-16 text-white opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-dark-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <stat.icon className="h-8 w-8 text-white mx-auto mb-3" />
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-dark-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-dark-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-white mb-2">Top Categories</h2>
                        <p className="text-lg text-dark-400">Find the perfect course for your goals</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="bg-dark-900 border border-dark-800 p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
                            >
                                <div className="text-4xl mb-3 grayscale hover:grayscale-0">{category.icon}</div>
                                <h3 className="text-white font-semibold mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-dark-400 text-sm">{category.courses} courses</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-dark-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Why Choose Ngwavha?</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-dark-950 p-8 border border-dark-800 hover:border-white transition-colors"
                            >
                                <div className="w-12 h-12 bg-primary-500 flex items-center justify-center mb-6 text-dark-950">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-dark-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
