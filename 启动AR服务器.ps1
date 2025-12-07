# AR本地服务器启动脚本（PowerShell版本）

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动AR本地服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetPath = Join-Path $scriptPath "miniprogram\ar-pages"

# 切换到目标目录
Set-Location $targetPath
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# 检查Python
Write-Host "检查Python是否可用..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ [错误] 未找到Python，请先安装Python" -ForegroundColor Red
    Write-Host "下载地址: https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "按Enter退出"
    exit 1
}

Write-Host ""
Write-Host "启动HTTP服务器..." -ForegroundColor Yellow
Write-Host "访问地址: http://localhost:8000/marker-ar-demo.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动服务器
python -m http.server 8000

