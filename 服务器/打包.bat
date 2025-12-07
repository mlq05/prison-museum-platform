@echo off
chcp 65001 >nul
REM 服务器代码打包脚本 (Windows)
REM 用于云托管部署

echo ==========================================
echo 开始打包服务器代码...
echo ==========================================

REM 检查当前目录
if not exist "server.js" (
    echo ❌ 错误：请在 服务器 目录下运行此脚本
    pause
    exit /b 1
)

REM 创建临时打包目录
set PACKAGE_DIR=server-package
if exist "%PACKAGE_DIR%" (
    echo 清理旧的打包目录...
    rmdir /s /q "%PACKAGE_DIR%"
)
mkdir "%PACKAGE_DIR%"

echo.
echo 正在复制文件...

REM 复制必需文件
copy "server.js" "%PACKAGE_DIR%\" >nul
copy "package.json" "%PACKAGE_DIR%\" >nul
if exist "package-lock.json" copy "package-lock.json" "%PACKAGE_DIR%\" >nul
copy "Dockerfile" "%PACKAGE_DIR%\" >nul
if exist ".dockerignore" copy ".dockerignore" "%PACKAGE_DIR%\" >nul
if exist "cloudbaserc.json" copy "cloudbaserc.json" "%PACKAGE_DIR%\" >nul

REM 复制目录
echo 复制 db 目录...
xcopy "db" "%PACKAGE_DIR%\db\" /E /I /Y >nul

echo 复制 routes 目录...
xcopy "routes" "%PACKAGE_DIR%\routes\" /E /I /Y >nul

echo 复制 middleware 目录...
xcopy "middleware" "%PACKAGE_DIR%\middleware\" /E /I /Y >nul

echo 复制 scripts 目录...
xcopy "scripts" "%PACKAGE_DIR%\scripts\" /E /I /Y >nul

REM 删除旧的压缩包
if exist "server.zip" del "server.zip"

echo.
echo 正在压缩文件...
powershell -Command "Compress-Archive -Path '%PACKAGE_DIR%\*' -DestinationPath 'server.zip' -Force"

REM 清理临时目录
rmdir /s /q "%PACKAGE_DIR%"

echo.
echo ==========================================
echo ✅ 打包完成！
echo ==========================================
echo.
echo 打包文件：server.zip
echo.
echo 文件清单：
dir /b server.zip
echo.
echo 下一步：
echo 1. 在云开发控制台上传 server.zip
echo 2. 配置环境变量
echo 3. 点击部署
echo.
pause

