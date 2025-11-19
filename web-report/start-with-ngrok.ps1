# PowerShell script to start dev server and ngrok together
# Usage: .\start-with-ngrok.ps1

Write-Host "Starting dev server..." -ForegroundColor Green

# Start dev server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; & 'C:\Program Files\nodejs\npm.cmd' run dev" -WindowStyle Normal

# Wait a moment for server to start
Start-Sleep -Seconds 3

Write-Host "`nDev server should be running on http://localhost:5173" -ForegroundColor Yellow
Write-Host "`nNow starting ngrok..." -ForegroundColor Green
Write-Host "`nNOTE: You need to have ngrok.exe downloaded and in your PATH, or" -ForegroundColor Yellow
Write-Host "      run this script from the folder where ngrok.exe is located.`n" -ForegroundColor Yellow

# Check if ngrok is available
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "ngrok not found in PATH. Trying current directory..." -ForegroundColor Yellow
    if (Test-Path ".\ngrok.exe") {
        Write-Host "Found ngrok.exe in current directory!" -ForegroundColor Green
        .\ngrok.exe http 5173
    } else {
        Write-Host "`nERROR: ngrok.exe not found!" -ForegroundColor Red
        Write-Host "`nPlease either:" -ForegroundColor Yellow
        Write-Host "1. Download ngrok from https://ngrok.com/download" -ForegroundColor Yellow
        Write-Host "2. Extract ngrok.exe to this folder, OR" -ForegroundColor Yellow
        Write-Host "3. Add ngrok to your PATH" -ForegroundColor Yellow
        Write-Host "`nThen run this script again.`n" -ForegroundColor Yellow
        Write-Host "Or manually run: ngrok http 5173" -ForegroundColor Cyan
        pause
        exit
    }
} else {
    Write-Host "Found ngrok! Starting tunnel..." -ForegroundColor Green
    ngrok http 5173
}

