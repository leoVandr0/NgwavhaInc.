@echo off
echo ==========================================
echo Ngwavha - Start MongoDB
echo ==========================================

echo [1/3] Attempting to start MongoDB Service...
net start MongoDB
if %errorlevel% equ 0 (
    echo ✓ MongoDB Service started!
    goto success
)

echo.
echo [2/3] Service start failed. Trying manual start...
echo Ensure folder C:\data\db exists...

if not exist "C:\data\db" (
    mkdir "C:\data\db"
    if %errorlevel% neq 0 (
        echo ❌ Failed to create C:\data\db. You may need Admin privileges.
    ) else (
        echo ✓ Created C:\data\db
    )
)

echo.
echo [3/3] Starting mongod.exe directly...
echo Path: "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"

"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\data\db"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start MongoDB manually.
    echo Please check if another instance is running or if you need Admin privileges.
    pause
    exit /b 1
)

:success
echo.
echo MongoDB is running!
echo You can now restart the Ngwavha server.
pause
