@echo off
title Hellper Dev Server

echo Starting Hellper development server...
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Start server in background
start /min cmd /c "node serve.js"

:: Wait for server to start
timeout /t 2 /nobreak >nul

:: Open browser
echo Opening browser at http://localhost:3000/
start http://localhost:3000/

echo.
echo Server is running in background.
echo Close the minimized command window to stop the server.
echo.
pause
