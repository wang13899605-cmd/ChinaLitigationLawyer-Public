@echo off
setlocal
set "SITE_DIR=%~dp012_Editable_Workflow_Flowchart"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SITE_DIR%\start-workflow-editor.ps1"
if errorlevel 1 (
  echo.
  echo Workflow editor failed to start. Please send the displayed error to Codex.
  pause
  exit /b 1
)
endlocal
