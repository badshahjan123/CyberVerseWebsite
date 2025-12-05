@echo off
echo Starting CyberVerse (Offline Mode)...
echo.

echo Starting Backend (Offline)...
cd backend
start cmd /k "npm run offline"
cd ..

echo Waiting for backend...
timeout /t 3 /nobreak > nul

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo ✅ Offline servers started!
echo.
echo Backend: http://localhost:5001 (Offline Mode)
echo Frontend: http://localhost:5173
echo Admin: admin@cyberverse.com / admin123
echo.
echo Press any key to exit...
pause > nul