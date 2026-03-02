# 🔐 Admin Panel Access Guide

## 🎯 **Admin Panel Routes**

### **Available Admin Routes:**
```
/admin                    → Admin Dashboard
/admin/dashboard          → Admin Dashboard  
/admin/users              → Manage Users
/admin/course-previews    → Course Previews Management
```

### **Access Requirements:**
- ✅ **User Role Must Be:** `admin`
- ✅ **Must Be Authenticated:** Logged in user
- ✅ **Route Protection:** ProtectedRoute checks `allowedRoles={['admin']}`

## 🚀 **How to Access Admin Panel**

### **Option 1: Create Admin User via Database**

#### **Method A: Direct Database Update**
```sql
-- Update existing user to admin role
UPDATE Users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Or create new admin user
INSERT INTO Users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    UUID(), 
    'Admin User', 
    'admin@example.com', 
    '$2a$10$hashedpassword', 
    'admin', 
    NOW(), 
    NOW()
);
```

#### **Method B: Create Admin Script**
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
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('✅ Admin user created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
```

### **Option 2: Add Admin Creation API Endpoint**

#### **Create Admin Endpoint**
```javascript
// Add to admin.controller.js
export const createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    res.json({ 
      success: true, 
      message: 'Admin user created successfully',
      admin: { id: admin.id, email: admin.email, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create admin user',
      error: error.message 
    });
  }
};
```

#### **Add Route**
```javascript
// Add to admin.routes.js
router.post('/create-admin', createAdmin);
```

### **Option 3: Temporary Admin Access**

#### **Modify ProtectedRoute (Temporary)**
```javascript
// In App.jsx - TEMPORARY FOR SETUP
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // TEMPORARY: Allow any authenticated user to access admin
  if (allowedRoles?.includes('admin') && currentUser.email === 'your-email@example.com') {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

## 🔄 **Step-by-Step Access**

### **Step 1: Create Admin User**
Choose one of the methods above to create an admin user.

### **Step 2: Log In**
1. Go to `/login`
2. Use admin credentials
3. Verify role is `admin`

### **Step 3: Access Admin Panel**
1. Navigate to `/admin`
2. Should see Admin Dashboard
3. Access all admin features

## 🎛️ **Admin Panel Features**

### **Admin Dashboard (`/admin`)**
- 📊 **Statistics** - Users, courses, revenue
- 👥 **User Management** - View, approve, delete users
- 📚 **Course Management** - Approve course previews
- 📈 **Analytics** - Platform metrics

### **User Management (`/admin/users`)**
- ✅ **View All Users** - List with roles and status
- ✅ **Approve Teachers** - Instructor applications
- ✅ **Delete Users** - Remove accounts
- ✅ **Update Roles** - Change user permissions

### **Course Previews (`/admin/course-previews`)**
- ✅ **Review Submissions** - Course preview requests
- ✅ **Approve/Reject** - Course content moderation
- ✅ **Feedback** - Provide reasons for decisions

## 🔍 **Troubleshooting**

### **Access Denied Issues:**

#### **Check User Role:**
```javascript
// In browser console
console.log('User role:', currentUser?.role);
```

#### **Verify Route Protection:**
```javascript
// Check ProtectedRoute logic
console.log('Allowed roles:', allowedRoles);
console.log('User role:', currentUser?.role);
```

#### **Database Check:**
```sql
SELECT id, name, email, role FROM Users WHERE email = 'your-email@example.com';
```

### **Common Issues:**

#### **1. Role Not Set Correctly**
- **Problem:** User role is 'student' instead of 'admin'
- **Solution:** Update database directly

#### **2. AuthContext Not Updated**
- **Problem:** Role changed in DB but not reflected in frontend
- **Solution:** Log out and log back in

#### **3. Route Protection Too Strict**
- **Problem:** ProtectedRoute blocking access
- **Solution:** Verify allowedRoles array

## 🚀 **Quick Setup Script**

### **One-Command Admin Creation**
```bash
# Create and run admin creation script
node -e "
const { sequelize } = require('./src/config/mysql.js');
const User = require('./src/models/User.js');
const bcrypt = require('bcryptjs');

(async () => {
  await sequelize.sync();
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('✅ Admin created:', admin.email);
  process.exit(0);
})();
"
```

## 🎯 **Recommended Approach**

### **For Production:**
1. **Use Database Method** - Direct SQL update
2. **Secure Credentials** - Strong admin password
3. **Remove Temporary Code** - Clean up any temporary access

### **For Development:**
1. **Create Admin Script** - Quick setup
2. **Use Test Credentials** - admin@example.com / admin123
3. **Document Access** - Keep credentials secure

## 🔐 **Security Notes**

- ✅ **Change Default Password** - Don't use 'admin123' in production
- ✅ **Limit Admin Access** - Only give admin role to trusted users
- ✅ **Monitor Admin Activity** - Log admin actions
- ✅ **Use HTTPS** - Protect admin credentials in transit

**Once you have admin access, you can manage the entire platform from the admin panel!** 🎛️
