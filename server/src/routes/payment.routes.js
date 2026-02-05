import express from 'express';
import { createPaymentIntent, handleStripeWebhook } from '../controllers/payment.controller.js';
import { 
    initiatePayNowPayment, 
    pollPayNowTransaction, 
    handlePayNowWebhook, 
    getPaymentStatus 
} from '../controllers/paynow.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Stripe routes (existing)
router.post('/create-intent', protect, createPaymentIntent);
// Webhook route is defined in index.js to handle raw body, but we can document it here
// router.post('/webhook', handleStripeWebhook);

// PayNow routes
router.post('/paynow/initiate', protect, initiatePayNowPayment);
router.post('/paynow/poll', protect, pollPayNowTransaction);
router.post('/paynow/webhook', handlePayNowWebhook);
router.get('/paynow/status/:reference', protect, getPaymentStatus);

export default router;
