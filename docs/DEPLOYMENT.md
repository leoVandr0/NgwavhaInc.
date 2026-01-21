# Deployment Guide - Railway

This guide will help you deploy the SkillForge application to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository with your code
- Stripe account for payments
- SendGrid account for emails

---

## Step 1: Prepare Your Application

### 1.1 Create Production Environment Files

Create `.env` files for each service (don't commit these to git):

**server/.env:**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d

# Railway will provide these URLs
MYSQL_HOST=<railway-mysql-host>
MYSQL_PORT=3306
MYSQL_USER=<railway-mysql-user>
MYSQL_PASSWORD=<railway-mysql-password>
MYSQL_DATABASE=railway

MONGODB_URI=<railway-mongodb-uri>

STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

SENDGRID_API_KEY=<your-sendgrid-key>
EMAIL_FROM=noreply@yourdomain.com

CLIENT_URL=<your-frontend-url>
```

**client/.env:**
```env
VITE_API_URL=<your-backend-url>/api
```

### 1.2 Update package.json Scripts

Ensure your `server/package.json` has:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "build": "echo 'No build needed'"
  }
}
```

And `client/package.json` has:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create New Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository

### 2.2 Add MySQL Database

1. In your project, click "New"
2. Select "Database" → "MySQL"
3. Railway will provision a MySQL instance
4. Copy the connection details

### 2.3 Add MongoDB Database

1. Click "New" → "Database" → "MongoDB"
2. Copy the connection URI

### 2.4 Configure Backend Service

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Set **Root Directory**: `server`
4. Add environment variables:
   - Go to "Variables" tab
   - Add all variables from your `.env` file
   - Use Railway's provided database credentials

### 2.5 Deploy

1. Railway will automatically deploy
2. Get your backend URL from the "Settings" tab
3. Note this URL for frontend configuration

---

## Step 3: Deploy Frontend to Railway

### 3.1 Create Frontend Service

1. In the same project, click "New" → "GitHub Repo"
2. Select your repository again
3. Set **Root Directory**: `client`
4. Add environment variable:
   - `VITE_API_URL`: Your backend URL + `/api`

### 3.2 Configure Build Settings

1. Go to "Settings" → "Build"
2. **Build Command**: `npm run build`
3. **Start Command**: `npm run preview`

### 3.3 Deploy

Railway will build and deploy your frontend.

---

## Step 4: Deploy ML Engine to Railway

### 4.1 Create ML Service

1. Click "New" → "GitHub Repo"
2. Set **Root Directory**: `ml-engine`
3. Add environment variables:
   - Database credentials (same as backend)
   - `ML_PORT=8000`

### 4.2 Configure Python Runtime

Railway should auto-detect Python. If not:
1. Go to "Settings"
2. Set **Start Command**: `python api/main.py`

---

## Step 5: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `<your-backend-url>/api/webhooks/stripe`
4. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to Railway backend variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Database Migrations

### 6.1 Run MySQL Migrations

Connect to your Railway MySQL:
```bash
mysql -h <railway-host> -u <user> -p<password> railway
```

The Sequelize models will auto-sync on first run (in development mode).

For production, you may want to:
1. Disable auto-sync in `server/src/config/mysql.js`
2. Use migrations manually

### 6.2 Seed Initial Data (Optional)

Create a seed script or manually add:
- Categories
- Sample courses
- Admin user

---

## Step 7: Configure Custom Domain (Optional)

### 7.1 Frontend Domain

1. Go to frontend service → "Settings" → "Domains"
2. Click "Generate Domain" or add custom domain
3. Follow DNS configuration instructions

### 7.2 Backend Domain

1. Go to backend service → "Settings" → "Domains"
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Update `CLIENT_URL` in backend env vars

---

## Step 8: Monitoring and Logs

### View Logs

1. Click on any service
2. Go to "Deployments" tab
3. Click on latest deployment
4. View real-time logs

### Set Up Alerts

1. Go to project settings
2. Configure deployment notifications
3. Add webhook for Slack/Discord (optional)

---

## Step 9: Environment-Specific Configuration

### Production Optimizations

**Backend (`server/src/index.js`):**
```javascript
// Disable detailed error stacks in production
if (process.env.NODE_ENV === 'production') {
  app.use(errorHandler); // Don't send stack traces
}
```

**Database:**
```javascript
// Disable auto-sync in production
if (process.env.NODE_ENV === 'development') {
  await sequelize.sync({ alter: true });
}
```

---

## Step 10: Post-Deployment Checklist

- [ ] All services are running
- [ ] Database connections successful
- [ ] Frontend can communicate with backend
- [ ] Stripe webhooks configured
- [ ] Email sending works (SendGrid)
- [ ] ML recommendations API accessible
- [ ] SSL certificates active (Railway provides this)
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Custom domains configured (if applicable)

---

## Troubleshooting

### Backend Won't Start
- Check logs for database connection errors
- Verify all environment variables are set
- Ensure MySQL and MongoDB are running

### Frontend Can't Reach Backend
- Check `VITE_API_URL` is correct
- Verify CORS settings in backend
- Check Railway service URLs

### Database Connection Failed
- Verify credentials in environment variables
- Check Railway database service status
- Ensure IP whitelist allows Railway (usually not needed)

### Stripe Webhooks Not Working
- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook logs in Stripe Dashboard

---

## Scaling

Railway auto-scales based on usage. For manual scaling:

1. Go to service → "Settings" → "Resources"
2. Adjust:
   - Memory limit
   - CPU allocation
   - Replicas (for load balancing)

---

## Backup Strategy

### Database Backups

**MySQL:**
```bash
# Export
mysqldump -h <host> -u <user> -p<password> railway > backup.sql

# Import
mysql -h <host> -u <user> -p<password> railway < backup.sql
```

**MongoDB:**
```bash
# Export
mongodump --uri="<mongodb-uri>" --out=./backup

# Import
mongorestore --uri="<mongodb-uri>" ./backup
```

### Automated Backups

Railway provides automatic backups for databases. Configure in:
- Database service → "Settings" → "Backups"

---

## Cost Optimization

- Use Railway's free tier for development
- Monitor usage in "Usage" tab
- Optimize database queries
- Implement caching (Redis) for frequently accessed data
- Use CDN for static assets

---

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project Issues: GitHub Issues
