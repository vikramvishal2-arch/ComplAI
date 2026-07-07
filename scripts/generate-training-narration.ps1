# Generates conversational narration WAV files for security-learning scenes.
# Output: public/training-narration/{moduleId}/{sceneId}.wav

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path (Join-Path $root "package.json"))) {
  $root = Split-Path -Parent $PSScriptRoot
}
$manifestPath = Join-Path $root "public\training-narration\manifest.json"
if (-not (Test-Path $manifestPath)) {
  Write-Error "Missing manifest. Run: npm run training:audio:manifest"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$outRoot = Join-Path $root "public\training-narration"

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = -2
$synth.Volume = 100

$preferred = @(
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Zira Desktop",
  "Microsoft Zira",
  "Microsoft David Desktop"
)

$installed = $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
$voiceName = $null
foreach ($name in $preferred) {
  if ($installed -contains $name) { $voiceName = $name; break }
}
if (-not $voiceName) {
  $voiceName = ($synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like "en-*" } | Select-Object -First 1).VoiceInfo.Name
}
if ($voiceName) {
  $synth.SelectVoice($voiceName)
  Write-Host "Using voice: $voiceName"
} else {
  Write-Warning "No English voice found; using default."
}

function Get-SsmlNarration {
  param([string]$Text, [string]$Voice)
  $sentences = [regex]::Split($Text.Trim(), '(?<=[.!?])\s+') | Where-Object { $_.Trim().Length -gt 0 }
  $body = ""
  foreach ($sentence in $sentences) {
    $safe = [System.Security.SecurityElement]::Escape($sentence.Trim())
    $body += "<s>$safe</s><break time='450ms'/>"
  }
  return @"
<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
  <voice name='$Voice'>
    <prosody rate='0.90' pitch='+2%'>
      $body
    </prosody>
  </voice>
</speak>
"@
}

$count = 0
foreach ($entry in $manifest.scenes) {
  $dir = Join-Path $outRoot $entry.moduleId
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $wavPath = Join-Path $dir "$($entry.sceneId).wav"
  Write-Host "Generating $wavPath"
  $ssml = Get-SsmlNarration -Text $entry.narration -Voice $voiceName
  $synth.SetOutputToWaveFile($wavPath)
  try {
    $synth.SpeakSsml($ssml)
  } catch {
  Write-Warning "SSML failed for $($entry.sceneId), falling back to plain speak."
    $synth.Speak($entry.narration)
  }
  $synth.SetOutputToNull()
  $count++
}

Write-Host "Done. Generated $count narration files."
