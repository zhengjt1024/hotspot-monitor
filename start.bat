@echo off
chcp 65001 >nul
title AI Hot Monitor
echo.
echo   ========================================
echo     AI Hot Monitor - 智能热点监控系统
echo   ========================================
echo.

cd /d "%~dp0"

:: === Check & install backend dependencies ===
if not exist "backend\node_modules\" (
    echo [Setup] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

:: === Check & install frontend dependencies ===
if not exist "frontend\node_modules\" (
    echo [Setup] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

:: === Kill existing processes on ports ===
echo [Clean] Checking ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING" 2^>nul') do (
    echo   Killing process on :3001 (PID %%a)
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173.*LISTENING" 2^>nul') do (
    echo   Killing process on :5173 (PID %%a)
    taskkill /f /pid %%a >nul 2>&1
)
echo.

:: === Start backend ===
echo [1/2] Starting backend...
start "AI-Hot-Monitor-Backend" /min cmd /c "cd /d "%~dp0backend" && npm run dev"
timeout /t 4 /nobreak >nul
echo   Backend : http://localhost:3001

:: === Start frontend ===
echo [2/2] Starting frontend...
start "AI-Hot-Monitor-Frontend" /min cmd /c "cd /d "%~dp0frontend" && npx vite --host"
timeout /t 5 /nobreak >nul
echo   Frontend: http://localhost:5173

echo.
echo   ========================================
echo     Open http://localhost:5173
echo   ========================================
echo.
echo   Close the two minimized windows to stop.
echo   Press any key to exit this launcher.
pause >nul