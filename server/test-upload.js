// Test upload functionality
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:8080/api';

// Test 1: Check if upload routes exist
async function testUploadRoutes() {
    console.log('🧪 Testing upload routes...');
    
    try {
        // Test course-thumbnail route
        const thumbnailResponse = await fetch(`${API_BASE}/upload/course-thumbnail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: true })
        });
        
        console.log('📸 Course thumbnail route status:', thumbnailResponse.status);
        
        // Test profile-photo route
        const avatarResponse = await fetch(`${API_BASE}/upload/profile-photo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: true })
        });
        
        console.log('👤 Profile photo route status:', avatarResponse.status);
        
        if (thumbnailResponse.status !== 400 && avatarResponse.status !== 400) {
            console.log('❌ Upload routes may not be properly configured');
        } else {
            console.log('✅ Upload routes are accessible (400 expected without file)');
        }
        
    } catch (error) {
        console.error('❌ Upload routes test failed:', error.message);
    }
}

// Test 2: Check R2 configuration
function testR2Config() {
    console.log('\n🧪 Testing R2 configuration...');
    
    const r2Vars = {
        R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
        R2_ENDPOINT: !!process.env.R2_ENDPOINT,
        R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
        R2_PUBLIC_URL: !!process.env.R2_PUBLIC_URL
    };
    
    console.log('🔍 R2 Environment Variables:', r2Vars);
    
    const allPresent = Object.values(r2Vars).every(v => v === true);
    
    if (allPresent) {
        console.log('✅ All R2 variables are present');
    } else {
        console.log('⚠️ Some R2 variables are missing - will fallback to local storage');
    }
}

// Test 3: Check upload directory
function testUploadDirectory() {
    console.log('\n🧪 Testing upload directory...');
    
    const uploadPath = process.env.UPLOAD_PATH || 'uploads';
    const fullPath = path.join(process.cwd(), uploadPath);
    
    try {
        if (fs.existsSync(fullPath)) {
            console.log('✅ Upload directory exists:', fullPath);
            const stats = fs.statSync(fullPath);
            console.log('📁 Directory permissions:', stats.mode.toString(8));
        } else {
            console.log('⚠️ Upload directory does not exist, creating...');
            fs.mkdirSync(fullPath, { recursive: true });
            console.log('✅ Upload directory created:', fullPath);
        }
    } catch (error) {
        console.error('❌ Upload directory error:', error.message);
    }
}

// Test 4: Create a test image file
function createTestImage() {
    console.log('\n🧪 Creating test image...');
    
    // Create a simple 1x1 pixel PNG (base64)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(pngBase64, 'base64');
    
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    
    try {
        fs.writeFileSync(testImagePath, buffer);
        console.log('✅ Test image created:', testImagePath);
        return testImagePath;
    } catch (error) {
        console.error('❌ Failed to create test image:', error.message);
        return null;
    }
}

// Test 5: Test actual file upload (simplified)
async function testFileUpload(imagePath) {
    console.log('\n🧪 Testing actual file upload...');
    
    if (!imagePath) {
        console.log('❌ No test image available');
        return;
    }
    
    try {
        // For now, just test that the route exists without actual file upload
        console.log('📤 Skipping actual upload test - requires authentication');
        console.log('📤 To test actual upload, you need to:');
        console.log('   1. Start the server');
        console.log('   2. Login to get a token');
        console.log('   3. Use the token in Authorization header');
        
    } catch (error) {
        console.error('❌ File upload test failed:', error.message);
    } finally {
        // Cleanup
        try {
            fs.unlinkSync(imagePath);
            console.log('🧹 Test image cleaned up');
        } catch (error) {
            console.log('⚠️ Could not cleanup test image:', error.message);
        }
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting upload functionality tests...\n');
    
    await testUploadRoutes();
    testR2Config();
    testUploadDirectory();
    
    const testImage = createTestImage();
    await testFileUpload(testImage);
    
    console.log('\n✅ Upload tests completed!');
}

// Run tests
runAllTests().catch(console.error);
