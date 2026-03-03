# 🚂 Railway Server Errors - Troubleshooting Guide

## 🚨 **Current Issues Identified**

### **500/502 Server Errors**
- **Login endpoint failing** (500 error)
- **Health endpoints failing** (502 error)
- **WebSocket connection timeout**
- **Server instability**

## 🔧 **Root Causes & Solutions**

### **Issue 1: Database Connection Problems**

#### **Symptoms:**
- 500 errors on API calls
- 502 Bad Gateway errors
- WebSocket timeouts

#### **Solution: Check Railway Environment Variables**
```bash
# Required Railway Variables
MYSQLHOST=your-railway-mysql-host
MYSQLUSER=your-railway-mysql-user  
MYSQLPASSWORD=your-railway-mysql-password
MYSQLDATABASE=your-railway-database-name
JWT_SECRET=your-super-secret-jwt-key-32-chars
NODE_ENV=production
```

#### **Fix Steps:**
1. **Go to Railway Dashboard**
2. **Select your project**
3. **Go to Variables tab**
4. **Add/Update all required variables**
5. **Redeploy the service**

### **Issue 2: Model Import Problems**

#### **Symptoms:**
- Server crashes on startup
- Module import errors
- 500 errors on auth routes

#### **Solution: Use Direct MySQL Approach**
Instead of Sequelize models, use direct MySQL for admin creation:

```javascript
// Run this in Railway console:
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Direct database connection and admin creation
```

### **Issue 3: Server Memory/CPU Limits**

#### **Symptoms:**
- 502 Bad Gateway errors
- Random server crashes
- Slow response times

#### **Solution: Upgrade Railway Plan**
1. **Go to Railway Dashboard**
2. **Upgrade to higher tier** (more memory/CPU)
3. **Redeploy after upgrade**

## 🚀 **Immediate Solutions**

### **Solution 1: Use Railway Console (Recommended)**

#### **Step 1: Access Railway Console**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Open your project console
railway open
```

#### **Step 2: Run Admin Creation Script**
In Railway console, run:
```javascript
// Copy and paste this script
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
  });
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminId = uuidv4();
  
  await connection.execute(
    'INSERT INTO users (id, name, email, password, role, is_verified, is_approved, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), is_verified = VALUES(is_verified), is_approved = VALUES(is_approved)',
    [adminId, 'Admin User', 'admin@ngwavha.com', hashedPassword, 'admin', 1, 1, new Date(), new Date()]
  );
  
  console.log('✅ Admin created successfully!');
  await connection.end();
}

createAdmin();
```

### **Solution 2: Fix Environment Variables**

#### **Check Current Variables:**
```bash
railway variables
```

#### **Set Required Variables:**
```bash
railway variables set MYSQLHOST=your-host
railway variables set MYSQLUSER=your-user
railway variables set MYSQLPASSWORD=your-password
railway variables set MYSQLDATABASE=your-database
railway variables set JWT_SECRET=your-32-char-secret
```

### **Solution 3: Simplify Admin Creation**

#### **Remove Complex Route:**
Delete the temporary `/create-railway-admin` route from `server.js` and use direct MySQL approach.

#### **Use Simple Script:**
The `railway-admin-setup.js` script I created uses direct MySQL connection instead of Sequelize models.

## 📋 **Debugging Steps**

### **Step 1: Check Railway Logs**
```bash
railway logs
```

### **Step 2: Test Database Connection**
```javascript
// In Railway console, test connection:
const mysql = require('mysql2/promise');
try {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
  });
  console.log('✅ Database connection successful');
  await connection.end();
} catch (error) {
  console.error('❌ Database connection failed:', error);
}
```

### **Step 3: Check Server Health**
```bash
# Test your Railway app health
curl https://your-app.railway.app/api/health
```

## 🎯 **Expected Results After Fix**

### **✅ Working Admin Login:**
- **No 500 errors** on login endpoint
- **Successful authentication** with admin credentials
- **Proper JWT token** generation
- **Admin dashboard loads** without errors

### **✅ Stable Server:**
- **No 502 errors** on API calls
- **WebSocket connects** successfully
- **All endpoints respond** correctly
- **Real-time features** working

### **✅ Database Connection:**
- **MySQL connects** successfully
- **User model queries** work correctly
- **Admin account created** properly
- **Authentication works** as expected

## 🚨 **If Issues Persist**

### **Option 1: Restart Railway Service**
```bash
railway restart
```

### **Option 2: Redeploy Fresh**
```bash
git push origin main --force
```

### **Option 3: Contact Railway Support**
If database connection issues persist, contact Railway support for MySQL configuration help.

## 🎊 **Success Confirmation**

**When these work, Railway setup is complete:**

1. ✅ **No 500/502 errors** on API calls
2. ✅ **Admin login works** with credentials
3. ✅ **Admin dashboard loads** properly
4. ✅ **Real-time features** functional
5. ✅ **All admin sections** accessible

## 📞 **Quick Fix Summary**

**The 500/502 errors suggest:**
1. **Database connection issues** (most likely)
2. **Environment variable problems** (very likely)
3. **Server resource limits** (possible)

**Start with Railway console approach - it bypasses server issues and creates admin directly!** 🚂

**Use the Railway console script to create your admin account now!** 🎓
