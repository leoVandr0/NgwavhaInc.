# Admin Panel Access Guide

## 🔐 How to Access the Admin Panel

### 📋 Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- MySQL database connected

### 🛠️ Setup Options

### Option 1: Quick Setup Script (Recommended)
```bash
# Navigate to server directory
cd c:\Users\lenny\NgwavhaInc\server

# Run the admin creation script
node scripts/create-admin.js
```

This will create an admin user with:
- **Email**: `admin@ngwavha.com`
- **Password**: `admin123`
- **Admin Panel**: `http://localhost:3000/admin`

### Option 2: Manual Database Setup
```sql
-- Run this SQL query in your MySQL database
INSERT INTO Users (
    id, 
    name, 
    email, 
    password, 
    role, 
    isVerified, 
    createdAt, 
    updatedAt
) VALUES (
    UUID(), -- Generate a UUID
    'Admin User', -- Display name
    'admin@ngwavha.com', -- Email
    'admin123', -- Plain text password (will be hashed)
    'admin', -- Role
    1, -- Verified
    NOW(), -- Created at
    NOW()  -- Updated at
);
```

### Option 3: Update Existing User
```sql
-- If you already have a user account, update it to admin role
UPDATE Users SET role = 'admin', isVerified = 1 WHERE email = 'your-email@example.com';
```

### 🌐 Access the Admin Panel

1. **Start your servers:**
   ```bash
   # Backend (Terminal 1)
   cd c:\Users\lenny\NgwavhaInc\server
   npm start
   
   # Frontend (Terminal 2)
   cd c:\Users\lenny\NgwavhaInc\client
   npm start
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000/admin
   ```

3. **Login with admin credentials:**
   - **Email**: `admin@ngwavha.com`
   - **Password**: `admin123`

4. **You're in!** 🎉

### 🔐 Security Notes

⚠️ **IMPORTANT**: 
- Change the default password immediately after first login
- Use a strong password with the platform's password requirements
- The admin panel has full access to all user data and platform controls

### 📱 Admin Panel Features

Once logged in, you can access:
- **Dashboard** (`/admin/dashboard`) - Real-time statistics
- **User Management** (`/admin/users`) - Manage teachers and students
- **Teacher Approvals** - Approve/decline teacher applications
- **System Monitoring** - View platform activity and metrics

### 🚨 Troubleshooting

**If you can't access the admin panel:**

1. **Check server status:**
   ```bash
   # Backend should be running on port 5000
   # Frontend should be running on port 3000
   ```

2. **Verify admin user exists:**
   ```sql
   SELECT * FROM Users WHERE role = 'admin';
   ```

3. **Check browser console** for any JavaScript errors

4. **Check network tab** for failed API calls

5. **Clear browser cache** and try again

### 🔄 Reset Admin Password

If you forget the admin password:
```bash
# Run the script again to create a new admin
node server/scripts/create-admin.js
```

Or manually update in database:
```sql
UPDATE Users SET password = 'new-hashed-password' WHERE email = 'admin@ngwavha.com';
```

### 📞 Need Help?

- Check the console output when running the setup script
- Verify database connection in `.env` file
- Ensure all dependencies are installed: `npm install`
- Check that your MySQL server is running

---

**🎯 Quick Start:**
```bash
cd c:\Users\lenny\NgwavhaInc\server
node scripts/create-admin.js
# Then visit: http://localhost:3000/admin
```
