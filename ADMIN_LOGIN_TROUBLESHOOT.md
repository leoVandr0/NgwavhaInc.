# 🔧 Admin Login Troubleshooting

## 🚨 **Issue: Invalid Credentials**

The admin credentials `admin@ngwavha.com` / `admin123` are not working. Let's verify and fix this.

## 🔍 **Step 1: Check if Admin Exists**

### **Connect to MySQL:**
```bash
mysql -u root -p
USE ngwavha;
```

### **Check for Admin Account:**
```sql
SELECT id, name, email, role, is_verified FROM User WHERE email = 'admin@ngwavha.com';
```

### **If No Admin Exists:**
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

### **If Admin Exists but Wrong Password:**
```sql
UPDATE User 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    is_verified = 1
WHERE email = 'admin@ngwavha.com';
```

## ✅ **Step 2: Verify Admin Created**

```sql
SELECT id, name, email, role, is_verified FROM User WHERE email = 'admin@ngwavha.com';
```

**Should show:**
```
+--------------------------------------+------------+-------------------+-------+--------------+
| id                                   | name       | email             | role  | is_verified  |
+--------------------------------------+------------+-------------------+-------+--------------+
| [uuid]                               | Admin User | admin@ngwavha.com | admin |           1  |
+--------------------------------------+------------+-------------------+-------+--------------+
```

## 🚀 **Step 3: Test Login**

### **Exit MySQL:**
```sql
exit
```

### **Test Login:**
1. **Go to:** `http://localhost:8080/login`
2. **Email:** `admin@ngwavha.com`
3. **Password:** `admin123`
4. **Should login successfully**

## 🔧 **Alternative: Create New Admin**

If the above doesn't work, create a fresh admin:

```sql
-- Delete existing admin if exists
DELETE FROM User WHERE email = 'admin@ngwavha.com';

-- Create new admin
INSERT INTO User (id, name, email, password, role, is_verified, created_at, updated_at)
VALUES (
    UUID(), 
    'System Admin', 
    'admin@ngwavha.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'admin', 
    1, 
    NOW(), 
    NOW()
);
```

## 🔍 **Debug Login Process**

### **Check Server Logs:**
```bash
# Start server and watch for login attempts
npm start
```

### **Test Login API Directly:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ngwavha.com",
    "password": "admin123"
  }'
```

**Should return:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@ngwavha.com",
    "role": "admin"
  }
}
```

## 🚨 **Common Issues**

### **Issue 1: Wrong Password Hash**
- **Solution:** Use the provided bcrypt hash for "admin123"

### **Issue 2: Admin Not Verified**
- **Solution:** Set `is_verified = 1`

### **Issue 3: Case Sensitivity**
- **Solution:** Use exact email: `admin@ngwavha.com`

### **Issue 4: Server Not Running**
- **Solution:** Ensure server is running on port 8080

## 📋 **Verification Checklist**

- [ ] **Admin exists** in database
- [ ] **Password hash** is correct
- [ ] **is_verified = 1**
- [ ] **Server is running**
- [ ] **Login API** returns token
- [ ] **Can access** admin panel at `/admin`

## 🎯 **Quick Fix Commands**

### **One-Liner Admin Creation:**
```sql
INSERT INTO User (id, name, email, password, role, is_verified, created_at, updated_at) VALUES (UUID(), 'Admin User', 'admin@ngwavha.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', is_verified = 1;
```

**Run this in MySQL, then try logging in again!** 🔐
