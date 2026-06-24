$html = "file:///C:/Users/Vikram Vishal/Projects/grc-platform/docs/complyos-ciso-deck.html"
$pdf = "C:\Users\Vikram Vishal\Projects\grc-platform\docs\complyos-ciso-deck.pdf"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (-not (Test-Path $chrome)) {
  $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}

& $chrome `
  --headless=new `
  --disable-gpu `
  --no-pdf-header-footer `
  --run-all-compositor-stages-before-draw `
  --virtual-time-budget=10000 `
  "--print-to-pdf=$pdf" `
  $html

Start-Sleep -Seconds 1

if (Test-Path $pdf) {
  Get-Item $pdf | Format-Table Name, Length, LastWriteTime
  Write-Host "PDF created successfully"
  exit 0
}

Write-Error "PDF was not created"
exit 1
