import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, Award, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvatarUrl, getCourseThumbnail } from '../utils/imageUtils';
import useCartStore from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';

const CourseCard = ({ course, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart, removeFromCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCartStore();
    const { isAuthenticated } = useAuth();

    const formatPrice = (price) => {
        if (price === 0 || price === '0.00') return 'Free';
        return `$${price}`;
    };

    const formatDuration = (duration) => {
        if (!duration) return 'Unknown';
        return duration;
    };

    const handleCartAction = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            message.warning('Please login to add courses to cart');
            return;
        }

        try {
            if (isInCart(course.id)) {
                await removeFromCart(course.id);
                message.success('Removed from cart');
            } else {
                const success = await addToCart(course.id);
                if (success) {
                    message.success('Added to cart');
                }
            }
        } catch (error) {
            message.error('Failed to update cart');
        }
    };

    const handleWishlistAction = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            message.warning('Please login to add courses to wishlist');
            return;
        }

        try {
            if (isInWishlist(course.id)) {
                await removeFromWishlist(course.id);
                message.success('Removed from wishlist');
            } else {
                const success = await addToWishlist(course.id);
                if (success) {
                    message.success('Added to wishlist');
                }
            }
        } catch (error) {
            message.error('Failed to update wishlist');
        }
    };

    const inCart = isInCart(course.id);
    const inWishlist = isInWishlist(course.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/course/${course.slug}`} className="group block h-full">
                <div className="bg-dark-900 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-dark-800 hover:border-primary-500 relative">

                    {/* Course Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-dark-800">
                        <img
                            src={getCourseThumbnail(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Live Now Badge */}
                        {course.isLive && (
                            <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse shadow-lg flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                                LIVE NOW
                            </div>
                        )}

                        {/* Bestseller Badge */}
                        {course.isBestseller && !course.isLive && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-dark-950 px-2 py-1 text-xs font-bold rounded">
                                Bestseller
                            </div>
                        )}

                        {/* New Course Badge */}
                        {course.isNew && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
                                New
                            </div>
                        )}

                        {/* Hot & New Badge */}
                        {course.isHot && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                                Hot & New
                            </div>
                        )}

                        {/* Level Badge */}
                        {course.level && (
                            <div className="absolute top-2 right-2 bg-dark-950/80 backdrop-blur-sm text-white px-2 py-1 text-xs font-medium rounded">
                                {course.level}
                            </div>
                        )}

                        {/* Update Badge */}
                        {course.lastUpdated && (
                            <div className="absolute bottom-2 left-2 bg-dark-950/80 backdrop-blur-sm text-white px-2 py-1 text-xs font-medium rounded">
                                Updated {course.lastUpdated}
                            </div>
                        )}

                        {/* Cart and Wishlist Buttons - Show on hover */}
                        <div className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            <button
                                onClick={handleWishlistAction}
                                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${inWishlist
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-dark-950/80 text-white hover:bg-primary-500'
                                    }`}
                                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={handleCartAction}
                                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${inCart
                                        ? 'bg-primary-500 text-dark-950 hover:bg-primary-600'
                                        : 'bg-dark-950/80 text-white hover:bg-primary-500'
                                    }`}
                                title={inCart ? 'Remove from cart' : 'Add to cart'}
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-4 flex-1 flex flex-col">
                        {/* Course Title */}
                        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                            {course.title}
                        </h3>

                        {/* Course Description/Headline */}
                        {course.headline && (
                            <p className="text-sm text-dark-300 mb-3 line-clamp-2">
                                {course.headline}
                            </p>
                        )}

                        {/* Instructor Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <img
                                src={getAvatarUrl(course.instructor?.avatar)}
                                alt={course.instructor?.name}
                                className="w-6 h-6 rounded-full border border-dark-700 object-cover"
                            />
                            <span className="text-sm text-dark-300 font-medium">
                                {course.instructor?.name}
                            </span>
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-white">
                                    {course.averageRating || '4.5'}
                                </span>
                            </div>
                            <span className="text-sm text-dark-400">
                                ({course.ratingsCount || '0'})
                            </span>
                        </div>

                        {/* Course Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-dark-400 mb-3">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDuration(course.duration)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-primary-500" />
                                <span>{course.enrollmentsCount || 0} students</span>
                            </div>
                        </div>

                        {/* Bottom Section - Price and Badge */}
                        <div className="mt-auto pt-3 border-t border-dark-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-white">
                                        {formatPrice(course.price)}
                                    </span>
                                    {course.originalPrice && course.originalPrice > course.price && (
                                        <span className="text-sm text-dark-500 line-through">
                                            ${course.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Certificate Badge */}
                                {course.hasCertificate && (
                                    <div className="flex items-center gap-1 text-xs text-dark-400">
                                        <Award className="w-3 h-3 text-primary-500" />
                                        <span>Certificate</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCard;
