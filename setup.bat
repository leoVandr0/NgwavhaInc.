@echo off
echo ========================================
echo Ngwavha - Local Setup Script
echo ========================================
echo.

echo Checking prerequisites...
echo.

echo [1/4] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/4] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please download from: https://www.python.org/
    pause
    exit /b 1
)
echo ✓ Python is installed
echo.

echo [3/4] Checking MySQL...
mysql --version
if %errorlevel% neq 0 (
    echo WARNING: MySQL command not found in PATH
    echo Make sure MySQL is installed and running
    echo Download from: https://dev.mysql.com/downloads/
)
echo.

echo [4/4] Checking MongoDB...
mongod --version
if %errorlevel% neq 0 (
    echo WARNING: MongoDB command not found in PATH
    echo Make sure MongoDB is installed and running
    echo Download from: https://www.mongodb.com/try/download/community
)
echo.

echo ========================================
echo Installing Dependencies...
echo ========================================
echo.

echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)
echo.

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)
cd ..
echo.

echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)
cd ..
echo.

echo Installing ML engine dependencies...
cd ml-engine
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install ML engine dependencies
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Setup Environment Files
echo ========================================
echo.

if not exist "server\.env" (
    echo Creating server\.env from template...
    copy server\.env.example server\.env
    echo IMPORTANT: Edit server\.env with your database credentials!
)

if not exist "client\.env" (
    echo Creating client\.env from template...
    copy client\.env.example client\.env
)

if not exist "ml-engine\.env" (
    echo Creating ml-engine\.env from template...
    copy ml-engine\.env.example ml-engine\.env
)

echo.
echo ========================================
echo Setup Complete! ✓
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Make sure MySQL and MongoDB are running
echo 2. Edit server\.env with your database credentials
echo 3. Create MySQL database: CREATE DATABASE ngwavha;
echo 4. Run: npm run dev (to start all services)
echo.
echo For detailed instructions, see: docs\SETUP.md
echo.
pause
