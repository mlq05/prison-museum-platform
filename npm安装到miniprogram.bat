@echo off
chcp 65001 >nul
echo ========================================
echo   在miniprogram目录安装xr-frame
echo ========================================
echo.

cd /d "%~dp0miniprogram"
echo 当前目录: %CD%
echo.

echo 创建package.json...
if not exist "package.json" (
    echo { > package.json
    echo   "name": "miniprogram", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "dependencies": { >> package.json
    echo     "xr-frame": "^2.0.0" >> package.json
    echo   } >> package.json
    echo } >> package.json
    echo ✅ package.json已创建
) else (
    echo ⚠️ package.json已存在
)

echo.
echo 安装xr-frame...
call npm install xr-frame

if %errorlevel% equ 0 (
    echo.
    echo ✅ xr-frame安装成功！
    echo.
    echo 下一步操作：
    echo 1. 在微信开发者工具中：工具 → 构建npm
    echo 2. 设置基础库版本 ≥ 2.27.1
    echo 3. 编译测试
) else (
    echo.
    echo ❌ 安装失败，请检查npm是否正确安装
)

echo.
pause

