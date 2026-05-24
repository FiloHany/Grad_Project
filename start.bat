@echo off
REM CardioVision — quick launcher (always uses the project venv)
REM Usage: double-click this file, or run from a terminal:
REM   start.bat
REM   start.bat --port 8080

cd /d "%~dp0"

IF NOT EXIST "ENV\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at ENV\Scripts\python.exe
    echo Please run: python -m venv ENV ^&^& ENV\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo  CardioVision backend starting on http://localhost:8000
echo  Press Ctrl+C to stop.
echo.

ENV\Scripts\python.exe run.py %*
