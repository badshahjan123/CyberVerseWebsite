@echo off
echo ========================================
echo   CyberVerse - Starting All Services
echo ========================================

echo [1/4] Applying ALL Kubernetes Labs...
kubectl apply -f backend\k8s-labs\all-labs.yaml

echo.
echo [2/4] Starting Lab Port Forwards with auto-restart...

start "Lab-Forensics" powershell -NoExit -Command "while($true){ Write-Host 'Starting Linux Forensics port-forward...' -ForegroundColor Green; kubectl port-forward svc/cyber-lab-forensics-service 32083:8083; Write-Host 'Restarting in 2s...' -ForegroundColor Yellow; Start-Sleep 2 }"
timeout /t 2 /nobreak >nul

start "Lab-Malware" powershell -NoExit -Command "while($true){ Write-Host 'Starting Malware Lab port-forward...' -ForegroundColor Green; kubectl port-forward svc/cyber-lab-malware-service 32230:8085; Write-Host 'Restarting in 2s...' -ForegroundColor Yellow; Start-Sleep 2 }"
timeout /t 2 /nobreak >nul

start "Lab-WebSecurity" powershell -NoExit -Command "while($true){ Write-Host 'Starting Web Security port-forward...' -ForegroundColor Green; kubectl port-forward svc/cyber-lab-web-security-service 32235:8087; Write-Host 'Restarting in 2s...' -ForegroundColor Yellow; Start-Sleep 2 }"
timeout /t 2 /nobreak >nul

start "Lab-ActiveDirectory" powershell -NoExit -Command "while($true){ Write-Host 'Starting Active Directory Lab port-forward...' -ForegroundColor Green; kubectl port-forward svc/cyber-lab-active-directory-service 32240:8088; Write-Host 'Restarting in 2s...' -ForegroundColor Yellow; Start-Sleep 2 }"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting Backend...
start "CyberVerse Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo [4/4] Starting Frontend...
start "CyberVerse Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   All services started!
echo   Backend          : http://localhost:5000
echo   Frontend         : http://localhost:5173
echo   Linux Forensics  : http://localhost:32083
echo   Malware Analysis : http://localhost:32230
echo   Web Security     : http://localhost:32235
echo   Active Directory : http://localhost:32240
echo   Lab windows band mat karna!
echo ========================================
pause
