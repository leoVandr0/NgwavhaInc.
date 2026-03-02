# 🔧 Login Debug & Fix

## 🚨 **Issue: 400 Login Error**

The login is failing with a 400 error, which means:
1. Invalid credentials (password mismatch)
2. User not found  
3. Missing password

## 🔍 **Debug Steps**

### **Step 1: Check Server Logs**
Start the server and watch the login logs:
```bash
cd server
npm start
```

Then try login and look for these log messages:
```
========== LOGIN REQUEST START ==========
1. Received request body: {email: 'admin@ngwavha.com', password: 'admin123'}
Attempting login for: admin@ngwavha.com
User found: {id: 'uuid', email: 'admin@ngwavha.com', hasPassword: true}
Login failed: Password mismatch for user: admin@ngwavha.com
```

### **Step 2: Generate Correct Password Hash**

The password hash we used might be incorrect. Let's generate a fresh one:

```bash
# In server directory
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => {
  console.log('New hash for admin123:', hash);
  process.exit(0);
});
"
```

### **Step 3: Update Admin Password**

Use the new hash from above:
```sql
UPDATE User 
SET password = 'NEW_HASH_HERE'
WHERE email = 'admin@ngwavha.com';
```

## 🚀 **Quick Fix - Use Node.js to Update Password**

### **Create a Script to Fix Admin Password:**

```bash
# In server directory
node -e "
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/mysql.js');
const User = require('./src/models/User.js').default;

(async () => {
  try {
    await sequelize.sync();
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hash);
    
    await User.update(
      { password: hash },
      { where: { email: 'admin@ngwavha.com' } }
    );
    
    console.log('✅ Admin password updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
"
```

## 🔧 **Alternative: Create Fresh Admin**

If the above doesn't work, create a completely new admin:

```sql
-- Delete existing admin
DELETE FROM User WHERE email = 'admin@ngwavha.com';

-- Create new admin with simple password
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
```

**Then login with:**
- **Email:** `admin@ngwavha.com`
- **Password:** `password`

## 🔍 **Test Login API Directly**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ngwavha.com",
    "password": "admin123"
  }'
```

## 📋 **Expected Success Response**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "275f547b-7b20-414d-86e8-aa4e1684a5f7",
    "name": "System Admin",
    "email": "admin@ngwavha.com",
    "role": "admin"
  }
}
```

## 🎯 **Most Likely Solution**

The password hash we used is probably incorrect. The best approach is:

1. **Generate a fresh hash** using the Node.js command above
2. **Update the database** with the new hash
3. **Test login again**

**Run the Node.js command to generate a correct hash for "admin123"!** 🔐
