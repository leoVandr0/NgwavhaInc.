# 🔧 Working Admin Creation Command

## 🚀 **Option 1: Use the quickAdmin.js file (Recommended)**

```bash
cd server
node scripts/quickAdmin.js
```

## 🚀 **Option 2: One-liner with correct exports**

```bash
cd server
node -e "
(async () => {
  const bcrypt = require('bcryptjs');
  const mysqlModule = await import('./src/config/mysql.js');
  const userModule = await import('./src/models/User.js');
  
  const sequelize = mysqlModule.default;  // Get default export
  const User = userModule.default;        // Get default export
  
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

## 🚀 **Option 3: Manual SQL (If scripts fail)**

```sql
-- Connect to your MySQL database and run:
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

## 🔑 **Admin Credentials**

- **Email:** `admin@ngwavha.com`
- **Password:** `admin123`
- **Access URL:** `/admin`

## 🎯 **What Was Fixed**

The issue was that:
1. `mysql.js` exports `sequelize` as `export default sequelize`
2. `User.js` exports `User` as `export default User`
3. The dynamic import needed to use `.default` to get the actual exports

**Before (Broken):**
```javascript
const { sequelize } = await import('./src/config/mysql.js');  // ❌ Named import
const { default: User } = await import('./src/models/User.js'); // ❌ Wrong syntax
```

**After (Fixed):**
```javascript
const mysqlModule = await import('./src/config/mysql.js');     // ✅ Get module
const sequelize = mysqlModule.default;                          // ✅ Get default export
const User = userModule.default;                                // ✅ Get default export
```

**Try Option 1 first - it should work perfectly!** 🔐
