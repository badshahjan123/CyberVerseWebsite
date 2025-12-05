@echo off
echo Starting CyberVerse (Local Mode)...
echo.

echo Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB not found! Please install MongoDB Community Server
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo Starting MongoDB locally...
start "MongoDB" mongod --dbpath "data\db"
timeout /t 3 /nobreak > nul

echo Setting up local database...
cd backend
node scripts\setupLocal.js
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)

echo Starting Backend (Local Mode)...
start cmd /k "set NODE_ENV=development && node server.js"
cd ..

echo Waiting for backend...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo ✅ Local servers started!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin: admin@cyberverse.com / admin123
echo.
pause