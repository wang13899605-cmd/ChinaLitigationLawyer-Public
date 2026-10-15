@echo off
setlocal
set "NODE_EXE=node"
set "SITE_DIR=%~dp011_Workflow_Website"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install Node.js and add it to PATH.
  pause
  exit /b 1
)

start "Litigation Workflow Site" "%NODE_EXE%" "%SITE_DIR%\server.mjs"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4317"
endlocal
