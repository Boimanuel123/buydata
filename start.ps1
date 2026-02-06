#!/usr/bin/env powershell

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
npm run dev
