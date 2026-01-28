# Quick Start - Run Locally on Windows

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Python 3.9+** - [Download](https://www.python.org/)
- [ ] **MySQL 8+** - [Download](https://dev.mysql.com/downloads/)
- [ ] **MongoDB 6+** - [Download](https://www.mongodb.com/try/download/community)

---

## 🚀 Quick Setup (5 Minutes)

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```cmd
   setup.bat
   ```
   This will:
   - Check prerequisites
   - Install all dependencies
   - Create .env files

2. **Configure databases:**
   - Start MySQL and MongoDB services
   - Edit `server\.env` with your database credentials

3. **Create MySQL database:**
   ```sql
   CREATE DATABASE ngwavha;
   ```

4. **Start the application:**
   ```cmd
   start.bat
   ```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```cmd
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ../ml-engine && pip install -r requirements.txt
   ```

2. **Create environment files:**
   ```cmd
   copy server\.env.example server\.env
   copy client\.env.example client\.env
   copy ml-engine\.env.example ml-engine\.env
   ```

3. **Edit server\.env:**
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=ngwavha
   
   MONGODB_URI=mongodb://localhost:27017/ngwavha_content
   ```

4. **Start services:**
   ```cmd
   npm run dev
   ```

---

## 🗄️ Database Setup

### MySQL

1. **Start MySQL:**
   ```cmd
   net start MySQL80
   ```

2. **Create database:**
   ```cmd
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE skillforge;
   EXIT;
   ```

### MongoDB

1. **Start MongoDB:**
   ```cmd
   net start MongoDB
   ```

2. **Verify connection:**
   ```cmd
   mongosh
   ```

---

## 🌐 Access the Application

Once running, open your browser:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/health
- **ML Engine**: http://localhost:8000/health

---

## ⚠️ Common Issues

### Port Already in Use

If you see "EADDRINUSE" error:

```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### MySQL Connection Failed

1. Make sure MySQL service is running
2. Check credentials in `server\.env`
3. Verify database exists: `SHOW DATABASES;`

### MongoDB Connection Failed

1. Make sure MongoDB service is running
2. Check connection string in `server\.env`

### Python Module Not Found

```cmd
cd ml-engine
pip install -r requirements.txt
```

---

## 🎯 Test the Application

1. **Register a new account**: http://localhost:5173/register
2. **Create a course** (as instructor)
3. **Browse courses**: http://localhost:5173/courses
4. **Check API**: http://localhost:5000/health

---

## 📝 Next Steps

- Read [SETUP.md](./docs/SETUP.md) for detailed instructions
- Check [API.md](./docs/API.md) for API documentation
- See [FEATURES.md](./docs/FEATURES.md) for feature list

---

## 🆘 Need Help?

- Check [docs/SETUP.md](./docs/SETUP.md) for troubleshooting
- Review error messages in terminal
- Ensure all services are running
