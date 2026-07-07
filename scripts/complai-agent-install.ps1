param(
  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [Parameter(Mandatory = $true)]
  [string]$EnrollmentToken
)

$ErrorActionPreference = 'Stop'

$hostname = [System.Net.Dns]::GetHostName()
$platform = 'windows'

Write-Host "ComplAI endpoint agent — enrolling $hostname..."

$body = @{
  enrollmentToken = $EnrollmentToken
  hostname        = $hostname
  platform        = $platform
  agentVersion    = '0.1.0'
} | ConvertTo-Json

$enrollUrl = "$($ApiUrl.TrimEnd('/'))/api/agents/enroll"
$response = Invoke-RestMethod -Uri $enrollUrl -Method Post -Body $body -ContentType 'application/json'

if (-not $response.ok) {
  throw "Enrollment failed: $($response.error)"
}

$agentDir = Join-Path $env:ProgramData 'ComplAI\Agent'
New-Item -ItemType Directory -Force -Path $agentDir | Out-Null

$credentials = @{
  agentId     = $response.agentId
  agentSecret = $response.agentSecret
  apiUrl      = $ApiUrl.TrimEnd('/')
  enrolledAt  = (Get-Date).ToUniversalTime().ToString('o')
  bundleId    = $response.bundleId
  organizationId = $response.organizationId
}

$credPath = Join-Path $agentDir 'agent.credentials.json'
$credentials | ConvertTo-Json | Set-Content -Path $credPath -Encoding UTF8

Write-Host "Agent enrolled successfully."
Write-Host "  Agent ID: $($response.agentId)"
Write-Host "  Organization: $($response.organizationName)"
Write-Host "  Credentials: $credPath"
Write-Host ""
Write-Host "Next: pull IDAM config with:"
Write-Host "  Invoke-RestMethod `"$($ApiUrl.TrimEnd('/'))/api/agents/config?agentId=$($response.agentId)&agentSecret=<secret>`""
