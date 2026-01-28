// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
import authRoutes from './src/routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working' });
});

// Start server
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('API available at http://localhost:' + PORT + '/api');
});
