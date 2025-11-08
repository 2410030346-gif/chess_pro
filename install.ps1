# Chess Website - Quick Install Script
# Run this script from the project root folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chess Website - Installation Script  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm detected: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install client dependencies
Write-Host "[1/2] Installing client dependencies..." -ForegroundColor Cyan
Set-Location -Path "client"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Client installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Client dependencies installed" -ForegroundColor Green
Set-Location -Path ".."

Write-Host ""

# Install server dependencies
Write-Host "[2/2] Installing server dependencies..." -ForegroundColor Cyan
Set-Location -Path "server"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Server installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Server dependencies installed" -ForegroundColor Green
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete! ✓             " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. (Optional) Download Stockfish.js for AI mode:" -ForegroundColor White
Write-Host "   - Visit: https://github.com/nmrugg/stockfish.js/" -ForegroundColor Gray
Write-Host "   - Place stockfish.js in: client\public\stockfish.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the server (in this terminal):" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the client (in a NEW terminal):" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more help, see:" -ForegroundColor White
Write-Host "   - README.md (full documentation)" -ForegroundColor Gray
Write-Host "   - docs\QUICKSTART.md (quick start guide)" -ForegroundColor Gray
Write-Host "   - docs\SETUP.md (detailed setup)" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy chess playing! ♟️" -ForegroundColor Green
