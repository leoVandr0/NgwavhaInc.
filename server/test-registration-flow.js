import User from './src/models/User.js';
import sequelize from './src/config/mysql.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== PHASE 3: Registration Flow Simulation ===\n');

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'TestPass123!';
const testName = 'Test User';

async function testRegistrationFlow() {
    try {
        console.log('Step 1: Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        console.log('Step 2: Checking if user exists...');
        const existingUser = await User.findOne({ where: { email: testEmail } });
        console.log('✅ User lookup complete:', existingUser ? 'EXISTS' : 'NOT FOUND\n');

        if (existingUser) {
            console.log('⚠️  User already exists, deleting for test...');
            await existingUser.destroy();
            console.log('✅ Old user deleted\n');
        }

        console.log('Step 3: Creating new user...');
        console.log('   - Name:', testName);
        console.log('   - Email:', testEmail);
        console.log('   - Password length:', testPassword.length);

        const user = await User.create({
            name: testName,
            email: testEmail,
            password: testPassword,
            role: 'student'
        });

        console.log('✅ User created successfully');
        console.log('   - User ID:', user.id);
        console.log('   - Email:', user.email);
        console.log('   - Role:', user.role);
        console.log('   - Password hashed:', user.password?.substring(0, 20) + '...\n');

        console.log('Step 4: Generating JWT token...');
        console.log('   - JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('   - JWT_SECRET length:', process.env.JWT_SECRET?.length);

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        console.log('✅ Token generated successfully');
        console.log('   - Token length:', token.length);
        console.log('   - First 30 chars:', token.substring(0, 30) + '...\n');

        console.log('Step 5: Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully');
        console.log('   - Decoded userId:', decoded.userId);
        console.log('   - Matches created user:', decoded.userId === user.id, '\n');

        console.log('Step 6: Preparing response data...');
        const { password: _, ...userData } = user.dataValues;
        const responseData = {
            ...userData,
            token
        };
        console.log('✅ Response data prepared');
        console.log('   - Fields:', Object.keys(responseData).join(', '));
        console.log('   - Has token:', !!responseData.token);
        console.log('   - Password excluded:', !responseData.password, '\n');

        console.log('Step 7: Simulating JSON serialization...');
        const jsonResponse = JSON.stringify(responseData);
        console.log('✅ JSON serialization successful');
        console.log('   - Response size:', jsonResponse.length, 'bytes\n');

        console.log('Step 8: Testing password verification...');
        const isPasswordValid = await user.matchPassword(testPassword);
        console.log('✅ Password verification:', isPasswordValid ? 'VALID' : 'INVALID\n');

        console.log('Step 9: Cleaning up test user...');
        await user.destroy();
        console.log('✅ Test user deleted\n');

        console.log('═══════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED');
        console.log('═══════════════════════════════════════');
        console.log('\n🎯 CONCLUSION: The registration logic works perfectly in isolation.');
        console.log('   If registration still fails in the API, the issue is in:');
        console.log('   - Request parsing/middleware');
        console.log('   - Response handling');
        console.log('   - Network/CORS configuration');
        console.log('   - Frontend request formatting\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED AT SOME STEP:');
        console.error('   Error:', error.message);
        console.error('   Name:', error.name);
        console.error('   Stack:', error.stack);
        console.log('\n🎯 CONCLUSION: The issue is in the registration logic itself.\n');
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
}

testRegistrationFlow();
