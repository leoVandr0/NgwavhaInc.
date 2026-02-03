// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
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
import { seedCategories } from './src/controllers/category.controller.js';
import configurePassport from './src/config/passport.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Session configuration
const sessionStore = new (MySQLStore(session))({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'ngwavha-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Database connections
connectMySQL().then(() => {
    seedCategories().catch(console.error);
}).catch(console.error);
connectMongoDB().catch(console.error);

// Static uploads
const uploadPath = process.env.UPLOAD_PATH || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadPath)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/live-sessions', liveSessionRoutes);

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working' });
});

// Start server
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('API available at http://localhost:' + PORT + '/api');
});
