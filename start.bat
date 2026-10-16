@echo off
setlocal enabledelayedexpansion

set PORT=5173
set URL=http://localhost:%PORT%

echo ===================================================
echo   Milestone App - Launcher
echo ===================================================

:: 1. Free port 5173 if in use
echo [1/3] Checking port %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":%PORT% *LISTENING"') do (
    echo Port %PORT% in use by PID %%a. Terminating...
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Ensure react-is and dependencies are installed
if not exist "node_modules\react-is" (
    echo [2/3] Installing missing dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies found.
)

:: Clear vite cache to prevent stale bundle errors
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite" 2>nul
)

:: 3. Launch Vite with native auto-open
echo [3/3] Starting Vite dev server and opening browser...
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

call npx vite --port %PORT% --open

if errorlevel 1 (
    echo [ERROR] Vite server exited with an error.
    pause
)
