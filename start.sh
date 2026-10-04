#!/usr/bin/env bash
# 在 WSL / macOS / Linux 啟動本機伺服器
cd "$(dirname "$0")"
echo "旅日語 Tabi Nihongo → http://localhost:8000"
python3 -m http.server 8000
