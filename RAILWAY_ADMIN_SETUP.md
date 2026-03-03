# 🚂 Railway Admin Account Setup Guide

## 🚨 **Issue: Local Admin vs Railway Admin**

The admin credentials I created (`admin@ngwavha.com` / `admin123`) are for your **local database**. Your Railway production environment has a separate database that needs its own admin account.

## ✅ **Railway Admin Setup Options**

### **Option 1: Use Railway Environment Variables (Recommended)**

#### **Step 1: Set Railway Environment Variables**
In your Railway project dashboard, set these environment variables:

```bash
# Database Connection
MYSQLHOST=your-railway-mysql-host
MYSQLUSER=your-railway-mysql-user
MYSQLPASSWORD=your-railway-mysql-password
MYSQLDATABASE=your-railway-database-name

# JWT Secret (if not already set)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Server Settings
NODE_ENV=production
PORT=8080
```

#### **Step 2: Deploy Admin Creation Script**
Create a one-time admin setup endpoint or use Railway console:

```bash
# Connect to Railway database and create admin
mysql -h YOUR_RAILWAY_HOST -u YOUR_RAILWAY_USER -p YOUR_RAILWAY_DATABASE
```

Then run:
```sql
-- Check if admin exists
SELECT * FROM users WHERE email = 'admin@ngwavha.com';

-- Create admin if doesn't exist
INSERT INTO users (
    id, 
    name, 
    email, 
    password, 
    role, 
    is_verified, 
    is_approved, 
    created_at, 
    updated_at
) VALUES (
    UUID(),
    'Admin User',
    'admin@ngwavha.com',
    '$2a$10$YourHashedPasswordHere',
    'admin',
    1,
    1,
    NOW(),
    NOW()
);
```

### **Option 2: Temporary Admin Creation Endpoint**

#### **Step 1: Create Temporary Setup Route**
Add this to your server for one-time use:

```javascript
// Add to server.js (TEMPORARY - REMOVE AFTER USE)
app.post('/setup-admin', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminId = uuidv4();
        
        await User.create({
            id: adminId,
            name: 'Admin User',
            email: 'admin@ngwavha.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isApproved: true
        });
        
        res.json({ 
            success: true, 
            message: 'Admin created successfully',
            credentials: {
                email: 'admin@ngwavha.com',
                password: 'admin123'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

#### **Step 2: Deploy and Run**
1. **Deploy to Railway**
2. **Visit:** `https://your-app.railway.app/setup-admin`
3. **Remove the endpoint** after use

### **Option 3: Railway Console Commands**

#### **Step 1: Access Railway Console**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Access your project console
railway open
```

#### **Step 2: Run Admin Creation**
In Railway console:
```bash
# Connect to your service
railway variables

# Run admin creation script
node -e "
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
  });
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const { v4: uuidv4 } = require('uuid');
  
  await connection.execute(
    'INSERT INTO users (id, name, email, password, role, is_verified, is_approved, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), is_verified = VALUES(is_verified), is_approved = VALUES(is_approved)',
    [uuidv4(), 'Admin User', 'admin@ngwavha.com', hashedPassword, 'admin', 1, 1, new Date(), new Date()]
  );
  
  console.log('✅ Admin created for Railway!');
  process.exit(0);
}

createAdmin().catch(console.error);
"
```

## 🔧 **Quick Railway Fix**

### **Easiest Method - One-Time Endpoint:**

1. **Add this temporary route** to your server:
```javascript
// TEMPORARY ADMIN SETUP - REMOVE AFTER USE
app.post('/create-railway-admin', async (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
        return res.status(403).json({ error: 'Production only' });
    }
    
    try {
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await User.create({
            id: uuidv4(),
            name: 'Admin User',
            email: 'admin@ngwavha.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isApproved: true
        });
        
        res.json({ 
            success: true, 
            message: 'Railway admin created!',
            login: {
                email: 'admin@ngwavha.com',
                password: 'admin123'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

2. **Deploy to Railway**

3. **Visit:** `https://your-app.railway.app/create-railway-admin`

4. **Remove the endpoint** after creating admin

## 🎯 **Railway Login Credentials**

### **After Setup:**
- **Email:** `admin@ngwavha.com`
- **Password:** `admin123`
- **URL:** `https://your-app.railway.app/login`

## 📋 **Verification Steps**

### **Step 1: Check Railway Variables**
```bash
railway variables
```

### **Step 2: Test Database Connection**
```bash
# Test connection to Railway database
mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE
```

### **Step 3: Verify Admin Creation**
```sql
SELECT id, name, email, role, is_verified, is_approved FROM users WHERE email = 'admin@ngwavha.com';
```

## 🚨 **Important Notes**

### **Security:**
- **Remove temporary endpoints** after use
- **Change default password** after first login
- **Use strong JWT secret** in production
- **Enable HTTPS** (Railway does this automatically)

### **Database:**
- **Railway MySQL** is separate from local MySQL
- **Environment variables** must match Railway database
- **Local admin** doesn't work on Railway
- **Railway admin** doesn't work locally

## 🎊 **Success Criteria**

**When these work, Railway setup is complete:**

- ✅ **Admin can login** on Railway URL
- ✅ **Admin dashboard loads** on Railway
- ✅ **All admin features** work on Railway
- ✅ **Real-time updates** work on Railway
- ✅ **No authentication errors**

## 🚀 **Next Steps**

1. **Choose setup method** (Option 1, 2, or 3)
2. **Set up Railway admin** account
3. **Test login** on Railway URL
4. **Remove temporary code** if used
5. **Change default password** for security

**Your Railway platform needs its own admin account - local admin won't work on production!** 🚂

**Choose the setup method that works best for you and create your Railway admin account!** 🎓
