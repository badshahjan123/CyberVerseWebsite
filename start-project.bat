@echo off
echo Starting CyberVerse Project...
echo.

echo Starting Backend Server...
cd backend
start cmd /k "npm start"
cd ..

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin Panel: http://localhost:5173/secure-admin-login
echo.
echo Press any key to exit...
pause > nul