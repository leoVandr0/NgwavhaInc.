import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== JWT Environment Test ===\n');

// Test 1: Check if JWT_SECRET exists
console.log('1. JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('   Length:', process.env.JWT_SECRET?.length || 0);
console.log('   First 10 chars:', process.env.JWT_SECRET?.substring(0, 10) || 'MISSING');

// Test 2: Try to generate a token
console.log('\n2. Attempting token generation...');
try {
    const testUserId = 'test-user-123';
    const token = jwt.sign(
        { userId: testUserId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    console.log('   ✅ Token generated successfully');
    console.log('   Token length:', token.length);
    console.log('   First 20 chars:', token.substring(0, 20));

    // Test 3: Try to verify the token
    console.log('\n3. Attempting token verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('   ✅ Token verified successfully');
    console.log('   Decoded userId:', decoded.userId);
    console.log('   Expires in:', new Date(decoded.exp * 1000).toISOString());

    console.log('\n✅ ALL TESTS PASSED - JWT is working correctly');
} catch (error) {
    console.error('   ❌ ERROR:', error.message);
    console.error('   Stack:', error.stack);
    console.log('\n❌ JWT TEST FAILED');
}

console.log('\n=== Test Complete ===');
process.exit(0);
