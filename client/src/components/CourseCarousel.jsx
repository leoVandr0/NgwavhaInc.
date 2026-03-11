import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseCardMobile from './CourseCardMobile';

const CourseCarousel = ({ courses, title, subtitle }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 10
            );
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollability);
            checkScrollability();
            return () => container.removeEventListener('scroll', checkScrollability);
        }
    }, [courses]);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!courses || courses.length === 0) return null;

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
                <div>
                    {title && (
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-sm text-dark-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Navigation Arrows - Hidden on small mobile, shown on larger screens */}
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-full transition-all duration-200 ${
                            canScrollLeft
                                ? 'bg-dark-800 text-white hover:bg-primary-500 hover:text-dark-950'
                                : 'bg-dark-900 text-dark-600 cursor-not-allowed'
                        }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-full transition-all duration-200 ${
                            canScrollRight
                                ? 'bg-dark-800 text-white hover:bg-primary-500 hover:text-dark-950'
                                : 'bg-dark-900 text-dark-600 cursor-not-allowed'
                        }`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-0"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    {courses.map((course, index) => (
                        <CourseCardMobile
                            key={course.id}
                            course={course}
                            index={index}
                        />
                    ))}
                </div>

                {/* Fade edges for visual indication of scroll */}
                <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-dark-900 to-transparent pointer-events-none sm:hidden" />
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-dark-900 to-transparent pointer-events-none sm:hidden" />
            </div>

            {/* Custom Scrollbar Hide Styles */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default CourseCarousel;
