@echo off
echo ==========================================
echo   Starting Mambusao DRRM Inventory...
echo ==========================================
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [WARNING] Dependencies not found. Running setup first...
    call setup.bat
)

echo [INFO] Launching development server...
npm run dev
pause
