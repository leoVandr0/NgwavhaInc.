import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Globe, Award, Play, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const CourseDetailsPage = () => {
    const { slug } = useParams();
    const { isAuthenticated } = useAuthStore();

    const { data: course, isLoading } = useQuery(
        ['course', slug],
        async () => {
            const { data } = await api.get(`/courses/${slug}`);
            return data;
        }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Hero Section */}
            <div className="bg-dark-950 border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium">
                                    {course.category?.name}
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                            <p className="text-xl text-dark-300 mb-6">{course.subtitle}</p>

                            <div className="flex flex-wrap items-center gap-6 text-dark-400 mb-6">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                                    <span className="font-bold text-white">{course.averageRating || 'New'}</span>
                                    <span>({course.ratingsCount || 0} ratings)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    <span>{course.enrollmentsCount || 0} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    <span>{course.language}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <img
                                    src={course.instructor?.avatar || '/default-avatar.png'}
                                    alt={course.instructor?.name}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <p className="text-sm text-dark-400">Created by</p>
                                    <p className="text-white font-semibold">{course.instructor?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Card */}
                        <div className="lg:col-span-1">
                            <div className="card sticky top-24">
                                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                    <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <Play className="h-6 w-6 text-primary-600 ml-1" fill="currentColor" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="text-3xl font-bold text-white mb-2">${course.price}</div>
                                        {course.estimatedPrice && (
                                            <div className="text-dark-400 line-through">${course.estimatedPrice}</div>
                                        )}
                                    </div>
                                    <button className="w-full btn-primary py-3 mb-3">
                                        Enroll Now
                                    </button>
                                    <button className="w-full btn-secondary py-3">
                                        Add to Cart
                                    </button>
                                    <div className="mt-6 space-y-3 text-sm text-dark-400">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-primary-500" />
                                            <span>30-Day Money-Back Guarantee</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-primary-500" />
                                            <span>Full Lifetime Access</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-primary-500" />
                                            <span>Certificate of Completion</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* What you'll learn */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">What you'll learn</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    'Build real-world projects',
                                    'Master core concepts',
                                    'Industry best practices',
                                    'Advanced techniques',
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-dark-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                            <div className="text-dark-300 space-y-4">
                                <p>{course.description}</p>
                            </div>
                        </div>

                        {/* Course Content */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Course Content</h2>
                            <div className="space-y-2">
                                {course.content?.sections?.map((section, sIndex) => (
                                    <div key={sIndex} className="card">
                                        <div className="p-4 bg-dark-800">
                                            <h3 className="font-semibold text-white">{section.title}</h3>
                                            <p className="text-sm text-dark-400 mt-1">
                                                {section.lectures?.length || 0} lectures
                                            </p>
                                        </div>
                                        <div className="divide-y divide-dark-700">
                                            {section.lectures?.slice(0, 3).map((lecture, lIndex) => (
                                                <div key={lIndex} className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Play className="h-4 w-4 text-dark-400" />
                                                        <span className="text-dark-300">{lecture.title}</span>
                                                    </div>
                                                    <span className="text-dark-400 text-sm">
                                                        {Math.floor(lecture.videoDuration / 60)}:{String(lecture.videoDuration % 60).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Student Reviews</h2>
                            <div className="space-y-4">
                                {course.reviews?.map((review) => (
                                    <div key={review.id} className="card p-6">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={review.user?.avatar || '/default-avatar.png'}
                                                alt={review.user?.name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-white">{review.user?.name}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500' : 'text-dark-600'
                                                                    }`}
                                                                fill="currentColor"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-dark-300">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {/* Instructor */}
                        <div className="card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Instructor</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={course.instructor?.avatar || '/default-avatar.png'}
                                    alt={course.instructor?.name}
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h4 className="font-semibold text-white">{course.instructor?.name}</h4>
                                    <p className="text-sm text-dark-400">{course.instructor?.headline}</p>
                                </div>
                            </div>
                            <p className="text-dark-300 text-sm">{course.instructor?.bio}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsPage;
