import express from 'express';
import { createPaymentIntent, handleStripeWebhook } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
// Webhook route is defined in index.js to handle raw body, but we can document it here
// router.post('/webhook', handleStripeWebhook);

export default router;
