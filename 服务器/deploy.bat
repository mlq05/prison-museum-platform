@echo off
REM 云开发云托管部署脚本 (Windows)
REM 使用方法: deploy.bat

echo ==========================================
echo 开始部署到云开发云托管...
echo ==========================================

REM 检查是否安装了 CloudBase CLI
where cloudbase >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 CloudBase CLI
    echo 请先安装: npm install -g @cloudbase/cli
    pause
    exit /b 1
)

REM 检查是否已登录（跳过检查，直接尝试部署，如果未登录会提示）
echo 检查登录状态...
REM 注意：如果未登录，部署时会自动提示登录

REM 部署到云托管
echo 开始部署...
echo 环境ID: prison-museum-dev-8e6hujc6eb768b
echo 服务名: museum-api
echo.
cloudbase run deploy -e prison-museum-dev-8e6hujc6eb768b -s museum-api --containerPort 80

if %errorlevel% equ 0 (
    echo ==========================================
    echo ✅ 部署成功！
    echo ==========================================
    echo 请在云开发控制台查看服务地址
) else (
    echo ==========================================
    echo ❌ 部署失败
    echo ==========================================
)

pause

