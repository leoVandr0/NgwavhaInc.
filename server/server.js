// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
