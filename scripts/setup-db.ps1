# Start PostgreSQL for ComplAI (requires Docker Desktop)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker is not installed or not on PATH." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Install Docker Desktop for Windows, then run:" -ForegroundColor Cyan
  Write-Host "  npm run db:up" -ForegroundColor White
  Write-Host "  npm run db:setup" -ForegroundColor White
  Write-Host ""
  Write-Host "Or install PostgreSQL 16 locally and create database/user matching .env.example"
  exit 1
}

Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Waiting for database..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  docker compose exec -T postgres pg_isready -U grc -d grc_platform 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 2
}

if (-not $ready) {
  Write-Host "PostgreSQL did not become ready in time." -ForegroundColor Red
  exit 1
}

Write-Host "Applying schema and seeding..." -ForegroundColor Cyan
npm run db:setup
Write-Host "Database ready." -ForegroundColor Green
