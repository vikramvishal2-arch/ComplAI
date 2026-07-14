@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

echo.
echo === Prisma generate (Windows EPERM fix) ===
echo.

echo [1/4] Stopping Next.js dev servers on ports 3000 and 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [2/4] Stopping Node.js processes that may lock Prisma engine...
for /f "tokens=2" %%p in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr /I "PID:"') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=2" %%p in ('tasklist /FI "IMAGENAME eq query-engine-windows.exe" /FO LIST ^| findstr /I "PID:"') do taskkill /F /PID %%p >nul 2>&1

ping -n 3 127.0.0.1 >nul

echo [3/4] Clearing Prisma engine cache only...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

echo [4/4] Generating Prisma Client...
node "node_modules\prisma\build\index.js" generate
if errorlevel 1 (
  echo.
  echo FAILED — EPERM usually means something still has the file open.
  echo.
  echo Do this manually:
  echo   1. Close ALL Cursor terminal tabs running npm run dev
  echo   2. Close Prisma Studio
  echo   3. Task Manager - end every "Node.js JavaScript Runtime"
  echo   4. Run this script again
  echo.
  echo If OneDrive syncs this folder, pause sync or move the repo outside OneDrive.
  echo.
  pause
  exit /b 1
)

findstr /C:"auditProgram" "node_modules\.prisma\client\index.d.ts" >nul 2>&1
if errorlevel 1 (
  echo.
  echo FAILED — Prisma generated but audit models are still missing.
  echo Check prisma\schema.prisma and run this script again.
  echo.
  pause
  exit /b 1
)

echo.
echo SUCCESS — audit models found in Prisma client. Run: npm run dev
echo.
pause
