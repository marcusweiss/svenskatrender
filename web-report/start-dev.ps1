$env:Path += ';C:\Program Files\nodejs\'
Set-Location $PSScriptRoot
Write-Host "Starting Vite dev server..." -ForegroundColor Green
npm run dev

