import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMySQL as connectDB } from './config/mysql.js';
import connectMongoDB from './config/mongodb.js';
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
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import './models/index.js'; // Ensure models are registered

dotenv.config();

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

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Fix the console.log statement
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
