import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMySQL as connectDB } from './config/mysql.js';
import connectMongoDB from './config/mongodb.js';
import { server } from './config/websocket.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import categoryRoutes from './routes/category.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import instructorRoutes from './routes/instructor.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import healthRoutes from './routes/health.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import referralRoutes from './routes/referral.routes.js';
import setupRoutes from './routes/setup.routes.js';
import dbTestRoutes from './routes/db-test.routes.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import './models/index.js'; // Ensure models are registered

// Only load .env file in development
// In production (Railway), env vars are set directly
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Log environment variables for debugging (redact sensitive info)
console.log('🔧 Environment Check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  R2_ENDPOINT:', process.env.R2_ENDPOINT);
console.log('  R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
console.log('  R2_ACCESS_KEY_ID exists:', !!process.env.R2_ACCESS_KEY_ID);
console.log('  JWT_SECRET exists:', !!process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Connect to databases
connectDB(); // MySQL

// MongoDB connection (optional)
if (process.env.NODE_ENV !== 'test') {
  connectMongoDB().catch(console.error);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/db', dbTestRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server enabled for real-time updates`);
});

export default app;
