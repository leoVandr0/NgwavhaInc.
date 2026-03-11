# Database Setup Instructions

## 1. Deploy the Code
```bash
git add server/src/routes/setup.routes.js server/src/index.js server/src/config/mysql.js
git commit -m "Add database setup endpoint and fix connection logging"
git push origin main
```

## 2. Run Database Setup
After Railway deploys the new code, make a POST request to:
```
POST https://your-app-url.railway.app/api/setup/database
```

You can use:
- **Browser**: Open the URL in your browser (it will show method not allowed, but you can use DevTools)
- **curl**: `curl -X POST https://your-app-url.railway.app/api/setup/database`
- **Postman/Insomnia**: Make a POST request

## 3. Expected Response
```json
{
  "success": true,
  "message": "Database tables created successfully",
  "tablesCreated": ["Users", "Categories", "Courses", "Enrollments", "Reviews", "Transactions", "LiveSessions", "CartItems", "WishlistItems", "Assignments", "Referrals", "Notifications"],
  "count": 12
}
```

## 4. Check Railway Logs
Go to your Railway service logs to see:
- Database connection debug info
- Table creation progress
- Any errors

## 5. Verify Tables
After setup, you should see all 12 tables in your Railway MySQL database.

## Important Notes
- This is a one-time setup - running it again will recreate all tables (delete existing data)
- The setup endpoint is not protected - remove it after use for security
- Your application will now connect properly to Railway's MySQL service
