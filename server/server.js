// server.js
import express from 'express';
import healthRoutes from './src/routes/health.routes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

import passport from 'passport';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import compression from 'compression';
import { createServer } from 'http';
import { connectMySQL } from './src/config/mysql.js';
import connectMongoDB from './src/config/mongodb.js';

// Debug environment variables
console.log('\n🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('MYSQLHOST exists:', !!process.env.MYSQLHOST);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('🔍 End Environment Debug\n');

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import instructorRoutes from './src/routes/instructor.routes.js';
import liveSessionRoutes from './src/routes/liveSession.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import { seedCategories } from './src/controllers/category.controller.js';
import configurePassport from './src/config/passport.js';
import realtimeService from './src/services/realtime.service.js';

const app = express();
// Health check endpoint
if (typeof app.use === 'function') {
    app.use('/health', healthRoutes);
}
const PORT = process.env.PORT || 8080;

// Create HTTP server first
const server = createServer(app);

// Initialize real-time service (will create its own Socket.IO instance)
realtimeService.initialize(server);

// Store connected admins for real-time updates (for fallback)
const connectedAdmins = new Set();

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
app.use('/api/instructors', instructorRoutes);
app.use('/api/live-sessions', liveSessionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working' });
});

// Health check with environment validation
app.get('/api/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
            nodeEnv: process.env.NODE_ENV || 'not set',
            jwtSecretExists: !!process.env.JWT_SECRET,
            jwtSecretLength: process.env.JWT_SECRET?.length || 0,
            mongodbConfigured: !!process.env.MONGODB_URI,
            mysqlConfigured: !!(process.env.DATABASE_URL || process.env.MYSQLHOST)
        }
    };
    res.json(health);
});

// TEMPORARY ADMIN SETUP FOR RAILWAY - REMOVE AFTER USE
app.post('/create-railway-admin', async (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
        return res.status(403).json({ error: 'This endpoint is for production only' });
    }

    try {
        console.log('🔧 Creating Railway admin account...');

        // Import required modules
        // Use already imported bcrypt and uuid (if available) or dynamic import
        const bcrypt = (await import('bcryptjs')).default;
        const { v4: uuidv4 } = await import('uuid');

        // Import User model properly
        const { default: User } = await import('./src/models/User.js');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@ngwavha.com' } });

        if (existingAdmin) {
            // Update existing admin - NO manual hashing
            await existingAdmin.update({
                password: 'admin123',
                role: 'admin',
                isVerified: true,
                isApproved: true
            });
            console.log('✅ Updated existing Railway admin account');
        } else {
            // Create new admin - NO manual hashing
            await User.create({
                id: uuidv4(),
                name: 'Admin User',
                email: 'admin@ngwavha.com',
                password: 'admin123',
                role: 'admin',
                isVerified: true,
                isApproved: true
            });
            console.log('✅ Created new Railway admin account');
        }

        res.json({
            success: true,
            message: 'Railway admin account created successfully!',
            login: {
                email: 'admin@ngwavha.com',
                password: 'admin123'
            },
            next_steps: [
                '1. Go to your Railway app login page',
                '2. Use these credentials to login as admin',
                '3. Remove this endpoint from server.js for security',
                '4. Change the default password after first login'
            ]
        });
    } catch (error) {
        console.error('❌ Error creating Railway admin:', error);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).json({
            error: 'Failed to create admin account',
            details: error.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
        });
    }
});

// SPA fallback - for React Router (must come after API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Attach Express app to same HTTP server that Socket.IO uses (required for real-time)
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Socket.IO enabled for real-time admin dashboard`);
});

// Database connections (non-blocking)
connectMySQL().then(async (sequelize) => {
    if (sequelize) {
        console.log('✅ MySQL connected successfully');
        // Auto-seed Railway admin account for production login (single, idempotent seed)
        try {
            const { seedRailwayAdmin } = await import('./src/utils/adminSeed.js');
            await seedRailwayAdmin();
        } catch (err) {
            console.error('⚠ Railway admin seed failed:', err?.message);
        }

        // Run notification preferences migration
        try {
            console.log('🔄 Running notification preferences migration...');
            const { up } = await import('./src/migrations/add-notification-preferences.js');
            await up();
            console.log('✅ Notification preferences migration completed');
        } catch (migrationError) {
            console.error('❌ Migration failed:', migrationError.message);
        }

        // Run Phase 2 Admin Migrations (Critical for User table columns)
        try {
            console.log('🔄 Running Phase 2 admin migrations...');
            const { up } = await import('./src/migrations/phase2-admin-updates.js');
            await up();
            console.log('✅ Phase 2 admin migrations completed');
        } catch (migrationError) {
            console.error('❌ Phase 2 admin migrations failed:', migrationError.message);
        }

        // Run Audit Log migration
        try {
            console.log('🔄 Running audit log migration...');
            const { up } = await import('./src/migrations/add-audit-log.js');
            await up();
            console.log('✅ Audit log migration completed');
        } catch (migrationError) {
            console.error('❌ Audit log migration failed:', migrationError.message);
        }

        // Run instructor approval migration
        try {
            console.log('🔄 Running instructor approval migration...');
            const { up } = await import('./src/migrations/add-instructor-approval.js');
            await up();
            console.log('✅ Instructor approval migration completed');
        } catch (migrationError) {
            console.error('❌ Instructor approval migration failed:', migrationError.message);
        }

        // Run instructor rejection migration
        try {
            console.log('🔄 Running instructor rejection migration...');
            const { up } = await import('./src/migrations/add-instructor-rejection.js');
            await up();
            console.log('✅ Instructor rejection migration completed');
        } catch (migrationError) {
            console.error('❌ Instructor rejection migration failed:', migrationError.message);
        }

        // Run instructor status migration
        try {
            console.log('🔄 Running instructor status migration...');
            const { up } = await import('./src/migrations/add-instructor-status.js');
            await up();
            console.log('✅ Instructor status migration completed');
        } catch (migrationError) {
            console.error('❌ Instructor status migration failed:', migrationError.message);
        }

        // Run course preview video path migration (ensure DB supports preview_video_path)
        try {
            console.log('🔄 Running course preview video path migration...');
            const { up } = await import('./src/migrations/add-course-preview-video-path.js');
            await up();
            console.log('✅ Course preview video path migration completed');
        } catch (migrationError) {
            console.error('❌ Course preview video path migration failed:', migrationError.message);
        }

        // Run enrollment archive migration
        try {
            console.log('🔄 Running enrollment archive migration...');
            const { up } = await import('./src/migrations/add-is-archived-to-enrollment.js');
            await up();
            console.log('✅ Enrollment archive migration completed');
        } catch (migrationError) {
            console.error('❌ Enrollment archive migration failed:', migrationError.message);
        }

        // Run holistic course schema fix (adds all missing preview columns)
        try {
            console.log('🔄 Running holistic course schema fix...');
            const { up } = await import('./src/migrations/fix-course-schema.js');
            await up();
            console.log('✅ Course schema fix completed');
        } catch (migrationError) {
            console.error('❌ Course schema fix failed:', migrationError.message);
        }

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
