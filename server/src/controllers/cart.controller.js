import { CartItem, Course, User } from '../models/index.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const cartItems = await CartItem.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'price', 'thumbnail', 'instructorId', 'slug'], // Added slug
                    include: [
                        { model: User, as: 'instructor', attributes: ['name'] }
                    ]
                }
            ]
        });

        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add course to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { courseId } = req.body;

        const exists = await CartItem.findOne({
            where: { userId: req.user.id, courseId }
        });

        if (exists) {
            return res.status(400).json({ message: 'Course already in cart' });
        }

        const cartItem = await CartItem.create({
            userId: req.user.id,
            courseId
        });

        // Fetch the full cart item with course details to return
        const fullCartItem = await CartItem.findByPk(cartItem.id, {
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'price', 'thumbnail', 'slug'],
                    include: [
                        { model: User, as: 'instructor', attributes: ['name'] }
                    ]
                }
            ]
        })

        res.status(201).json(fullCartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove course from cart
// @route   DELETE /api/cart/:courseId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const { courseId } = req.params;

        const deleted = await CartItem.destroy({
            where: { userId: req.user.id, courseId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Removed from cart', courseId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
