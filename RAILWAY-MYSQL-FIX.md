# Railway MySQL Setup Instructions

## The Problem
Your MySQL database service is shutting down because it's not properly configured as a Railway service. The logs show MySQL starts but then receives a SHUTDOWN signal.

## The Solution
I've updated your `railway.toml` to use Railway's built-in MySQL plugin, which is the correct way to run MySQL on Railway.

## Steps to Fix:

### 1. Push the Updated Configuration
```bash
git add railway.toml
git commit -m "Fix: Add Railway MySQL plugin configuration"
git push origin main
```

### 2. Add MySQL Plugin in Railway
1. Go to your Railway project
2. Click **"New Service"**
3. Select **"Plugin"**
4. Choose **"MySQL"**
5. Give it a name (e.g., "mysql")
6. Click **"Create Service"**

### 3. Connect Backend to MySQL
1. Go to your **backend service** in Railway
2. Click **"Variables"** tab
3. Add these environment variables:
   - `DATABASE_URL` = `${mysql.DATABASE_URL}`
   - `NODE_ENV` = `production`

### 4. Deploy and Test
1. Railway will automatically redeploy
2. Check that MySQL service stays running
3. Test your backend connection
4. Run the database setup: `POST /api/setup/database`

### 5. Verify
- MySQL service should show "Running" status
- Backend logs should show successful database connection
- All 12 tables should be created

## What Changed:
- Added MySQL plugin to `railway.toml`
- This creates a managed MySQL service
- Railway handles connection strings automatically
- Your backend will connect via `${mysql.DATABASE_URL}`

## Why This Works:
Railway's MySQL plugin:
- Manages the MySQL service lifecycle
- Provides automatic connection strings
- Handles restarts and health checks
- Integrates with Railway's networking

After this setup, your MySQL will stay running and your app will connect properly!
