# 🚀 Railway Port Setup Guide

## 🔍 **App Port Configuration**

### **Server Port:**
```javascript
// From server.js line 55
const PORT = process.env.PORT || 8080;

// Server starts on line 157
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Socket.IO enabled for real-time admin dashboard`);
});
```

### **Default Port:** `8080`
### **Railway Port:** `process.env.PORT` (Railway sets this automatically)

## 🚀 **Railway Setup Steps**

### **1. Railway Project Configuration**

#### **Create New Service:**
1. Go to Railway Dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose "Node.js" as the service type

#### **Environment Variables Required:**
```bash
# Database Connection
MYSQLHOST=your_railway_mysql_host
MYSQLPORT=3306
MYSQLUSER=your_railway_mysql_user
MYSQLPASSWORD=your_railway_mysql_password
MYSQLDATABASE=your_railway_mysql_database

# MongoDB Connection  
MONGODB_URI=your_mongodb_connection_string

# App Configuration
NODE_ENV=production
PORT=8080
JWT_SECRET=your_jwt_secret_key

# Cloudflare R2 (if using)
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com

# Email (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### **2. Port Configuration**

#### **Railway Automatically Sets PORT:**
- ✅ **No Manual Port Setting** - Railway sets `process.env.PORT`
- ✅ **Default Fallback** - Uses 8080 if PORT not set
- ✅ **Dynamic Port** - Railway assigns port automatically
- ✅ **HTTPS Enabled** - Railway handles SSL automatically

#### **Your Code is Already Configured:**
```javascript
// ✅ CORRECT - Uses Railway's PORT
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
```

### **3. Start Command**

#### **Railway Start Script:**
```json
// package.json already has correct start script
"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
}
```

#### **Railway Will Run:**
```bash
# Railway automatically runs:
npm start
# Which executes:
node server.js
```

### **4. Build Configuration**

#### **No Build Needed:**
```json
// package.json - already correct
"scripts": {
    "build": "echo 'No build needed'"
}
```

#### **Railway Settings:**
- **Build Command:** `npm install` (Railway default)
- **Start Command:** `npm start` (from package.json)
- **Node Version:** `>=18.0.0` (from engines)

## 🌐 **Access URLs**

### **After Deployment:**
```
Your App URL: https://your-app-name.railway.app
API Base URL: https://your-app-name.railway.app/api
Health Check: https://your-app-name.railway.app/health
```

### **Environment-Specific URLs:**
```
Development: http://localhost:8080
Production: https://your-app-name.railway.app
```

## 🔧 **Verification Steps**

### **1. Check Server Logs:**
```bash
# Railway should show:
🚀 Server running on port PORT
API available at http://localhost:PORT/api
Socket.IO enabled for real-time admin dashboard
```

### **2. Test Health Endpoint:**
```bash
curl https://your-app-name.railway.app/health
```

### **3. Test API:**
```bash
curl https://your-app-name.railway.app/api/auth/register
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Port Already in Use**
```
Error: listen EADDRINUSE :::8080
```
**Solution:** Railway automatically handles this - just use `process.env.PORT`

### **Issue 2: Database Connection Failed**
```
Error: connect ECONNREFUSED
```
**Solution:** Check Railway MySQL environment variables

### **Issue 3: Application Not Starting**
```
Error: Cannot find module 'express'
```
**Solution:** Railway runs `npm install` automatically

### **Issue 4: CORS Issues**
```
Error: Access-Control-Allow-Origin
```
**Solution:** Update frontend API URL to Railway URL

## 📋 **Railway Deployment Checklist**

### **Before Deployment:**
- [ ] **Repository Pushed** - Latest code on GitHub
- [ ] **Environment Variables** - All required variables documented
- [ ] **Database Ready** - Railway MySQL/MongoDB provisioned
- [ ] **Port Configuration** - Uses `process.env.PORT`

### **After Deployment:**
- [ ] **App URL Working** - Main page loads
- [ ] **API Endpoints** - Test key endpoints
- [ ] **Database Connected** - Check logs for connection success
- [ ] **Static Files** - Uploads working (if using R2)
- [ ] **Real-time Features** - Socket.IO working

## 🎯 **Quick Railway Setup**

### **One-Click Deployment:**
1. **Connect GitHub** - Railway → New Project → GitHub
2. **Select Repo** - Choose your NgwavhaInc repository
3. **Set Variables** - Add all environment variables
4. **Deploy** - Railway builds and deploys automatically
5. **Test** - Visit the provided Railway URL

### **Environment Variables Template:**
```bash
# Copy-paste these into Railway Variables tab
MYSQLHOST=${{RAILWAY_MYSQLHOST}}
MYSQLPORT=3306
MYSQLUSER=${{RAILWAY_MYSQLUSER}}
MYSQLPASSWORD=${{RAILWAY_MYSQLPASSWORD}}
MYSQLDATABASE=${{RAILWAY_MYSQLDATABASE}}
MONGODB_URI=${{RAILWAY_MONGODB_URI}}
NODE_ENV=production
PORT=8080
JWT_SECRET=${{RAILWAY_JWT_SECRET}}
```

## 🚀 **Your App is Ready for Railway!**

### **Port Configuration Summary:**
- ✅ **Development:** `8080` (localhost)
- ✅ **Production:** `process.env.PORT` (Railway)
- ✅ **No Changes Needed** - Code already configured correctly
- ✅ **Automatic HTTPS** - Railway handles SSL

### **Next Steps:**
1. **Deploy to Railway** using the steps above
2. **Set Environment Variables** in Railway dashboard
3. **Test Deployment** at the Railway URL
4. **Update Frontend** API URL to Railway URL

**Your app will automatically use the correct port on Railway!** 🚀
