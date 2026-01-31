import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getCart)
    .post(protect, addToCart);

router.route('/:courseId')
    .delete(protect, removeFromCart);

export default router;
