@echo off
echo Installing MongoDB Community Server...
echo.

echo This will download and install MongoDB Community Server
echo Please follow the installation wizard when it opens.
echo.
echo After installation:
echo 1. Add MongoDB to your PATH (usually done automatically)
echo 2. Run "start-local.bat" to use offline mode
echo.

start https://www.mongodb.com/try/download/community

echo.
echo Alternative: Use MongoDB Compass for GUI management
start https://www.mongodb.com/try/download/compass

echo.
echo Press any key when installation is complete...
pause