@echo off
chcp 65001 >nul
title 楠芳·俱乐部 - 一键部署工具

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║           楠芳·俱乐部 - 一键部署工具                      ║
echo ║              Windows Server 部署脚本                      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本！
    echo 右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 设置变量
set SITE_PORT=3000
set INSTALL_DIR=%~dp0
set DATA_DIR=%INSTALL_DIR%data
set UPLOADS_DIR=%INSTALL_DIR%uploads

echo [步骤 1/6] 检查环境...

:: 检查Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [信息] 未检测到Node.js，正在下载安装...
    
    :: 下载Node.js
    echo 正在下载Node.js...
    curl -L -o "%TEMP%\nodejs.msi" https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi
    
    if exist "%TEMP%\nodejs.msi" (
        echo 正在安装Node.js...
        msiexec /i "%TEMP%\nodejs.msi" /qn
        timeout /t 30 /nobreak >nul
        
        :: 刷新环境变量
        call refreshenv >nul 2>&1
        set PATH=%PATH%;C:\Program Files\nodejs\
    )
)

:: 再次检查
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] Node.js安装失败，请手动安装Node.js v18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [成功] Node.js 已就绪
node -v

echo.
echo [步骤 2/6] 创建必要的目录...

:: 创建目录
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"
if not exist "%UPLOADS_DIR%" mkdir "%UPLOADS_DIR%"
if not exist "%UPLOADS_DIR%\images" mkdir "%UPLOADS_DIR%\images"
if not exist "%UPLOADS_DIR%\avatars" mkdir "%UPLOADS_DIR%\avatars"
if not exist "%UPLOADS_DIR%\posts" mkdir "%UPLOADS_DIR%\posts"

echo [成功] 目录创建完成

echo.
echo [步骤 3/6] 安装依赖包...

cd /d "%INSTALL_DIR%server"

:: 检查package.json
if not exist "package.json" (
    echo [信息] 正在初始化项目...
    call npm init -y
    call npm install express multer cors helmet compression
) else (
    echo [信息] 正在安装依赖...
    call npm install
)

echo [成功] 依赖安装完成

echo.
echo [步骤 4/6] 创建Windows服务...

:: 创建服务启动脚本
echo @echo off > "%INSTALL_DIR%start-server.bat"
echo cd /d "%INSTALL_DIR%server" >> "%INSTALL_DIR%start-server.bat"
echo node server.js >> "%INSTALL_DIR%start-server.bat"

:: 创建服务停止脚本
echo @echo off > "%INSTALL_DIR%stop-server.bat"
echo taskkill /f /im node.exe 2^>nul >> "%INSTALL_DIR%stop-server.bat"
echo echo 服务已停止 >> "%INSTALL_DIR%stop-server.bat"

:: 使用NSSM创建服务（如果存在）
where nssm >nul 2>&1
if %errorLevel% equ 0 (
    nssm stop NanfangClub >nul 2>&1
    nssm remove NanfangClub confirm >nul 2>&1
    nssm install NanfangClub "C:\Program Files\nodejs\node.exe" "server.js"
    nssm set NanfangClub AppDirectory "%INSTALL_DIR%server"
    nssm set NanfangClub DisplayName "楠芳·俱乐部"
    nssm set NanfangClub Start SERVICE_AUTO_START
    nssm start NanfangClub
    echo [成功] 已创建Windows服务
) else (
    echo [提示] 未安装NSSM，服务将以普通进程运行
)

echo.
echo [步骤 5/6] 配置防火墙...

:: 添加防火墙规则
netsh advfirewall firewall add rule name="楠芳·俱乐部-HTTP" dir=in action=allow protocol=tcp localport=%SITE_PORT% >nul 2>&1
netsh advfirewall firewall add rule name="楠芳·俱乐部-HTTP" dir=out action=allow protocol=tcp localport=%SITE_PORT% >nul 2>&1

echo [成功] 防火墙已配置

echo.
echo [步骤 6/6] 启动服务器...

:: 启动服务器
cd /d "%INSTALL_DIR%server"
start "楠芳·俱乐部服务器" cmd /c "node server.js"

:: 等待服务器启动
timeout /t 5 /nobreak >nul

:: 检查服务器是否运行
curl -s http://localhost:%SITE_PORT% >nul 2>&1
if %errorLevel% equ 0 (
    echo [成功] 服务器已启动
) else (
    echo [警告] 服务器可能未正确启动，请检查日志
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                    部署完成！                              ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  访问地址: http://localhost:%SITE_PORT%                      ║
echo ║  局域网访问: http://您的IP:%SITE_PORT%                        ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  数据目录: %DATA_DIR%                  ║
echo ║  上传目录: %UPLOADS_DIR%              ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  管理命令:                                                  ║
echo ║  启动服务: 运行 start-server.bat                           ║
echo ║  停止服务: 运行 stop-server.bat                            ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: 打开浏览器
echo 按任意键在浏览器中打开网站...
pause >nul
start http://localhost:%SITE_PORT%

exit /b 0