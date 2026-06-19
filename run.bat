@echo off
title UniPass Development Launcher
setlocal enabledelayedexpansion

echo ===================================================
echo               UNIPASS DEVELOPMENT LAUNCHER
echo ===================================================
echo.

rem Detect and display local IPv4 addresses
echo [System Info] Detecting local IPv4 addresses...

rem Check if node_modules exist, if not, install them automatically
if not exist "%~dp0server\node_modules" (
    echo [Setup] node_modules not found in server directory. Installing backend dependencies...
    pushd "%~dp0server"
    call npm install
    popd
)
if not exist "%~dp0mobile\node_modules" (
    echo [Setup] node_modules not found in mobile directory. Installing mobile dependencies...
    pushd "%~dp0mobile"
    call npm install
    popd
)
echo If you are testing on a physical device over Wi-Fi,
echo please ensure COMP_IP in "mobile/src/config.ts" matches
echo your ip address:

echo.
echo ===================================================
echo.
echo Select the startup configuration:
echo [1] Start Backend Server + Android Mobile App (Default)
echo [2] Start Backend Server Only
echo [3] Start Android Mobile App Only
echo.
set /p choice="Enter choice (1-3) [1]: "

if "%choice%"=="" set choice=1

echo.

rem Start Backend Server if option is 1 or 2
if "%choice%"=="1" set start_backend=true
if "%choice%"=="2" set start_backend=true

rem Start Mobile Frontend targets
if "%choice%"=="1" set start_frontend=android
if "%choice%"=="3" set start_frontend=android

if "%start_backend%"=="true" (
    echo Launching UniPass Backend Server...
    start "UniPass Backend Server" cmd /k "cd /d %~dp0server && npm run dev"
    timeout /t 2 >nul
)

if not "%start_frontend%"=="" (
    echo Launching UniPass Frontend [%start_frontend%]...
    start "UniPass Frontend - %start_frontend%" cmd /k "cd /d %~dp0mobile && npm run %start_frontend%"
)

echo.
echo Startup instructions sent! Check the opened terminal windows.
echo.
pause
