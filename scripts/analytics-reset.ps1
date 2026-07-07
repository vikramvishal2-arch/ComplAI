# Remove Elasticsearch/Kibana containers and data volume for a clean restart
Set-Location (Split-Path $PSScriptRoot -Parent)

cmd /c "docker info >nul 2>&1" 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker is not running - skipped container cleanup." -ForegroundColor Yellow
  Write-Host "Start Docker Desktop first, then run: npm run analytics:up" -ForegroundColor Yellow
  exit 0
}

$ErrorActionPreference = 'SilentlyContinue'
& docker compose stop elasticsearch kibana 2>$null | Out-Null
& docker rm -f grc-elasticsearch grc-kibana 2>$null | Out-Null
& docker volume rm grc-platform_grc_es_data 2>$null | Out-Null
& docker volume rm grc_es_data 2>$null | Out-Null
$ErrorActionPreference = 'Continue'

Write-Host "Analytics stack reset. Run: npm run analytics:up" -ForegroundColor Green
