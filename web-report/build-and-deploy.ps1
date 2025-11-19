# Build and Prepare for Deployment Script
# This script builds the production version and prepares files for upload

Write-Host "Building production version..." -ForegroundColor Green
& "C:\Program Files\nodejs\npm.cmd" run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild successful! Files are ready in the 'dist' folder." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Upload ALL contents from 'dist' folder to: som-institutet.se/svenskatrender/" -ForegroundColor Cyan
    Write-Host "2. Make sure to upload files directly, not the 'dist' folder itself" -ForegroundColor Cyan
    Write-Host "3. Visit: https://som-institutet.se/svenskatrender/ to verify" -ForegroundColor Cyan
    Write-Host "`nTo preview locally, run: & 'C:\Program Files\nodejs\npm.cmd' run preview" -ForegroundColor Yellow
} else {
    Write-Host "Build failed! Check the errors above." -ForegroundColor Red
}

