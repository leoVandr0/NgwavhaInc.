# SkillForge Setup Guide

Complete guide to set up and run the SkillForge application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **Python** 3.9 or higher ([Download](https://www.python.org/))
- **MySQL** 8.0 or higher ([Download](https://dev.mysql.com/downloads/))
- **MongoDB** 6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Optional but Recommended
- **MySQL Workbench** - GUI for MySQL
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing

---

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd udemy_clone
```

---

## Step 2: Database Setup

### 2.1 MySQL Setup

1. **Start MySQL Server**
   ```bash
   # Windows (if installed as service)
   net start MySQL80
   
   # macOS (Homebrew)
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

2. **Create Database**
   ```bash
   mysql -u root -p
   ```
   
   Then in MySQL shell:
   ```sql
   CREATE DATABASE skillforge;
   CREATE USER 'skillforge_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON skillforge.* TO 'skillforge_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### 2.2 MongoDB Setup

1. **Start MongoDB Server**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Verify Connection**
   ```bash
   mongosh
   # Should connect successfully
   ```

---

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd server
npm install
```

### 3.2 Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=skillforge_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=skillforge

# MongoDB
MONGODB_URI=mongodb://localhost:27017/skillforge_content

# Stripe (Get from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Email (Get from https://sendgrid.com)
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@skillforge.com
EMAIL_FROM_NAME=SkillForge

# ML Engine
ML_ENGINE_URL=http://localhost:8000
```

### 3.3 Create Uploads Directory

```bash
mkdir uploads
```

### 3.4 Test Backend

```bash
npm run dev
```

You should see:
```
✅ MySQL connected successfully
✅ MongoDB connected successfully
🚀 SkillForge API Server running on port 5000
```

---

## Step 4: Frontend Setup

### 4.1 Install Dependencies

```bash
cd ../client
npm install
```

### 4.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4.3 Test Frontend

```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 5: ML Engine Setup

### 5.1 Create Virtual Environment

```bash
cd ../ml-engine

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 5.2 Install Dependencies

```bash
pip install -r requirements.txt
```

### 5.3 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
ML_PORT=8000

# Same database credentials as backend
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=skillforge_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=skillforge

MONGODB_URI=mongodb://localhost:27017/skillforge_content
```

### 5.4 Test ML Engine

```bash
python api/main.py
```

You should see:
```
* Running on http://0.0.0.0:8000
```

---

## Step 6: Stripe Setup (Optional for Development)

### 6.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Get your test API keys from Dashboard → Developers → API keys

### 6.2 Configure Webhooks

1. Install Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login:
   ```bash
   stripe login
   ```
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret to your `.env` file

---

## Step 7: SendGrid Setup (Optional for Development)

### 7.1 Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account (100 emails/day free)
3. Create API key from Settings → API Keys

### 7.2 Verify Sender Email

1. Go to Settings → Sender Authentication
2. Verify a single sender email
3. Use this email in `EMAIL_FROM` env variable

---

## Step 8: Seed Database (Optional)

### 8.1 Create Seed Data

Create `server/src/database/seed.js`:

```javascript
import { User, Category, Course } from '../models/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@skillforge.com',
    password: hashedPassword,
    role: 'admin'
  });

  // Create categories
  await Category.bulkCreate([
    { name: 'Web Development', slug: 'web-development', icon: '💻' },
    { name: 'Data Science', slug: 'data-science', icon: '📊' },
    { name: 'Business', slug: 'business', icon: '💼' },
    { name: 'Design', slug: 'design', icon: '🎨' }
  ]);

  console.log('✅ Database seeded successfully');
};

seedDatabase();
```

### 8.2 Run Seed Script

```bash
cd server
node src/database/seed.js
```

---

## Step 9: Run All Services

### Option 1: Run from Root (Recommended)

```bash
# From project root
npm run dev
```

This starts all three services concurrently.

### Option 2: Run Individually

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 3 - ML Engine:**
```bash
cd ml-engine
source venv/bin/activate  # or venv\Scripts\activate on Windows
python api/main.py
```

---

## Step 10: Verify Installation

### 10.1 Check Services

1. **Backend:** http://localhost:5000/health
   - Should return: `{"status":"OK"}`

2. **Frontend:** http://localhost:5173
   - Should show homepage

3. **ML Engine:** http://localhost:8000/health
   - Should return: `{"status":"OK"}`

### 10.2 Test User Registration

1. Go to http://localhost:5173/register
2. Create a new account
3. Check if you receive welcome email (if SendGrid configured)
4. Login with credentials

### 10.3 Test Course Creation (Instructor)

1. Register as instructor
2. Go to instructor dashboard
3. Create a test course
4. Verify it appears in database

---

## Common Issues & Solutions

### Issue: MySQL Connection Failed

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
```bash
# Reset MySQL password
mysql -u root -p
ALTER USER 'skillforge_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Issue: MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: Python Module Not Found

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Stripe Webhook Not Working

**Solution:**
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Copy the webhook signing secret to .env
```

---

## Development Tips

### Hot Reload

All services support hot reload:
- **Backend:** Nodemon watches for changes
- **Frontend:** Vite HMR
- **ML Engine:** Flask debug mode

### Database GUI Tools

**MySQL:**
```bash
# MySQL Workbench
# Connection: localhost:3306
# User: skillforge_user
```

**MongoDB:**
```bash
# MongoDB Compass
# Connection: mongodb://localhost:27017
```

### API Testing

Use Postman or curl:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Debugging

**Backend:**
```javascript
// Add console.log
console.log('Debug:', variable);

// Or use debugger
debugger;
```

**Frontend:**
```javascript
// React DevTools
// Redux DevTools (if using Redux)
console.log('State:', state);
```

---

## Next Steps

1. ✅ All services running
2. ✅ Database connected
3. ✅ Test user created
4. 📚 Read [API Documentation](./API.md)
5. 🏗️ Read [Architecture Overview](./ARCHITECTURE.md)
6. 🚀 Start building features!

---

## Getting Help

- **Documentation:** Check `/docs` folder
- **Issues:** Create GitHub issue
- **Community:** Join Discord/Slack (if available)

---

## Production Deployment

When ready to deploy, see:
- [Deployment Guide](./DEPLOYMENT.md)

Happy coding! 🚀
