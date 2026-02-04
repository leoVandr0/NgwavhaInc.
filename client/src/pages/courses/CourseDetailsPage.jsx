import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Globe, Award, Play, CheckCircle, X, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { message, Modal } from 'antd';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const CourseDetailsPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuthStore();
    const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCartStore();
    const [actionLoading, setActionLoading] = useState(false);

    const { data: course, isLoading } = useQuery(
        ['course', slug],
        async () => {
            const { data } = await api.get(`/courses/${slug}`);
            return data;
        }
    );

    // Check if user is enrolled
    const { data: enrollmentData } = useQuery(
        ['enrollment-check', course?.id],
        async () => {
            const { data } = await api.get(`/enrollments/check/${course.id}`);
            return data;
        },
        { enabled: !!course?.id && isAuthenticated }
    );

    const enrollMutation = useMutation(
        async () => {
            const { data } = await api.post(`/enrollments/enroll/${course.id}`);
            return data;
        },
        {
            onSuccess: () => {
                message.success('Successfully enrolled in the course!');
                queryClient.invalidateQueries(['enrollment-check', course.id]);
                navigate(`/learn/${course.slug}`);
            },
            onError: (error) => {
                message.error(error.response?.data?.message || 'Failed to enroll');
            }
        }
    );

    const handleEnroll = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/course/${slug}` } });
            return;
        }
        enrollMutation.mutate();
    };

    const handleStartLearning = () => {
        navigate(`/learn/${course.slug}`);
    };

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    // Find first lecture with a video to use as a preview
    useEffect(() => {
        if (course?.content?.sections) {
            for (const section of course.content.sections) {
                for (const lecture of section.lectures) {
                    if (lecture.videoUrl) {
                        setPreviewUrl(`http://localhost:5001${lecture.videoUrl}`);
                        return;
                    }
                }
            }
        }
    }, [course]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                    <button onClick={() => navigate('/courses')} className="text-primary-500 hover:underline">
                        Return to courses
                    </button>
                </div>
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
                            <div className="card sticky top-24 overflow-hidden border-dark-700 shadow-2xl">
                                <div className="aspect-video bg-dark-800 relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-600/20 to-accent-600/20" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="h-6 w-6 text-primary-600 ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 w-full text-center">
                                        <p className="text-white font-bold text-sm shadow-black drop-shadow-lg">Preview this course</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="text-3xl font-bold text-white mb-2">${course.price}</div>
                                        {course.estimatedPrice && (
                                            <div className="text-dark-400 line-through">${course.estimatedPrice}</div>
                                        )}
                                    </div>
                                    {enrollmentData?.isEnrolled ? (
                                        <button
                                            className="w-full btn-primary py-3 mb-3 flex items-center justify-center gap-2"
                                            onClick={handleStartLearning}
                                        >
                                            Go to Course <Play className="h-4 w-4" fill="currentColor" />
                                        </button>
                                    ) : (
                                        <button
                                            className="w-full btn-primary py-3 mb-3 disabled:opacity-50"
                                            onClick={handleEnroll}
                                            disabled={enrollMutation.isLoading}
                                        >
                                            {enrollMutation.isLoading ? 'Enrolling...' : 'Enroll Now'}
                                        </button>
                                    )}
                                    {!enrollmentData?.isEnrolled && (
                                        <div className="space-y-3">
                                            {isInCart(course.id) ? (
                                                <button
                                                    onClick={() => navigate('/cart')}
                                                    className="w-full btn-secondary py-3 flex items-center justify-center gap-2 font-bold"
                                                >
                                                    <ShoppingCart className="h-5 w-5" /> Go to Cart
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        if (!isAuthenticated) return navigate('/login');
                                                        setActionLoading(true);
                                                        const success = await addToCart(course.id);
                                                        setActionLoading(false);

                                                        if (success) {
                                                            message.success('Added to cart');
                                                        } else {
                                                            message.error('Failed to add to cart');
                                                        }
                                                    }}
                                                    disabled={actionLoading}
                                                    className="w-full btn-secondary py-3 flex items-center justify-center gap-2 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="h-5 w-5" /> Add to Cart
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {isInWishlist(course.id) ? (
                                                <button
                                                    onClick={() => removeFromWishlist(course.id)}
                                                    className="w-full border border-dark-600 text-white hover:bg-dark-800 py-3 rounded-md transition-colors flex items-center justify-center gap-2 font-medium"
                                                >
                                                    <Heart className="h-5 w-5 fill-red-500 text-red-500" /> Wishlisted
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        if (!isAuthenticated) return navigate('/login');
                                                        const success = await addToWishlist(course.id);
                                                        if (success) message.success('Added to wishlist');
                                                        else message.error('Failed to add to wishlist');
                                                    }}
                                                    className="w-full border border-dark-600 text-white hover:bg-dark-800 py-3 rounded-md transition-colors flex items-center justify-center gap-2 font-medium group"
                                                >
                                                    <Heart className="h-5 w-5 group-hover:text-red-500 transition-colors" /> Add to Wishlist
                                                </button>
                                            )}
                                        </div>
                                    )}
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

            {/* Preview Modal */}
            <Modal
                open={isPreviewOpen}
                onCancel={() => setIsPreviewOpen(false)}
                footer={null}
                width={800}
                centered
                className="preview-modal"
                closeIcon={<X className="text-white" />}
                bodyStyle={{ padding: 0, backgroundColor: 'black' }}
            >
                <div className="aspect-video">
                    {previewUrl ? (
                        <video
                            src={previewUrl}
                            controls
                            autoPlay
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-500">
                            No preview available for this course.
                        </div>
                    )}
                </div>
                <div className="p-6 bg-dark-900">
                    <h3 className="text-white font-bold text-lg mb-2">Course Preview: {course.title}</h3>
                    <p className="text-dark-400 text-sm">Enroll now to access all lectures and course materials.</p>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .preview-modal .ant-modal-content { background: #111 !important; border: 1px solid #333; overflow: hidden; }
                .preview-modal .ant-modal-close { top: -40px; right: -40px; }
            ` }} />
        </div>
    );
};

export default CourseDetailsPage;
