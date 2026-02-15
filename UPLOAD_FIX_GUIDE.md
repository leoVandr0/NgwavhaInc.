# Upload Issues Fix Guide

## 🚨 Problems Identified

1. **Upload routes not registered** - Fixed ✅
2. **R2 configuration missing** - Will fallback to local storage
3. **Authentication middleware blocking uploads** - Need valid token
4. **Server startup issues** - Need to verify

## 🔧 Fixes Applied

### 1. Upload Routes Registration ✅
Added upload routes to `server.js`:
```javascript
import uploadRoutes from './src/routes/upload.routes.js';
app.use('/api/upload', uploadRoutes);
```

### 2. Upload Directory Setup ✅
Upload directory exists: `C:\Users\lenny\NgwavhaInc\server\uploads`
Permissions: 40666 (read/write)

### 3. R2 Configuration ⚠️
R2 environment variables are missing:
- R2_ACCESS_KEY_ID: false
- R2_SECRET_ACCESS_KEY: false  
- R2_ENDPOINT: false
- R2_BUCKET_NAME: false
- R2_PUBLIC_URL: false

**Solution**: Will fallback to local storage

## 🧪 Testing Results

### Upload Routes Test
- ❌ Server not running (fetch failed)
- ✅ Upload directory exists
- ✅ Test image creation works

### Next Steps
1. Start the server
2. Test upload endpoints
3. Verify authentication flow

## 📋 Manual Testing Steps

### Step 1: Start Server
```bash
cd server
npm start
```

### Step 2: Test Route Availability
```bash
curl http://localhost:8080/api/health
```

### Step 3: Test Upload Route (without auth)
```bash
curl -X POST http://localhost:8080/api/upload/course-thumbnail \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Expected: 400 Bad Request (No file uploaded)
```

### Step 4: Test Upload Route (with auth)
1. Login to get token
2. Use token in Authorization header
3. Upload actual file

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find upload route"
**Cause**: Routes not registered in server.js
**Fix**: ✅ Already fixed - added `app.use('/api/upload', uploadRoutes);`

### Issue 2: "R2 configuration missing"
**Cause**: Environment variables not set
**Fix**: Will fallback to local storage (uploads folder)

### Issue 3: "Authentication required"
**Cause**: Upload routes protected by auth middleware
**Fix**: Send valid JWT token in Authorization header

### Issue 4: "File size too large"
**Cause**: File exceeds 50MB limit (R2) or 10MB limit (local)
**Fix**: Use smaller files or increase limits

### Issue 5: "Invalid file type"
**Cause**: File not in allowed types
**Fix**: Use: jpg, jpeg, png, gif, webp, pdf, mp4, mkv, avi, mov

## 🔍 Debug Upload Issues

### Check Server Logs
```bash
cd server
npm start
# Look for upload-related errors
```

### Check Network Tab
1. Open browser dev tools
2. Go to Network tab
3. Try uploading avatar/thumbnail
4. Check request/response details

### Check Upload Directory
```bash
ls -la server/uploads/
# Should see uploaded files
```

## 📝 Client-Side Fixes

### Avatar Upload (TeacherProfile.jsx)
```javascript
// Current implementation looks correct
const formDataUpload = new FormData();
formDataUpload.append('avatar', file);
const { data } = await api.post('/upload/profile-photo', formDataUpload, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Thumbnail Upload (CreateCourse.jsx)
```javascript
// Current implementation looks correct  
const formDataUpload = new FormData();
formDataUpload.append('thumbnail', formData.thumbnailFile);
const { data: uploadData } = await api.post('/upload/course-thumbnail', formDataUpload, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

## 🚀 Production Setup

### For R2 Uploads
Set these environment variables:
```bash
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_BUCKET_NAME=ngwavha
R2_PUBLIC_URL=https://your-domain.com/ngwavha
```

### For Local Storage
Ensure uploads folder exists and is writable:
```bash
mkdir -p server/uploads
chmod 755 server/uploads
```

## 🎯 Quick Fix Checklist

- [x] Upload routes registered in server.js
- [x] Upload directory exists
- [x] Multer middleware configured
- [x] File type validation working
- [x] Size limits set appropriately
- [ ] Server running successfully
- [ ] Authentication flow working
- [ ] Actual file upload tested

## 🔄 If Issues Persist

1. **Check server startup errors**
2. **Verify JWT token is valid**
3. **Check file size and type**
4. **Test with different files**
5. **Check browser console for errors**
6. **Verify API base URL is correct**

---

**Status**: 🟡 Partially Fixed (Routes registered, server needs testing)
**Next**: Start server and test actual upload functionality
