@echo off
echo Checking project status...
echo.

git status
echo.

echo Pulling latest updates from GitHub...
echo.

git pull origin main

echo.
echo Done.
pause