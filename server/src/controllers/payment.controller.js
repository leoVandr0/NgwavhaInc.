import stripe from '../config/stripe.js';
import { User, Course, Enrollment, Transaction } from '../models/index.js';
import { emailTemplates, sendEmail } from '../config/email.js';

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            where: { userId: req.user.id, courseId }
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(course.price * 100), // Stripe expects cents
            currency: 'usd',
            metadata: {
                userId: req.user.id,
                courseId: course.id,
                courseName: course.title
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle Stripe Webhook
// @route   POST /api/webhooks/stripe
// @access  Public
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, courseId, courseName } = paymentIntent.metadata;

        try {
            // 1. Create Enrollment
            await Enrollment.create({
                userId,
                courseId,
                pricePaid: paymentIntent.amount / 100,
                paymentId: paymentIntent.id,
                isCompleted: false,
                progress: 0
            });

            // 2. Record Transaction
            await Transaction.create({
                userId,
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                status: 'succeeded',
                paymentMethod: 'card' // Simplified
            });

            // 3. Update Course Stats
            const course = await Course.findByPk(courseId);
            if (course) {
                course.enrollmentsCount += 1;
                await course.save();
            }

            // 4. Send Confirmation Email
            const user = await User.findByPk(userId);
            if (user) {
                const template = emailTemplates.enrollmentConfirmation(user.name, courseName);
                await sendEmail({
                    to: user.email,
                    ...template
                });
            }

            console.log(`✅ Enrollment created for user ${userId} in course ${courseId}`);
        } catch (error) {
            console.error('Error processing successful payment:', error);
            // Don't return error to Stripe, otherwise it will retry
        }
    }

    res.json({ received: true });
};
