@echo off
chcp 65001 >nul
echo ==========================================
echo 正在部署账号密码登录功能到云服务器...
echo ==========================================
echo.

REM 检查是否在服务器目录
if not exist "server.js" (
    echo ❌ 错误：请在 服务器 目录下运行此脚本
    pause
    exit /b 1
)

REM 检查是否安装了 CloudBase CLI
where cloudbase >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 CloudBase CLI
    echo.
    echo 请先安装：
    echo   npm install -g @cloudbase/cli
    echo.
    echo 然后登录：
    echo   cloudbase login
    echo.
    pause
    exit /b 1
)

echo ✅ CloudBase CLI 已安装
echo.

REM 部署信息
echo 部署配置：
echo   环境ID: prison-museum-dev-8e6hujc6eb768b
echo   服务名: museum-api
echo   容器端口: 80
echo.

REM 部署到云托管
echo 开始部署...
echo.
cloudbase run deploy -e prison-museum-dev-8e6hujc6eb768b -s museum-api --containerPort 80

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo ✅ 部署成功！
    echo ==========================================
    echo.
    echo 服务地址: https://museum-api-205770-6-1390408503.sh.run.tcloudbase.com
    echo.
    echo 新功能已上线：
    echo   ✓ 用户注册接口: POST /api/user/register
    echo   ✓ 账号密码登录: POST /api/user/login-account
    echo   ✓ 检查用户名: GET /api/user/check-username
    echo.
    echo 请在控制台查看部署日志和状态
) else (
    echo.
    echo ==========================================
    echo ❌ 部署失败
    echo ==========================================
    echo.
    echo 请检查：
    echo   1. 是否已登录: cloudbase login
    echo   2. 网络连接是否正常
    echo   3. 查看错误信息并重试
)

echo.
pause

