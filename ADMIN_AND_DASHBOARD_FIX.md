# 🔧 Admin Credentials & Dashboard Fix

## 🚨 **Issues to Resolve**

1. **Admin credentials don't work** - Can't access admin panel
2. **Student dashboard crashes** - Shows "Something went wrong"
3. **Can't see teacher registrations** - Need admin panel access

## 🔐 **Quick Admin Fix - Bypass All Import Issues**

### **Step 1: Create Admin Using Simple Script**

I've created a simple script that bypasses all import issues:

```bash
cd server
node create_admin_simple.js
```

**This script:**
- ✅ **Connects directly to MySQL** (no Sequelize)
- ✅ **Hashes password correctly** 
- ✅ **Creates/updates admin** account
- ✅ **Bypasses all import issues**

### **Expected Output:**
```
✅ Connected to MySQL
✅ Password hashed
✅ Admin user created/updated
✅ Admin verified: {id: 'uuid', name: 'Admin User', email: 'admin@ngwavha.com', role: 'admin', is_verified: 1}
🎉 Admin creation complete!
📧 Login with:
   Email: admin@ngwavha.com
   Password: admin123
```

## 🚀 **Alternative: Direct MySQL Admin Creation**

If the script doesn't work, use MySQL directly:

```sql
mysql -u root -p
USE ngwavha;

-- Delete existing admin (to start fresh)
DELETE FROM User WHERE email = 'admin@ngwavha.com';

-- Create new admin with correct hash
INSERT INTO User (id, name, email, password, role, is_verified, created_at, updated_at)
VALUES (
    UUID(), 
    'Admin User', 
    'admin@ngwavha.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'admin', 
    1, 
    NOW(), 
    NOW()
);

-- Verify creation
SELECT id, name, email, role, is_verified FROM User WHERE email = 'admin@ngwavha.com';
```

**Then login with:**
- **Email:** `admin@ngwavha.com`
- **Password:** `password`

## 🎯 **After Admin is Fixed - Check Teacher Registrations**

Once you can access the admin panel:

### **View Pending Teacher Applications:**
1. **Go to:** `http://localhost:8080/admin`
2. **Login with:** admin@ngwavha.com / admin123
3. **Navigate to:** Users or Instructors section
4. **Look for:** Pending instructor applications
5. **Approve teachers** who need access

### **What to Look For:**
- ✅ **New instructor registrations** waiting for approval
- ✅ **Instructor details** (name, email, qualifications)
- ✅ **Approval buttons** to approve/reject
- ✅ **Bulk actions** to approve multiple teachers

## 🔧 **Student Dashboard Fix**

### **Start Server Fresh:**
```bash
cd server
npm start
```

### **Test Student Registration:**
1. **Go to:** `http://localhost:8080/register?role=student`
2. **Fill registration form**
3. **Choose notification preferences** (Continue button should work now)
4. **Complete registration**
5. **Should auto-login** and go to dashboard

### **Expected Dashboard:**
- ✅ **Loads without "Something went wrong"**
- ✅ **Shows empty state** for new students
- ✅ **Displays welcome message** or getting started guide
- ✅ **No console errors** in browser

## 📋 **Complete Testing Workflow**

### **Phase 1: Fix Admin Access**
```bash
# Option A: Use simple script
cd server
node create_admin_simple.js

# Option B: Use MySQL directly
mysql -u root -p
# (Run SQL commands from above)
```

### **Phase 2: Test Admin Login**
1. **Go to:** `http://localhost:8080/login`
2. **Login with:** admin@ngwavha.com / admin123
3. **Access admin panel:** `http://localhost:8080/admin`

### **Phase 3: Check Teacher Applications**
1. **In admin panel,** look for "Users" or "Instructors"
2. **Review pending** teacher registrations
3. **Approve qualified** teachers
4. **Test teacher login** after approval

### **Phase 4: Test Student Dashboard**
1. **Register new student** and complete flow
2. **Verify dashboard loads** without errors
3. **Check for empty state** instead of crash

## 🎉 **Expected End Result**

### **Admin Panel:**
- ✅ **Can login** with admin credentials
- ✅ **Can view** all user registrations
- ✅ **Can approve** teacher applications
- ✅ **Can manage** courses and users

### **Student Experience:**
- ✅ **Registration works** end-to-end
- ✅ **Dashboard loads** properly
- ✅ **No more crashes** or error messages
- ✅ **Smooth user experience**

## 🚨 **If Still Issues**

### **Admin Creation Fails:**
```bash
# Check MySQL connection
mysql -u root -p
SHOW DATABASES;
USE ngwavha;
SHOW TABLES;
```

### **Dashboard Still Crashes:**
```bash
# Check server logs for specific errors
npm start 2>&1 | grep -i "error\|failed\|crash"
```

### **Can't See Teachers:**
- **Check if admin role** is properly set
- **Verify admin panel routes** are working
- **Check database queries** for user listings

## 🚀 **Ready to Go!**

**This comprehensive approach should resolve both issues:**

1. **Admin credentials** - Fixed with simple script
2. **Teacher approvals** - Available once admin works
3. **Student dashboard** - Should load without crashes

**Test the admin creation script first, then verify both admin panel and student dashboard!** 🎓
