import { Category } from '../models/index.js';
import slug from 'slug';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { parentId: null },
            include: [{ model: Category, as: 'subcategories' }]
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, parentId, icon } = req.body;
        const category = await Category.create({
            name,
            slug: slug(name).toLowerCase(),
            parentId,
            icon
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed categories if empty
export const seedCategories = async () => {
    try {
        const count = await Category.count();
        if (count === 0) {
            const defaultCategories = [
                { name: 'Web Development', slug: 'web-development' },
                { name: 'Data Science', slug: 'data-science' },
                { name: 'Mobile Development', slug: 'mobile-development' },
                { name: 'UI/UX Design', slug: 'ui-ux-design' },
                { name: 'Business', slug: 'business' },
                { name: 'Marketing', slug: 'marketing' }
            ];
            await Category.bulkCreate(defaultCategories);
            console.log(' Default categories seeded successfully');
        }
    } catch (error) {
        console.error(' Failed to seed categories:', error.message);
        // Don't throw error, just log it
    }
};
