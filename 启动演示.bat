@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title ASTRA 本地演示服务

rem 已经有一个服务在 8787 上跑着，就直接开页面，不重复启动
netstat -ano | findstr ":8787" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo [ASTRA] 服务已在运行，直接打开 http://localhost:8787
  start "" "http://localhost:8787/"
  timeout /t 4 /nobreak >nul
  exit /b 0
)

rem 找可用的 Node：优先系统 node，其次 Qoder 自带运行时
set "RUN="
set "ELECTRON_RUN_AS_NODE=1"
where node >nul 2>&1
if not errorlevel 1 set "RUN=node"
if not defined RUN if exist "D:\download\Qoder\Qoder.exe" set "RUN=D:\download\Qoder\Qoder.exe"
if not defined RUN (
  echo [ASTRA] 未找到 Node.js，也没有 D:\download\Qoder\Qoder.exe
  echo         请先安装 Node.js（https://nodejs.org），再双击本文件。
  pause
  exit /b 1
)

echo [ASTRA] 正在启动本地服务：http://localhost:8787
echo [ASTRA] 请保持这个窗口开启，关闭它手势与 AI 解读都会停止。
start "" "http://localhost:8787/"
"%RUN%" "server\server.js"
pause
