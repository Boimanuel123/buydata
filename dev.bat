@echo off
echo Checking and killing port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do (
    taskkill /PID %%a /F
)
timeout /t 2 /nobreak
echo Starting dev server on port 3000...
set PORT=3000
npm run dev
