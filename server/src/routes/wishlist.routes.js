import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getWishlist)
    .post(protect, addToWishlist);

router.route('/:courseId')
    .delete(protect, removeFromWishlist);

export default router;
