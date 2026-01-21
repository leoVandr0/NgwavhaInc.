import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, Users } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const CourseListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery(
        ['courses', searchTerm, category, page],
        async () => {
            const { data } = await api.get('/courses', {
                params: { keyword: searchTerm, category, pageNumber: page }
            });
            return data;
        }
    );

    return (
        <div className="min-h-screen bg-dark-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">Explore Courses</h1>
                    <p className="text-dark-400 text-lg">Discover your next learning adventure</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </button>
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="aspect-video bg-dark-700"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-dark-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.courses?.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link to={`/course/${course.slug}`} className="card group block">
                                    <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20 overflow-hidden">
                                        {course.thumbnail && (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                                            {course.description}
                                        </p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <img
                                                src={course.instructor?.avatar || '/default-avatar.png'}
                                                alt={course.instructor?.name}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="text-dark-400 text-sm">{course.instructor?.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-dark-400">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                                    <span>{course.averageRating || 'New'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{course.enrollmentsCount || 0}</span>
                                                </div>
                                            </div>
                                            <div className="text-xl font-bold text-white">
                                                ${course.price}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data?.pages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                        {[...Array(data.pages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === i + 1
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseListPage;
