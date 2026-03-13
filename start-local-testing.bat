@echo off
echo ========================================
echo  Only You - Local Testing Launcher
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Admin Panel...
start "Admin Panel" cmd /k "cd admin-panel && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Mobile App...
start "Mobile App" cmd /k "cd mobile && npm start"

echo.
echo ========================================
echo  All services started!
echo ========================================
echo.
echo Backend:      http://localhost:5000
echo Admin Panel:  http://localhost:5173
echo Mobile App:   Check Expo terminal for QR code
echo.
echo Admin Login:
echo   Email: admin@onlyyou.com
echo   Password: REDACTED_LOCAL_ADMIN_PASSWORD
echo.
echo Press any key to close this window...
pause >nul
