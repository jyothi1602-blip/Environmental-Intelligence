# PowerShell Start Script for AURA Environmental Intelligence
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   AURA - ENVIRONMENTAL INTELLIGENCE MOBILE APPLICATION (MILESTONE 1) " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python run.py"

Write-Host "2. Starting Mobile Frontend on http://localhost:8081 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; npx.cmd expo start --web"

Write-Host ""
Write-Host "Applications launched!" -ForegroundColor Green
Write-Host "• FastAPI Backend:       http://localhost:8000" -ForegroundColor White
Write-Host "• Swagger Interactive:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "• Mobile Web Simulator:  http://localhost:8081" -ForegroundColor White
Write-Host "• Expo Go Mobile App:    Scan QR code in mobile terminal window" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

