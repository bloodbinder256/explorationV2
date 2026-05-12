@echo off
setlocal

echo ==========================================
echo  ExplorationV2 Version + GitHub Push Tool
echo ==========================================
echo.

if not exist "index.html" (
  echo ERROR: index.html was not found.
  echo Put this .bat file in the root of your project folder and run it there.
  echo.
  pause
  exit /b 1
)

set /p VERSION="Enter new cache version number, example 26: "

if "%VERSION%"=="" (
  echo ERROR: No version entered.
  pause
  exit /b 1
)

echo.
echo Updating cache-busting versions to ?v=%VERSION% ...
echo.

set "TMP_PS=%TEMP%\exploration_update_version_%RANDOM%.ps1"

> "%TMP_PS%" echo param([string]$Version)
>> "%TMP_PS%" echo $files = Get-ChildItem -Path . -Recurse -Filter *.html
>> "%TMP_PS%" echo $updated = 0
>> "%TMP_PS%" echo foreach ($file in $files) {
>> "%TMP_PS%" echo   $text = Get-Content $file.FullName -Raw
>> "%TMP_PS%" echo   $before = $text
>> "%TMP_PS%" echo   $text = [regex]::Replace($text, '\?v=\d+', '?v=' + $Version)
>> "%TMP_PS%" echo   $text = [regex]::Replace($text, '(href="(?!https?:^|data:^)[^"]+\.(?:css^|js))"', '$1?v=' + $Version + '"')
>> "%TMP_PS%" echo   $text = [regex]::Replace($text, "(href='(?!https?:^|data:^)[^']+\.(?:css^|js))'", '$1?v=' + $Version + "'")
>> "%TMP_PS%" echo   $text = [regex]::Replace($text, '(src="(?!https?:^|data:^)[^"]+\.(?:css^|js))"', '$1?v=' + $Version + '"')
>> "%TMP_PS%" echo   $text = [regex]::Replace($text, "(src='(?!https?:^|data:^)[^']+\.(?:css^|js))'", '$1?v=' + $Version + "'")
>> "%TMP_PS%" echo   if ($text -ne $before) { $updated++ }
>> "%TMP_PS%" echo   Set-Content -Path $file.FullName -Value $text -NoNewline
>> "%TMP_PS%" echo }
>> "%TMP_PS%" echo Write-Host "Checked $($files.Count) HTML files. Updated $updated files."

powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_PS%" "%VERSION%"
set "PS_RESULT=%ERRORLEVEL%"
del "%TMP_PS%" >nul 2>nul

if not "%PS_RESULT%"=="0" (
  echo.
  echo ERROR: Version update failed.
  pause
  exit /b 1
)

echo.
set /p MSG="Commit message, or press Enter for default: "

if "%MSG%"=="" set MSG=Update game files v%VERSION%

echo.
echo Git status:
git status

echo.
echo Adding files...
git add -A

echo.
echo Committing...
git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo Commit may have failed because there were no changes.
  echo Continuing to pull/push anyway...
)

echo.
echo Pulling latest changes from GitHub...
git pull origin main
if errorlevel 1 (
  echo.
  echo ERROR: Pull failed. You may have merge conflicts.
  echo Fix conflicts, then run:
  echo   git add -A
  echo   git commit -m "Resolve merge conflicts"
  echo   git push origin main
  echo.
  pause
  exit /b 1
)

echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo ERROR: Push failed.
  echo If it says non-fast-forward, run this script again or pull manually.
  echo Do NOT force push unless you are sure.
  echo.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo  Done! Version updated and pushed.
echo ==========================================
echo.
pause
