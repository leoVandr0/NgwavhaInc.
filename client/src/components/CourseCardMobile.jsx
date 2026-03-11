import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCourseThumbnail } from '../utils/imageUtils';

const CourseCardMobile = ({ course, index }) => {
    const formatPrice = (price) => {
        if (price === 0 || price === '0.00') return 'Free';
        return `$${price}`;
    };

    // Calculate discount percentage
    const getDiscount = () => {
        if (course.originalPrice && course.originalPrice > course.price) {
            const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);
            return discount;
        }
        return 0;
    };

    const discount = getDiscount();

    // Render star rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="relative w-3 h-3">
                        <Star className="w-3 h-3 text-dark-600 fill-dark-600 absolute" />
                        <div className="absolute overflow-hidden w-[50%]">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </div>
                    </div>
                );
            } else {
                stars.push(<Star key={i} className="w-3 h-3 text-dark-600 fill-dark-600" />);
            }
        }
        return stars;
    };

    const rating = course.averageRating ? parseFloat(course.averageRating) : 4.5;
    const reviewCount = course.ratingsCount || course.reviewsCount || 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex-shrink-0 w-[72vw] sm:w-[45vw] md:w-[35vw] lg:w-auto"
        >
            <Link to={`/course/${course.slug}`} className="block h-full">
                <div className="bg-dark-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-dark-800 flex flex-col">
                    {/* Course Thumbnail - 16:9 Aspect Ratio */}
                    <div className="relative aspect-video overflow-hidden bg-dark-800">
                        <img
                            src={getCourseThumbnail(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        
                        {/* Bestseller Badge */}
                        {course.isBestseller && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-dark-950 px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase tracking-wide">
                                Bestseller
                            </div>
                        )}

                        {/* Discount Badge */}
                        {discount > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold rounded-sm">
                                -{discount}%
                            </div>
                        )}
                    </div>

                    {/* Course Content */}
                    <div className="p-3 flex-1 flex flex-col">
                        {/* Course Title - 2 lines max */}
                        <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-2 leading-tight min-h-[2.5em]">
                            {course.title}
                        </h3>

                        {/* Instructor Name - Light grey */}
                        <p className="text-xs text-dark-400 mb-2 truncate">
                            {course.instructor?.name || 'Unknown Instructor'}
                        </p>

                        {/* Rating Stars with Count */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center gap-0.5">
                                {renderStars(rating)}
                            </div>
                            <span className="text-xs font-semibold text-yellow-500">
                                {rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-dark-500">
                                ({reviewCount.toLocaleString()})
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="mt-auto flex items-center gap-2">
                            <span className="text-base font-bold text-white">
                                {formatPrice(course.price)}
                            </span>
                            {course.originalPrice && course.originalPrice > course.price && (
                                <span className="text-xs text-dark-500 line-through">
                                    {formatPrice(course.originalPrice)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCardMobile;
