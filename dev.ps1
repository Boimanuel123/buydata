#!/usr/bin/env pwsh

# Kill any process using port 3000
Write-Host "Checking port 3000..."
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess -First 1
if ($process) {
    Write-Host "Killing process using port 3000..."
    Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start dev server on port 3000 explicitly
Write-Host "Starting dev server on port 3000..."
$env:PORT = 3000
& npm run dev
