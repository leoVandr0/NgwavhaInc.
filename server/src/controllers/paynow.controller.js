import { Paynow } from 'paynow';
import { User, Course, Enrollment, Transaction } from '../models/index.js';
import { emailTemplates, sendEmail } from '../config/email.js';

// Initialize Paynow with your integration details
// These should be stored in environment variables
const paynow = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID || 'INTEGRATION_ID',
    process.env.PAYNOW_INTEGRATION_KEY || 'INTEGRATION_KEY'
);

// Set result and return URLs
paynow.resultUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/payments/paynow/webhook`;
paynow.returnUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success`;

// @desc    Initiate PayNow Payment
// @route   POST /api/payments/paynow/initiate
// @access  Private
export const initiatePayNowPayment = async (req, res) => {
    try {
        const { courseId, method, email, name, phone, mobileMethod } = req.body;

        // Validate course exists
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

        // Create unique reference for this payment
        const paymentReference = `COURSE-${courseId}-USER-${req.user.id}-${Date.now()}`;

        // Create payment
        const payment = paynow.createPayment(paymentReference, email);
        payment.add(course.title, parseFloat(course.price));

        let response;

        if (method === 'web') {
            // Web-based payment (redirect to PayNow website)
            response = await paynow.send(payment);
            
            if (response.success) {
                // Save transaction record
                await Transaction.create({
                    userId: req.user.id,
                    courseId,
                    amount: course.price,
                    status: 'pending',
                    paymentMethod: 'paynow_web',
                    paynowPollUrl: response.pollUrl,
                    paynowReference: paymentReference,
                    metadata: {
                        email,
                        name,
                        redirectUrl: response.redirectUrl
                    }
                });

                res.json({
                    success: true,
                    redirectUrl: response.redirectUrl,
                    pollUrl: response.pollUrl,
                    reference: paymentReference
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: response.error || 'Failed to initiate payment'
                });
            }
        } else if (method === 'mobile') {
            // Mobile-based payment (EcoCash)
            if (!phone) {
                return res.status(400).json({ message: 'Phone number is required for mobile payments' });
            }

            response = await paynow.sendMobile(payment, phone, mobileMethod || 'ecocash');
            
            if (response.success) {
                // Save transaction record
                await Transaction.create({
                    userId: req.user.id,
                    courseId,
                    amount: course.price,
                    status: 'pending',
                    paymentMethod: 'paynow_mobile',
                    paynowPollUrl: response.pollUrl,
                    paynowReference: paymentReference,
                    metadata: {
                        email,
                        name,
                        phone,
                        mobileMethod: mobileMethod || 'ecocash',
                        instructions: response.instructions
                    }
                });

                res.json({
                    success: true,
                    pollUrl: response.pollUrl,
                    reference: paymentReference,
                    instructions: response.instructions
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: response.error || 'Failed to initiate mobile payment'
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }
    } catch (error) {
        console.error('PayNow payment initiation error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Failed to initiate payment' 
        });
    }
};

// @desc    Poll PayNow Transaction Status
// @route   POST /api/payments/paynow/poll
// @access  Private
export const pollPayNowTransaction = async (req, res) => {
    try {
        const { pollUrl } = req.body;

        if (!pollUrl) {
            return res.status(400).json({ message: 'Poll URL is required' });
        }

        // Poll the transaction status
        const status = await paynow.pollTransaction(pollUrl);

        // Update transaction record if found
        const transaction = await Transaction.findOne({
            where: { paynowPollUrl: pollUrl }
        });

        if (transaction) {
            transaction.status = status.paid() ? 'succeeded' : 
                               status.status() === 'cancelled' ? 'cancelled' : 
                               status.status() === 'failed' ? 'failed' : 'pending';
            
            if (status.paid()) {
                transaction.paidAt = new Date();
                
                // Create enrollment if payment was successful
                const existingEnrollment = await Enrollment.findOne({
                    where: { userId: transaction.userId, courseId: transaction.courseId }
                });

                if (!existingEnrollment) {
                    await Enrollment.create({
                        userId: transaction.userId,
                        courseId: transaction.courseId,
                        pricePaid: transaction.amount,
                        paymentId: transaction.paynowReference,
                        isCompleted: false,
                        progress: 0
                    });

                    // Update course enrollment count
                    const course = await Course.findByPk(transaction.courseId);
                    if (course) {
                        course.enrollmentsCount += 1;
                        await course.save();
                    }

                    // Send confirmation email
                    const user = await User.findByPk(transaction.userId);
                    if (user) {
                        const courseDetails = await Course.findByPk(transaction.courseId);
                        const template = emailTemplates.enrollmentConfirmation(user.name, courseDetails.title);
                        await sendEmail({
                            to: user.email,
                            ...template
                        });
                    }
                }
            }
            
            await transaction.save();
        }

        res.json({
            paid: status.paid(),
            status: status.status(),
            reference: status.reference()
        });
    } catch (error) {
        console.error('PayNow polling error:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to poll transaction status' 
        });
    }
};

// @desc    Handle PayNow Webhook
// @route   POST /api/payments/paynow/webhook
// @access  Public
export const handlePayNowWebhook = async (req, res) => {
    try {
        const { reference, status, hash } = req.body;

        // Verify the webhook is authentic (you should implement proper hash verification)
        // For now, we'll process the webhook

        // Find the transaction
        const transaction = await Transaction.findOne({
            where: { paynowReference: reference }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Update transaction status
        if (status === 'paid' || status === 'delivered') {
            transaction.status = 'succeeded';
            transaction.paidAt = new Date();

            // Create enrollment if not already exists
            const existingEnrollment = await Enrollment.findOne({
                where: { userId: transaction.userId, courseId: transaction.courseId }
            });

            if (!existingEnrollment) {
                await Enrollment.create({
                    userId: transaction.userId,
                    courseId: transaction.courseId,
                    pricePaid: transaction.amount,
                    paymentId: transaction.paynowReference,
                    isCompleted: false,
                    progress: 0
                });

                // Update course enrollment count
                const course = await Course.findByPk(transaction.courseId);
                if (course) {
                    course.enrollmentsCount += 1;
                    await course.save();
                }

                // Send confirmation email
                const user = await User.findByPk(transaction.userId);
                if (user) {
                    const courseDetails = await Course.findByPk(transaction.courseId);
                    const template = emailTemplates.enrollmentConfirmation(user.name, courseDetails.title);
                    await sendEmail({
                        to: user.email,
                        ...template
                    });
                }
            }
        } else if (status === 'cancelled') {
            transaction.status = 'cancelled';
        } else if (status === 'failed') {
            transaction.status = 'failed';
        }

        await transaction.save();

        res.json({ received: true });
    } catch (error) {
        console.error('PayNow webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

// @desc    Get Payment Status
// @route   GET /api/payments/paynow/status/:reference
// @access  Private
export const getPaymentStatus = async (req, res) => {
    try {
        const { reference } = req.params;

        const transaction = await Transaction.findOne({
            where: { 
                paynowReference: reference,
                userId: req.user.id 
            },
            include: [
                { model: Course, attributes: ['title', 'slug'] }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            status: transaction.status,
            amount: transaction.amount,
            paidAt: transaction.paidAt,
            course: transaction.Course
        });
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ message: error.message });
    }
};
