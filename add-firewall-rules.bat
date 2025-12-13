@echo off
echo Adding Windows Firewall Rules for CyberVerse...
echo.

REM Add rule for backend port 5000
netsh advfirewall firewall add rule name="CyberVerse Backend" dir=in action=allow protocol=TCP localport=5000

REM Add rule for frontend port 5173
netsh advfirewall firewall add rule name="CyberVerse Frontend" dir=in action=allow protocol=TCP localport=5173

echo.
echo Firewall rules added successfully!
echo.
echo Backend: Port 5000 - ALLOWED
echo Frontend: Port 5173 - ALLOWED
echo.
echo You can now access from mobile:
echo   Frontend: http://192.168.2.109:5173
echo   Backend:  http://192.168.2.109:5000
echo.
pause
