# Repair Docker Desktop when stuck on "Starting the Docker engine"
# Run PowerShell AS ADMINISTRATOR for best results.

Write-Host "=== Docker Desktop repair ===" -ForegroundColor Cyan
Write-Host ""

# 1. Stop Docker processes
Write-Host "[1/6] Stopping Docker processes..." -ForegroundColor Yellow
Get-Process -Name "Docker Desktop","com.docker.backend","com.docker.service" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 2. Shutdown WSL
Write-Host "[2/6] Shutting down WSL..." -ForegroundColor Yellow
wsl --shutdown 2>$null | Out-Null
Start-Sleep -Seconds 2

# 3. Update WSL
Write-Host "[3/6] Updating WSL..." -ForegroundColor Yellow
wsl --update 2>&1 | Write-Host

# 4. Check for docker-desktop distros (required by Docker Desktop)
Write-Host "[4/6] Checking WSL distributions..." -ForegroundColor Yellow
$distros = wsl -l -v 2>&1 | Out-String
Write-Host $distros

if ($distros -notmatch 'docker-desktop') {
  Write-Host ""
  Write-Host "MISSING: docker-desktop WSL distro (Docker cannot start without it)." -ForegroundColor Red
  Write-Host "Docker Desktop will recreate it on next launch after a factory reset." -ForegroundColor Yellow
}

# 5. Remove broken docker-desktop distros if they exist but are corrupted
Write-Host "[5/6] Cleaning stale docker-desktop distros (if any)..." -ForegroundColor Yellow
foreach ($name in @('docker-desktop', 'docker-desktop-data')) {
  $list = wsl -l -v 2>&1 | Out-String
  if ($list -match $name) {
    Write-Host "  Unregistering $name ..."
    wsl --unregister $name 2>$null | Out-Null
  }
}

# 6. Start Docker Desktop
Write-Host "[6/6] Starting Docker Desktop..." -ForegroundColor Yellow
$dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerExe) {
  Start-Process $dockerExe
  Write-Host ""
  Write-Host "Docker Desktop launched. Wait 2-3 minutes." -ForegroundColor Green
  Write-Host ""
  Write-Host "If still stuck:" -ForegroundColor Yellow
  Write-Host "  Docker Desktop -> Settings (gear) -> Troubleshoot -> Reset to factory defaults"
  Write-Host "  Then reboot PC and open Docker Desktop again."
  Write-Host ""
  Write-Host "When Engine running shows green, run: npm run analytics:up" -ForegroundColor Green
} else {
  Write-Host "Docker Desktop not found. Install from https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
}
