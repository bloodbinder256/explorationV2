@echo off
echo Pushing game updates to GitHub...

git status
git add .
git commit -m "Update game"

git pull origin main
git push origin main

echo.
echo Done.
pause