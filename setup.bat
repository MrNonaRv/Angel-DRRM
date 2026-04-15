@echo off
echo ==========================================
echo   Mambusao DRRM Inventory System Setup
echo ==========================================
echo.

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. 
    echo Please download and install it from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/2] Node.js found.
echo [2/2] Installing dependencies (this may take a minute)...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Dependency installation failed. Check your internet connection.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Setup Complete!
echo   You can now use 'run.bat' to start the app.
echo ==========================================
echo.
pause
