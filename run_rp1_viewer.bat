@echo off
title RP1 3D Assembly Viewer
setlocal
set "PORT=8123"
pushd "%~dp0"

where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python not found on PATH. Install Python 3 ^(check "Add python.exe to PATH"^) and run again.
  pause
  popd
  exit /b 1
)

netstat -ano | findstr /c:":%PORT%" >nul 2>&1
if errorlevel 1 (
  echo [RP1] Starting local server on port %PORT% ...
  start "RP1 server" /min cmd /c "python -m http.server %PORT% --bind 127.0.0.1"
  timeout /t 2 /nobreak >nul
) else (
  echo [RP1] Server already running on port %PORT% ...
)

start "" "http://127.0.0.1:%PORT%/robot_app/index.html"
echo [RP1] Viewer opened in your browser.
echo        The minimized "RP1 server" window runs the local server -
echo        close it to stop sharing the page. You may close this window.
timeout /t 5 >nul
popd
