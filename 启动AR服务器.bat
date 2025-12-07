@echo off
chcp 65001 >nul
echo ========================================
echo   启动AR本地服务器
echo ========================================
echo.

cd /d "%~dp0miniprogram\ar-pages"
echo 当前目录: %CD%
echo.

echo 检查Python是否可用...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python已找到
echo.
echo 启动HTTP服务器...
echo 访问地址: http://localhost:8000/marker-ar-demo.html
echo.
echo 按 Ctrl+C 停止服务器
echo.

python -m http.server 8000

pause

