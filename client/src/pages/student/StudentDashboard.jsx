import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, MoreVertical, PlayCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('all');

    const { data: enrollments, isLoading, error } = useQuery('my-courses', async () => {
        try {
            const { data } = await api.get('/enrollments/my-courses');
            return data;
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
            return []; // Return empty array on error to prevent crash
        }
    }, {
        retry: 1, // Only retry once to prevent infinite loops
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (error) => {
            console.error('Dashboard query error:', error);
        }
    });

    // Handle loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading your courses...</div>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">Error loading dashboard</div>
                    <div className="text-dark-400 mb-6">Unable to load your courses. Please try again.</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    // Filter logic (mock implementation if real filtering isn't available on backend)
    const filteredEnrollments = enrollments?.filter(enrollment => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return enrollment.progress < 100;
        if (activeTab === 'completed') return enrollment.progress === 100;
        return true;
    });

    return (
        <div className="min-h-screen bg-dark-950 text-white font-sans">
            {/* Udemy-style Header */}
            <div className="bg-dark-900 border-b border-dark-800 pt-12 pb-4 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold font-serif mb-8 text-white">
                        My Learning
                    </h1>

                    {/* Tabs */}
                    <div className="flex space-x-8 text-sm font-bold text-dark-300">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-4 border-b-2 transition-colors ${activeTab === 'all' ? 'text-white border-white' : 'border-transparent hover:text-white'}`}
                        >
                            All Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`pb-4 border-b-2 transition-colors ${activeTab === 'active' ? 'text-white border-white' : 'border-transparent hover:text-white'}`}
                        >
                            In Progress
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`pb-4 border-b-2 transition-colors ${activeTab === 'completed' ? 'text-white border-white' : 'border-transparent hover:text-white'}`}
                        >
                            Completed
                        </button>
                        <Link
                            to="/student/wishlist"
                            className="pb-4 border-b-2 border-transparent hover:text-white transition-colors"
                        >
                            Wishlist
                        </Link>
                        <button
                            className="pb-4 border-b-2 border-transparent hover:text-white transition-colors"
                        >
                            Archived
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-video bg-dark-800 mb-4"></div>
                                <div className="h-4 bg-dark-800 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-dark-800 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredEnrollments?.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredEnrollments.map((enrollment) => (
                            <Link to={`/learn/${enrollment.course.slug}`} key={enrollment.id} className="group block h-full">
                                <div className="bg-dark-900 border border-dark-800 hover:border-dark-600 transition-all h-full flex flex-col">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-dark-800 overflow-hidden">
                                        {enrollment.course.thumbnail ? (
                                            <img
                                                src={enrollment.course.thumbnail}
                                                alt={enrollment.course.title}
                                                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-dark-800 text-dark-600">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                        )}
                                        {/* Overlay Play Icon on Hover (Udemy style) */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayCircle className="h-12 w-12 text-white" />
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-primary-500 transition-colors">
                                            {enrollment.course.title}
                                        </h3>
                                        <p className="text-xs text-dark-400 mb-4 truncate">
                                            {enrollment.course.instructor?.name || 'Instructor'}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mt-auto">
                                            <div className="w-full bg-dark-700 h-1 mb-2">
                                                <div
                                                    className="bg-primary-500 h-1"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-dark-300">
                                                    {enrollment.progress === 0 ? 'Start Course' : `${Math.round(enrollment.progress)}% complete`}
                                                </span>
                                                {/* Optional star rating could go here */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-20 bg-dark-900 border border-dark-800">
                        <h2 className="text-2xl font-bold text-white mb-4">Let's start learning, {currentUser?.name?.split(' ')[0]}</h2>
                        <p className="text-dark-400 mb-8 max-w-md mx-auto">
                            Identify your goals and start learning today. We have thousands of courses for you.
                        </p>
                        <Link to="/courses" className="inline-flex items-center justify-center px-6 py-3 text-base font-bold text-dark-950 bg-primary-500 hover:bg-primary-600 transition-colors">
                            Browse now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
