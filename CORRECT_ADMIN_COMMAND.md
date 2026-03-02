# 🔧 Correct Admin Creation Command

## ✅ **Based on Your DESCRIBE Output**

The User table exists with these relevant columns:
- `id` (char(36))
- `name` (varchar(255))
- `email` (varchar(255))
- `password` (varchar(255))
- `role` (enum)
- `is_verified` (tinyint(1))
- `created_at` (datetime)
- `updated_at` (datetime)

## 🚀 **Run This Command in MySQL**

```sql
INSERT INTO User (id, name, email, password, role, is_verified, created_at, updated_at)
VALUES (
    UUID(), 
    'Admin User', 
    'admin@ngwavha.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'admin', 
    1, -- is_verified = 1 (true)
    NOW(), 
    NOW()
);
```

## 🔍 **Verify Admin Created**

```sql
SELECT id, name, email, role, is_verified FROM User WHERE role = 'admin';
```

## 🚀 **Then Start Server**

```sql
exit
```

```bash
cd server
npm start
```

## 🔑 **Admin Credentials**

- **Email:** `admin@ngwavha.com`
- **Password:** `admin123`

## 🎯 **Test Everything**

1. **Server should start** without import errors (fixed)
2. **Go to:** `http://localhost:8080/login`
3. **Login with:** admin@ngwavha.com / admin123
4. **Navigate to:** `http://localhost:8080/admin`
5. **Should see:** Admin Dashboard

## 📋 **Key Differences Fixed**

### **Before (Wrong):**
```sql
-- ❌ Wrong column names
INSERT INTO Users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt)
```

### **After (Correct):**
```sql
-- ✅ Correct column names (snake_case)
INSERT INTO User (id, name, email, password, role, is_verified, created_at, updated_at)
```

**You're in MySQL right now - just copy and paste the correct INSERT command!** 🔐
