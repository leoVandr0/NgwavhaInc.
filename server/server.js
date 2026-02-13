// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { connectMySQL } from './src/config/mysql.js';
import connectMongoDB from './src/config/mongodb.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import liveSessionRoutes from './src/routes/liveSession.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import { seedCategories } from './src/controllers/category.controller.js';
import configurePassport from './src/config/passport.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the frontend build with caching
const publicPath = path.join(__dirname, 'public');
app.use(compression());
app.use(express.static(publicPath, {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));

// Middleware
app.use(cors());
app.use(express.json());

// Session configuration (using Railway environment variables)
const sessionStore = new (MySQLStore(session))({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'ngwavha-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
const uploadPath = process.env.UPLOAD_PATH || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadPath), {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));

// API routes (must come before SPA fallback)
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/live-sessions', liveSessionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working' });
});

// SPA fallback - for React Router (must come after API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server immediately (don't wait for DB)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});

// Database connections (non-blocking)
connectMySQL().then((sequelize) => {
    if (sequelize) {
        console.log('✅ MySQL connected successfully');
        seedCategories().catch((error) => {
            console.error('❌ Category seeding failed:', error.message);
        });
    } else {
        console.log('⚠️ MySQL not available, skipping category seeding');
    }
}).catch((error) => {
    console.log('⚠️ MySQL connection failed, continuing without MySQL...');
    console.log('⚠️ Some features may not work without database');
});

connectMongoDB().catch((error) => {
    console.log('⚠️ MongoDB connection failed, continuing without MongoDB...');
    console.log('⚠️ Some features may not work without database');
});
