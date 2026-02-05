import { User, Course, Review, Enrollment } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get public instructors list with filtering and sorting
// @route   GET /api/instructors/public
// @access  Public
export const getPublicInstructors = async (req, res) => {
    try {
        const { search = '', sort = 'rating', filter = 'all' } = req.query;

        // Build where clause for instructors
        const whereClause = {
            role: 'instructor',
            isActive: true
        };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { headline: { [Op.like]: `%${search}%` } },
                { bio: { [Op.like]: `%${search}%` } }
            ];
        }

        // Add filters
        if (filter === 'top-rated') {
            whereClause.averageRating = { [Op.gte]: 4.5 };
        } else if (filter === 'new') {
            whereClause.createdAt = { [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }; // Last 90 days
        } else if (filter === 'verified') {
            whereClause.isVerified = true;
        }

        // Get instructors with their stats
        const instructors = await User.findAll({
            where: whereClause,
            attributes: [
                'id', 'name', 'email', 'avatar', 'headline', 'bio', 'location', 
                'averageRating', 'totalReviews', 'isVerified', 'createdAt'
            ],
            include: [
                {
                    model: Course,
                    as: 'courses',
                    attributes: ['id', 'title', 'price', 'thumbnail', 'averageRating', 'enrollmentsCount'],
                    where: { isPublished: true },
                    required: false
                }
            ]
        });

        // Calculate additional stats for each instructor
        const instructorsWithStats = await Promise.all(
            instructors.map(async (instructor) => {
                const instructorData = instructor.toJSON();

                // Get total students count
                const totalStudentsResult = await Enrollment.sum('userId', {
                    include: [
                        {
                            model: Course,
                            where: { instructorId: instructor.id }
                        }
                    ]
                });

                // Get total videos count
                const totalVideosResult = await Course.sum('contentCount', {
                    where: { instructorId: instructor.id }
                });

                // Get expertise areas from course categories
                const courses = await Course.findAll({
                    where: { instructorId: instructor.id },
                    include: [{ model: require('../models').Category, as: 'category' }]
                });

                const expertise = [...new Set(courses.map(course => course.category?.name).filter(Boolean))];

                // Determine if top rated
                const isTopRated = instructorData.averageRating >= 4.8 && instructorData.totalReviews >= 10;

                return {
                    ...instructorData,
                    totalStudents: totalStudentsResult || 0,
                    totalCourses: instructor.courses?.length || 0,
                    totalVideos: totalVideosResult || 0,
                    expertise,
                    isTopRated,
                    courses: instructor.courses || []
                };
            })
        );

        // Sort instructors
        let sortedInstructors = [...instructorsWithStats];
        switch (sort) {
            case 'rating':
                sortedInstructors.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            case 'students':
                sortedInstructors.sort((a, b) => b.totalStudents - a.totalStudents);
                break;
            case 'courses':
                sortedInstructors.sort((a, b) => b.totalCourses - a.totalCourses);
                break;
            case 'reviews':
                sortedInstructors.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
                break;
            default:
                // Default sort by rating
                sortedInstructors.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        }

        res.json(sortedInstructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Failed to fetch instructors' });
    }
};

// @desc    Get instructor details with courses
// @route   GET /api/instructors/:id
// @access  Public
export const getInstructorDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const instructor = await User.findOne({
            where: { 
                id, 
                role: 'instructor', 
                isActive: true 
            },
            attributes: [
                'id', 'name', 'email', 'avatar', 'headline', 'bio', 'location',
                'averageRating', 'totalReviews', 'isVerified', 'createdAt'
            ]
        });

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        // Get instructor's courses
        const courses = await Course.findAll({
            where: { 
                instructorId: id, 
                isPublished: true 
            },
            include: [
                { model: require('../models').Category, as: 'category' }
            ],
            order: [['enrollmentsCount', 'DESC']]
        });

        // Get stats
        const totalStudents = await Enrollment.sum('userId', {
            include: [
                {
                    model: Course,
                    where: { instructorId: id }
                }
            ]
        });

        const totalReviews = await Review.count({
            include: [
                {
                    model: Course,
                    where: { instructorId: id }
                }
            ]
        });

        // Get expertise areas
        const expertise = [...new Set(courses.map(course => course.category?.name).filter(Boolean))];

        res.json({
            instructor: instructor.toJSON(),
            courses,
            stats: {
                totalStudents: totalStudents || 0,
                totalCourses: courses.length,
                totalReviews,
                expertise
            }
        });
    } catch (error) {
        console.error('Error fetching instructor details:', error);
        res.status(500).json({ message: 'Failed to fetch instructor details' });
    }
};
