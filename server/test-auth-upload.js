// Test authenticated upload
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:8080/api';

// Test login and upload
async function testAuthUpload() {
    console.log('🧪 Testing authenticated upload...\n');
    
    try {
        // Step 1: Try to login with test credentials
        console.log('🔐 Attempting login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        if (loginResponse.status === 401) {
            console.log('⚠️ Login failed - test user not found');
            console.log('💡 To test uploads, you need to:');
            console.log('   1. Register a new user in the app');
            console.log('   2. Login with that user');
            console.log('   3. Then try uploading avatar/thumbnail');
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        
        if (!loginData.token) {
            console.log('❌ No token received in login response');
            return;
        }
        
        const token = loginData.token;
        console.log('🔑 Token received:', token.substring(0, 20) + '...');
        
        // Step 2: Create test image
        console.log('\n📸 Creating test image...');
        const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const buffer = Buffer.from(pngBase64, 'base64');
        const testImagePath = path.join(process.cwd(), 'test-upload.png');
        
        fs.writeFileSync(testImagePath, buffer);
        console.log('✅ Test image created:', testImagePath);
        
        // Step 3: Test upload with authentication
        console.log('\n📤 Testing authenticated upload...');
        
        // Create FormData for file upload
        const formData = new FormData();
        
        // In Node.js, we need to manually create FormData
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        let formDataBody = `--${boundary}\r\n`;
        formDataBody += `Content-Disposition: form-data; name="avatar"; filename="test-upload.png"\r\n`;
        formDataBody += `Content-Type: image/png\r\n\r\n`;
        formDataBody += buffer.toString('base64');
        formDataBody += `\r\n--${boundary}--\r\n`;
        
        const uploadResponse = await fetch(`${API_BASE}/upload/profile-photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: formDataBody
        });
        
        console.log('📊 Upload response status:', uploadResponse.status);
        
        if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            console.log('✅ Upload successful!');
            console.log('📁 File path:', uploadData.filePath);
            console.log('📝 Filename:', uploadData.filename);
            
            // Verify file exists
            if (uploadData.filePath && uploadData.filePath.startsWith('/uploads/')) {
                const localPath = path.join(process.cwd(), 'uploads', uploadData.filename);
                if (fs.existsSync(localPath)) {
                    console.log('✅ File saved locally:', localPath);
                } else {
                    console.log('⚠️ File not found at expected path');
                }
            }
        } else {
            const errorText = await uploadResponse.text();
            console.log('❌ Upload failed:', errorText);
        }
        
        // Cleanup
        try {
            fs.unlinkSync(testImagePath);
            console.log('🧹 Test image cleaned up');
        } catch (error) {
            console.log('⚠️ Could not cleanup test image:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run test
testAuthUpload();
