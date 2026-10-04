@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   旅日語 Tabi Nihongo
echo   網址：http://localhost:8000
echo   關閉這個視窗就會停止伺服器
echo.
start "" http://localhost:8000
where py >nul 2>nul && (py -m http.server 8000 & goto :eof)
where python >nul 2>nul && (python -m http.server 8000 & goto :eof)
echo 找不到 Python，請先安裝：https://www.python.org/downloads/
pause
