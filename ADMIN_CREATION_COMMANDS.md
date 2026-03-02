# 🔧 Admin Creation Commands

## 🚀 **Option 1: Use the .mjs file (Recommended)**

```bash
cd server
node scripts/createAdmin.mjs
```

## 🚀 **Option 2: Use the .cjs file (CommonJS compatible)**

```bash
cd server
node scripts/createAdmin.cjs
```

## 🚀 **Option 3: One-liner with dynamic imports**

```bash
cd server
node -e "
(async () => {
  const bcrypt = require('bcryptjs');
  const { sequelize } = await import('./src/config/mysql.js');
  const { default: User } = await import('./src/models/User.js');
  
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

## 🚀 **Option 4: Manual SQL (If all else fails)**

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

After running any of the above commands:

- **Email:** `admin@ngwavha.com`
- **Password:** `admin123`
- **Access URL:** `/admin`

## 🎯 **Quick Test**

1. **Create admin** using one of the methods above
2. **Go to** `http://localhost:8080/login`
3. **Login with** admin@ngwavha.com / admin123
4. **Navigate to** `/admin`
5. **Should see** Admin Dashboard

**Choose Option 1 (.mjs file) for the most reliable result!** 🔐
