# Start Elasticsearch + Kibana for GRC analytics (Windows-friendly)
Set-Location (Split-Path $PSScriptRoot -Parent)

function Test-DockerEngine {
  cmd /c "docker info >nul 2>&1" 2>$null | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Invoke-Docker {
  param([Parameter(Mandatory)][string[]]$DockerArgs)
  $output = & docker @DockerArgs 2>&1
  if ($output) { $output | Write-Host }
  return $LASTEXITCODE
}

Write-Host "Checking Docker..." -ForegroundColor Cyan
if (-not (Test-DockerEngine)) {
  Write-Host ""
  Write-Host "Docker engine is not running." -ForegroundColor Red
  Write-Host ""
  Write-Host "Quick fix (try in order):" -ForegroundColor Yellow
  Write-Host "  1. Start menu -> Docker Desktop -> wait for Engine running"
  Write-Host "  2. Or run:  npm run docker:start"
  Write-Host "  3. Settings -> Resources -> Memory: at least 4 GB"
  Write-Host "  4. Still stuck: Docker Desktop -> Troubleshoot -> Restart"
  Write-Host ""
  Write-Host "WSL 2 required. Admin PowerShell:  wsl --update" -ForegroundColor DarkGray
  exit 1
}

Write-Host "Pulling images (first run may take several minutes)..." -ForegroundColor Cyan
if ((Invoke-Docker -DockerArgs @('compose', 'pull', 'elasticsearch', 'kibana')) -ne 0) {
  Write-Host "Image pull failed. Check network/VPN and try again." -ForegroundColor Red
  exit 1
}

Write-Host "Removing stale containers if any..." -ForegroundColor Cyan
Invoke-Docker -DockerArgs @('rm', '-f', 'grc-elasticsearch', 'grc-kibana') | Out-Null

Write-Host "Starting Elasticsearch + Kibana..." -ForegroundColor Cyan
if ((Invoke-Docker -DockerArgs @('compose', 'up', '-d', 'elasticsearch', 'kibana')) -ne 0) {
  Write-Host ""
  Write-Host "Start failed. Recent Elasticsearch logs:" -ForegroundColor Red
  Invoke-Docker -DockerArgs @('logs', 'grc-elasticsearch', '--tail', '30') | Out-Null
  Write-Host ""
  Write-Host "Try a clean reset: npm run analytics:reset" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Waiting for Elasticsearch (up to 2 min)..." -ForegroundColor Cyan
$ok = $false
for ($i = 1; $i -le 24; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:9200" -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch { }
  Start-Sleep -Seconds 5
  Write-Host "  ...still starting ($i/24)"
}

if ($ok) {
  Write-Host ""
  Write-Host "Waiting for Kibana (up to 3 min, first start is slow)..." -ForegroundColor Cyan
  $kibanaOk = $false
  for ($i = 1; $i -le 36; $i++) {
    try {
      $r = Invoke-WebRequest -Uri "http://localhost:5601/api/status" -UseBasicParsing -TimeoutSec 5
      if ($r.Content -match 'available|degraded') { $kibanaOk = $true; break }
    } catch { }
    Start-Sleep -Seconds 5
    if ($i % 6 -eq 0) { Write-Host "  ...Kibana still starting ($i/36)" }
  }

  Write-Host ""
  Write-Host "Elasticsearch: http://localhost:9200" -ForegroundColor Green
  if ($kibanaOk) {
    Write-Host "Kibana:        http://localhost:5601" -ForegroundColor Green
    Write-Host "On /dashboard click Sync data to build the GRC dashboard." -ForegroundColor Green
  } else {
    Write-Host "Kibana: still starting - open http://localhost:5601 and wait for the home screen" -ForegroundColor Yellow
  }
} else {
  Write-Host "Elasticsearch not responding yet. Check logs:" -ForegroundColor Yellow
  Write-Host '  docker logs grc-elasticsearch --tail 50'
}
