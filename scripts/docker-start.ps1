# Start Docker Desktop and wait for the engine (Windows)
$ErrorActionPreference = 'SilentlyContinue'

$dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (-not (Test-Path $dockerExe)) {
  Write-Host "Docker Desktop not found at: $dockerExe" -ForegroundColor Red
  Write-Host "Install from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting Docker Desktop..." -ForegroundColor Cyan
Start-Process $dockerExe

Write-Host "Waiting for engine (up to 3 min)..." -ForegroundColor Cyan
$ready = $false
for ($i = 1; $i -le 36; $i++) {
  cmd /c "docker info >nul 2>&1"
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    Write-Host "Docker engine is running." -ForegroundColor Green
    break
  }
  if ($i % 6 -eq 0) { Write-Host "  ...still starting ($i/36)" }
  Start-Sleep -Seconds 5
}

if (-not $ready) {
  Write-Host ""
  Write-Host "Docker Desktop did not start in time." -ForegroundColor Red
  Write-Host "Open Docker Desktop manually and check for errors in the UI." -ForegroundColor Yellow
  Write-Host "Common fixes:" -ForegroundColor Yellow
  Write-Host "  - Enable virtualization in BIOS"
  Write-Host "  - Run as admin: wsl --update"
  Write-Host "  - Docker Desktop -> Troubleshoot -> Restart"
  exit 1
}

Write-Host "Run: npm run analytics:up" -ForegroundColor Green
