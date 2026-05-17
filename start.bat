@echo off
echo Stopping old servers...

for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

ping 127.0.0.1 -n 3 >nul

echo Starting API...
start "PeerForge API" cmd /k "cd /d C:\Users\USER\USER\PeerForge\apps\api && node dist/main.js"

ping 127.0.0.1 -n 3 >nul

echo Starting Web...
start "PeerForge Web" cmd /k "cd /d C:\Users\USER\USER\PeerForge\apps\web && npm run dev"

echo.
echo Done! 
echo Web:   http://localhost:3000
echo Admin: http://localhost:3000/login  ^(admin01test@gmail.com / Admin01@?^)
echo.
pause
