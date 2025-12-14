@echo off
chcp 65001 >nul
echo ========================================
echo 修复 GitHub 推送 - 移除敏感信息
echo ========================================
echo.

echo 当前文件已经使用占位符，但历史提交中有真实密钥。
echo.
echo 选项 1：访问 GitHub 链接允许推送（如果旧密钥已失效）
echo   https://github.com/mlq05/prison-museum-platform/security/secret-scanning/unblock-secret/36e2hwPgzubqC7TodIVkQpQ6kjw
echo.
echo 选项 2：强制推送当前版本（覆盖历史）
echo   注意：这会覆盖远程历史，谨慎使用
echo.
echo 请选择：
echo [1] 打开 GitHub 允许推送链接
echo [2] 强制推送当前版本
echo [3] 取消
echo.

set /p choice="请输入选项 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 正在打开浏览器...
    start https://github.com/mlq05/prison-museum-platform/security/secret-scanning/unblock-secret/36e2hwPgzubqC7TodIVkQpQ6kjw
    echo.
    echo 请在浏览器中点击"Allow this secret"，然后按任意键继续推送...
    pause >nul
    echo.
    echo 正在推送代码...
    git push origin main
    if %errorlevel%==0 (
        echo.
        echo ✅ 代码推送成功！
    ) else (
        echo.
        echo ❌ 推送失败，请检查是否已在 GitHub 上允许推送
    )
) else if "%choice%"=="2" (
    echo.
    echo ⚠️  警告：即将强制推送，这会覆盖远程历史！
    set /p confirm="确认继续？(yes/no): "
    if /i "%confirm%"=="yes" (
        echo.
        echo 正在强制推送...
        git push origin main --force
        if %errorlevel%==0 (
            echo.
            echo ✅ 强制推送成功！
        ) else (
            echo.
            echo ❌ 强制推送失败
        )
    ) else (
        echo.
        echo 已取消操作
    )
) else (
    echo.
    echo 已取消操作
)

echo.
pause

