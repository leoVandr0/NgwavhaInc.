// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { connectMySQL } from './src/config/mysql.js';
import connectMongoDB from './src/config/mongodb.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

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
import liveSessionRoutes from './src/routes/liveSession.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import { seedCategories } from './src/controllers/category.controller.js';
import configurePassport from './src/config/passport.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// Store connected admins for real-time updates
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
app.use('/api/live-sessions', liveSessionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

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

// SPA fallback - for React Router (must come after API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server immediately (don't wait for DB)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Handle admin dashboard connection
    socket.on('join-admin-dashboard', (userData) => {
        if (userData && userData.role === 'admin') {
            connectedAdmins.add(socket.id);
            socket.join('admin-dashboard');
            console.log('👨‍💼 Admin joined dashboard:', socket.id);

            // Send current stats to newly connected admin
            socket.emit('stats-update', {
                type: 'initial',
                message: 'Connected to admin dashboard'
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        connectedAdmins.delete(socket.id);
        socket.leave('admin-dashboard');
        console.log('🔌 Socket disconnected:', socket.id);
    });
});

// Function to broadcast real-time updates to all connected admins
const broadcastToAdmins = (event, data) => {
    io.to('admin-dashboard').emit(event, data);
    console.log(`📊 Broadcasting to ${connectedAdmins.size} admins:`, event);
};

// Make broadcast function available globally
global.broadcastToAdmins = broadcastToAdmins;

// Database connections (non-blocking)
connectMySQL().then(async (sequelize) => {
    if (sequelize) {
        console.log('✅ MySQL connected successfully');
        
        // Run notification preferences migration
        try {
            console.log('🔄 Running notification preferences migration...');
            const { up } = await import('./src/migrations/add-notification-preferences.js');
            await up();
            console.log('✅ Notification preferences migration completed');
        } catch (migrationError) {
            if (migrationError.message.includes('Duplicate column name')) {
                console.log('✅ Notification preferences columns already exist');
            } else {
                console.error('❌ Migration failed:', migrationError.message);
            }
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
