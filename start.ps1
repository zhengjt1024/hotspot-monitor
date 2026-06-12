# Hotspot Monitor - 一键启动前后端
Write-Host "=== Hotspot Monitor ===" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 启动后端
Write-Host "[1/2] 启动后端..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "node" -ArgumentList "src/index.js" -PassThru -WindowStyle Minimized -WorkingDirectory "$root\backend"
Start-Sleep -Seconds 3

try {
    $null = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 3
    Write-Host "  后端已启动: http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "  后端启动失败，请检查 backend\.env 配置" -ForegroundColor Red
}

# 启动前端
Write-Host "[2/2] 启动前端..." -ForegroundColor Yellow
$frontend = Start-Process cmd -ArgumentList "/c", "cd /d $root\frontend && npx vite --host" -WindowStyle Minimized
Start-Sleep -Seconds 4

try {
    $null = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  前端已启动: http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "  前端启动中，请稍候..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "打开浏览器访问 http://localhost:5173" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止所有服务" -ForegroundColor DarkGray

# 等待用户终止
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "服务已停止" -ForegroundColor Yellow
}
