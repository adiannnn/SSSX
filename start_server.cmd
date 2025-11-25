@echo off
cd %~dp0
python -m http.server 8000
echo 服务器已启动在 http://localhost:8000
echo 按任意键停止服务器
pause >nul