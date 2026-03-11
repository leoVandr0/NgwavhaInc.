# Quick Database Fix - Alternative Method

Since the new routes aren't deployed yet, let's use the existing `/api/db/test` endpoint to check the database status and create the Users table directly.

## Step 1: Check Current Database Status
Open your browser and visit:
```
https://www.ngwavha.co.zw/api/db/test
```

This will show:
- Current tables (should only show "sessions")
- Database connection info

## Step 2: Create Users Table Directly
In browser console, run this SQL command:

```javascript
fetch('/api/db/test', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
  query: `
    CREATE TABLE IF NOT EXISTS Users (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      googleId VARCHAR(255) UNIQUE,
      isGoogleUser BOOLEAN DEFAULT FALSE,
      role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
      avatar VARCHAR(255) DEFAULT 'default-avatar.png',
      bio TEXT,
      headline VARCHAR(255),
      website VARCHAR(255),
      twitter VARCHAR(255),
      linkedin VARCHAR(255),
      youtube VARCHAR(255),
      isActive BOOLEAN DEFAULT TRUE,
      emailVerified BOOLEAN DEFAULT FALSE,
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `
})})
  .then(r => r.json())
  .then(console.log)
```

## Step 3: Verify Users Table
Check if Users table was created:
```
https://www.ngwavha.co.zw/api/db/test
```

## Step 4: Test Registration
Try registering a new user. The 500 errors should stop.

## Alternative: Wait for Deployment
If the above doesn't work, wait 5 more minutes for Railway to deploy the new routes, then try:
```
POST https://www.ngwavha.co.zw/api/simple/create-users
```

## Expected Result
After Users table exists:
- Registration should work (no more 500 errors)
- Login should work
- The app should function normally
