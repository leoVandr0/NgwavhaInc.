import { Course, User, Category, Enrollment, Review } from '../models/index.js';
import CourseContent from '../models/nosql/CourseContent.js';
import { Op } from 'sequelize';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                title: {
                    [Op.like]: `%${req.query.keyword}%`,
                },
            }
            : {};

        const categoryFilter = req.query.category
            ? { '$category.slug$': req.query.category }
            : {};

        const count = await Course.count({
            where: { ...keyword, status: 'published' },
            include: req.query.category ? [{ model: Category, as: 'category' }] : []
        });

        const courses = await Course.findAll({
            where: { ...keyword, status: 'published' },
            include: [
                { model: User, as: 'instructor', attributes: ['name', 'avatar'] },
                { model: Category, as: 'category', attributes: ['name', 'slug'] }
            ],
            limit: pageSize,
            offset: pageSize * (page - 1),
            order: [['createdAt', 'DESC']],
        });

        res.json({ courses, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course by slug
// @route   GET /api/courses/:slug
// @access  Public
export const getCourseBySlug = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar', 'bio', 'headline'] },
                { model: Category, as: 'category', attributes: ['name', 'slug'] },
                {
                    model: Review,
                    as: 'reviews',
                    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }],
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                }
            ],
        });

        if (course) {
            // Fetch content outline (without video URLs for non-enrolled)
            const content = await CourseContent.findOne({ courseId: course.id })
                .select('-sections.lectures.videoUrl -sections.lectures.resources.url');

            res.json({ ...course.toJSON(), content });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (req, res) => {
    try {
        const { title, description, price, categoryId, level } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            categoryId,
            level,
            instructorId: req.user.id,
            thumbnail: 'default-course.jpg',
        });

        // Initialize MongoDB content document
        const content = new CourseContent({
            courseId: course.id,
            sections: []
        });
        await content.save();

        // Link MongoDB ID to MySQL Course
        course.mongoContentId = content._id;
        await course.save();

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (course) {
            if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this course' });
            }

            course.title = req.body.title || course.title;
            course.description = req.body.description || course.description;
            course.price = req.body.price || course.price;
            course.categoryId = req.body.categoryId || course.categoryId;
            course.level = req.body.level || course.level;
            course.status = req.body.status || course.status;

            if (req.body.status === 'published' && !course.publishedAt) {
                course.publishedAt = new Date();
            }

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add section to course content
// @route   POST /api/courses/:id/sections
// @access  Private/Instructor
export const addSection = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });

        content.sections.push({
            title: req.body.title,
            lectures: []
        });

        await content.save();
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add lecture to section
// @route   POST /api/courses/:id/sections/:sectionId/lectures
// @access  Private/Instructor
export const addLecture = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const content = await CourseContent.findOne({ courseId: course.id });
        const section = content.sections.id(req.params.sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        section.lectures.push(req.body);
        await content.save();

        // Update MySQL aggregates
        course.totalLectures = content.totalLectures;
        course.totalDuration = content.totalDuration; // Assuming pre-save hook handles this
        await course.save();

        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
