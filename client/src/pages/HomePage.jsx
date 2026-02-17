import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, Award, TrendingUp, BookOpen, Video, CheckCircle, Clock, Globe } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { Carousel, Spin } from 'antd';
import { useQuery } from 'react-query';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
    const { currentUser } = useAuth();
    
    // Debug logging
    console.log('HomePage Debug - Current User:', currentUser);
    console.log('HomePage Debug - Show Join for Free:', !currentUser);
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

    // Fetch featured courses
    const { data: featuredCoursesData, isLoading: featuredLoading } = useQuery(
        'featured-courses',
        async () => {
            const { data } = await api.get('/courses', {
                params: { pageNumber: 1, pageSize: 12 }
            });
            return data.courses;
        }
    );

    // Fetch bestseller courses
    const { data: bestsellerCoursesData, isLoading: bestsellerLoading } = useQuery(
        'bestseller-courses',
        async () => {
            const { data } = await api.get('/courses', {
                params: { pageNumber: 1, pageSize: 8 }
            });
            // Add bestseller flag to some courses for demo
            return data.courses.map((course, index) => ({
                ...course,
                isBestseller: index < 3,
                isHot: index === 0 || index === 1,
                isNew: index >= 6,
                hasCertificate: index % 2 === 0,
                originalPrice: index % 3 === 0 ? parseFloat(course.price) * 1.5 : null,
                duration: `${Math.floor(Math.random() * 20 + 5)} hours`,
                lastUpdated: `${Math.floor(Math.random() * 11 + 1)}/${new Date().getFullYear()}`
            }));
        }
    );

    // Fetch new courses
    const { data: newCoursesData, isLoading: newCoursesLoading } = useQuery(
        'new-courses',
        async () => {
            const { data } = await api.get('/courses', {
                params: { pageNumber: 2, pageSize: 8 }
            });
            return data.courses.map((course, index) => ({
                ...course,
                isNew: true,
                hasCertificate: index % 2 === 0,
                duration: `${Math.floor(Math.random() * 15 + 3)} hours`,
                lastUpdated: `${Math.floor(Math.random() * 3 + 1)}/${new Date().getFullYear()}`
            }));
        }
    );

    const renderCarousel = (courses, loading, title, subtitle, viewAllLink) => (
        <section className="py-16 bg-dark-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-lg text-dark-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {viewAllLink && (
                        <Link
                            to={viewAllLink}
                            className="text-primary-500 font-semibold text-sm hover:text-primary-400 transition-colors flex items-center gap-2 group"
                        >
                            View all
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Carousel
                        dots={false}
                        slidesToShow={courses?.length < 4 ? courses?.length : 4}
                        responsive={[
                            {
                                breakpoint: 1280,
                                settings: {
                                    slidesToShow: 3,
                                }
                            },
                            {
                                breakpoint: 1024,
                                settings: {
                                    slidesToShow: 2,
                                }
                            },
                            {
                                breakpoint: 640,
                                settings: {
                                    slidesToShow: 1,
                                }
                            }
                        ]}
                        className="course-carousel"
                        infinite={courses?.length > 4}
                        speed={500}
                        slidesToScroll={1}
                        swipeToSlide={true}
                    >
                        {courses?.map((course, index) => (
                            <div key={course.id} className="px-2">
                                <CourseCard course={course} index={index} />
                            </div>
                        ))}
                    </Carousel>
                )}
            </div>
        </section>
    );

    return (
        <div className="bg-dark-950 min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-dark-950 py-20 lg:py-32">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Learn without limits
                            </h1>
                            <p className="text-xl text-dark-300 mb-8 max-w-lg">
                                Start, switch, or advance your career with more than 5,000 courses, Professional Certificates, and degrees from world-class universities and companies.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/courses"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-dark-950 bg-primary-500 hover:bg-primary-600 transition-colors rounded-lg"
                                >
                                    Explore Courses
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                {!currentUser && (
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-colors rounded-lg"
                                    >
                                        Join for Free
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative rounded-lg border-4 border-dark-800 bg-dark-900 shadow-2xl p-2">
                                <div className="aspect-video bg-dark-800 flex items-center justify-center rounded">
                                    <Play className="h-16 w-16 text-white/50" />
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
                                <stat.icon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-dark-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            {renderCarousel(
                featuredCoursesData,
                featuredLoading,
                "A broad selection of courses",
                "Choose from over 210,000 online video courses with new additions published every month",
                "/courses"
            )}

            {/* Bestseller Courses */}
            {renderCarousel(
                bestsellerCoursesData,
                bestsellerLoading,
                "Most Popular",
                "Most popular courses based on enrollments and reviews",
                "/courses?filter=bestseller"
            )}

            {/* New Courses */}
            {renderCarousel(
                newCoursesData,
                newCoursesLoading,
                "New Courses",
                "Recently added courses to help you stay ahead",
                "/courses?filter=new"
            )}

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
                                className="bg-dark-900 border border-dark-800 p-6 text-center cursor-pointer hover:border-primary-500 transition-colors rounded-lg"
                            >
                                <div className="text-4xl mb-3">{category.icon}</div>
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
                                className="bg-dark-950 p-8 border border-dark-800 hover:border-primary-500 transition-colors rounded-lg"
                            >
                                <div className="w-12 h-12 bg-primary-500/20 flex items-center justify-center mb-6 text-primary-500 rounded-lg">
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
