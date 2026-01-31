import { WishlistItem, Course, User } from '../models/index.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        const wishlistItems = await WishlistItem.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'price', 'thumbnail', 'averageRating', 'ratingsCount', 'slug'], // Added slug
                    include: [
                        { model: User, as: 'instructor', attributes: ['name'] }
                    ]
                }
            ]
        });

        res.json(wishlistItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add course to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;

        const exists = await WishlistItem.findOne({
            where: { userId: req.user.id, courseId }
        });

        if (exists) {
            return res.status(400).json({ message: 'Course already in wishlist' });
        }

        const wishlistItem = await WishlistItem.create({
            userId: req.user.id,
            courseId
        });

        const fullWishlistItem = await WishlistItem.findByPk(wishlistItem.id, {
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'price', 'thumbnail', 'averageRating', 'ratingsCount', 'slug'],
                    include: [
                        { model: User, as: 'instructor', attributes: ['name'] }
                    ]
                }
            ]
        })

        res.status(201).json(fullWishlistItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove course from wishlist
// @route   DELETE /api/wishlist/:courseId
// @access  Private
export const removeFromWishlist = async (req, res) => {
    try {
        const { courseId } = req.params;

        const deleted = await WishlistItem.destroy({
            where: { userId: req.user.id, courseId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        res.json({ message: 'Removed from wishlist', courseId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
