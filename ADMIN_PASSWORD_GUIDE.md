# 🔐 Admin Account Password Guide

## 🚨 **No Default Admin Account**

**There is no pre-existing admin account with a default password.** You need to create an admin user yourself.

## 🎯 **How to Create Admin Account**

### **Option 1: Database Direct Update (Recommended)**

#### **Step 1: Find Your User**
```sql
-- Check existing users
SELECT id, name, email, role FROM Users WHERE email = 'your-email@example.com';
```

#### **Step 2: Update to Admin Role**
```sql
-- Update existing user to admin
UPDATE Users SET role = 'admin' WHERE email = 'your-email@example.com';
```

#### **Step 3: Create New Admin User**
```sql
-- If no existing user, create new admin
INSERT INTO Users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt)
VALUES (
    UUID(), 
    'Admin User', 
    'admin@ngwavha.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'admin', 
    true, 
    true, 
    NOW(), 
    NOW()
);
```

### **Option 2: Admin Creation Script**

#### **Create Script File:**
```javascript
// scripts/createAdmin.js
import { sequelize } from '../src/config/mysql.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
  try {
    await sequelize.sync();
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ngwavha.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true
    });
    
    console.log('✅ Admin user created:');
    console.log('Email: admin@ngwavha.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
```

#### **Run the Script:**
```bash
cd server
node scripts/createAdmin.js
```

### **Option 3: One-Command Admin Creation**

#### **Quick Terminal Command:**
```bash
cd server
node -e "
const { sequelize } = require('./src/config/mysql.js');
const User = require('./src/models/User.js');
const bcrypt = require('bcryptjs');

(async () => {
  await sequelize.sync();
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ngwavha.com',
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
    isApproved: true
  });
  console.log('✅ Admin created: admin@ngwavha.com / admin123');
  process.exit(0);
})();
"
```

## 🔑 **Default Admin Credentials (After Creation)**

### **Email:** `admin@ngwavha.com`
### **Password:** `admin123`

## 🚀 **Access Admin Panel**

### **Step 1: Create Admin User**
Use one of the methods above to create the admin account

### **Step 2: Log In**
1. Go to `/login`
2. Use admin credentials:
   - Email: `admin@ngwavha.com`
   - Password: `admin123`

### **Step 3: Access Admin Panel**
1. Navigate to `/admin`
2. Should see Admin Dashboard
3. Access all admin features

## 🔄 **Change Default Password**

### **Important Security Step:**
```sql
-- Update admin password (replace with your own hash)
UPDATE Users 
SET password = '$2a$10$your-new-hashed-password' 
WHERE email = 'admin@ngwavha.com';
```

### **Or Update via Profile:**
1. Log in as admin
2. Go to profile settings
3. Change password to something secure

## 🔍 **Check Existing Admin Users**

### **Database Query:**
```sql
SELECT id, name, email, role, isVerified, isApproved, createdAt 
FROM Users 
WHERE role = 'admin';
```

### **If Results Empty:**
- No admin users exist
- Create one using methods above

### **If Results Found:**
- Note the email addresses
- Reset password if needed
- Use existing admin credentials

## 🚨 **Security Notes**

### **For Development:**
- ✅ **Default password OK** - `admin123` is fine for testing
- ✅ **Simple credentials** - Easy to remember and use

### **For Production:**
- ❌ **Change password** - Don't use `admin123` in production
- ✅ **Strong password** - Use complex password
- ✅ **Limit admin access** - Only give admin role to trusted users
- ✅ **Enable 2FA** - Add two-factor authentication if possible

## 📋 **Quick Setup Summary**

1. **No default admin exists** - You must create one
2. **Recommended method:** Database direct update
3. **Default credentials:** `admin@ngwavha.com` / `admin123`
4. **Access URL:** `/admin` after login
5. **Security:** Change password for production

**Choose your preferred method to create the admin account!** 🔐
