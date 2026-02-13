import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== PHASE 4: Request/Response Diagnostic Server ===\n');

const app = express();

// Middleware to log EVERYTHING
app.use((req, res, next) => {
    console.log('\n📨 INCOMING REQUEST:');
    console.log('   Method:', req.method);
    console.log('   URL:', req.url);
    console.log('   Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Body parser
app.use(express.json());

// Log parsed body
app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('   Parsed Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Test endpoint that mimics registration
app.post('/api/test-register', (req, res) => {
    console.log('\n🎯 TEST REGISTER ENDPOINT HIT');
    console.log('   Body received:', req.body);

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields',
                received: { name: !!name, email: !!email, password: !!password }
            });
        }

        console.log('✅ All fields present');
        console.log('   Preparing response...');

        const response = {
            message: 'Test successful',
            receivedData: {
                name,
                email,
                passwordLength: password.length
            },
            token: 'test-token-123'
        };

        console.log('   Sending response:', JSON.stringify(response, null, 2));
        res.status(201).json(response);
        console.log('✅ Response sent');

    } catch (error) {
        console.error('❌ Error in test endpoint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Catch all
app.use((req, res) => {
    console.log('❌ Route not found:', req.url);
    res.status(404).json({ message: 'Not found' });
});

const PORT = 3333;
app.listen(PORT, () => {
    console.log(`\n✅ Diagnostic server running on http://localhost:${PORT}`);
    console.log('\nTest it with:');
    console.log('curl -X POST http://localhost:3333/api/test-register \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"name":"Test","email":"test@example.com","password":"Pass123!"}\'');
    console.log('\nOr use your frontend pointed to port 3333\n');
});
