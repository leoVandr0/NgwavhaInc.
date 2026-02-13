# Railway Environment Variables Setup

## Required Environment Variables for Railway

Add these environment variables in your Railway project settings:

### 🔐 **JWT Configuration (CRITICAL)**
```
JWT_SECRET=jKtB1NPUQnrOIc7mbxdMVLWzwCRaAuFJol62ZqiTvHXYE9kD853gesG40fpShy
```
**This is the missing variable causing the 500 error!**

### 🗄️ **Database Configuration**
Railway will automatically provide these if you use Railway's MySQL service:
- `MYSQLHOST` (auto-provided)
- `MYSQLPORT` (auto-provided) 
- `MYSQLUSER` (auto-provided)
- `MYSQLPASSWORD` (auto-provided)
- `MYSQLDATABASE` (auto-provided)

### 📧 **Email (Optional)**
```
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=ngwavha26@gmail.com
EMAIL_FROM_NAME=Ngwavha
```

### 🔑 **Google OAuth (Optional)**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=https://your-app-domain.railway.app/auth/google/callback
```

### 🛡️ **Session Security**
```
SESSION_SECRET=ngwavha-production-secret
```

### 🌐 **MongoDB (Optional)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ngwavha
```

## How to Add Environment Variables in Railway

1. **Go to your Railway project**
2. **Select your service**
3. **Click on "Variables" tab**
4. **Add each variable** using the "New Variable" button
5. **Redeploy** after adding variables

## Critical Fix for Login Error

The error `"secretOrPrivateKey must have a value"` is caused by missing `JWT_SECRET`.

**IMMEDIATE ACTION REQUIRED:**
1. Add `JWT_SECRET=jKtB1NPUQnrOIc7mbxdMVLWzwCRaAuFJol62ZqiTvHXYE9kD853gesG40fpShy` to Railway variables
2. Redeploy the service
3. Test login again

## Verification

After deployment, check the health endpoint:
```
https://your-app.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "environment": {
    "jwtSecretExists": true,
    "jwtSecretLength": 64
  }
}
```

## Troubleshooting

If still getting 500 errors:

1. **Check Railway logs** for environment variable loading
2. **Verify JWT_SECRET** is exactly as shown (no extra spaces)
3. **Redeploy** after adding variables
4. **Test health endpoint** to confirm variables are loaded

The login should work immediately after adding JWT_SECRET! 🚀
