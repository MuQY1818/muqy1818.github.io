#!/usr/bin/env python3
"""
本地预览服务器
运行此脚本来在本地预览您的网站
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# 设置端口
PORT = 8000

# 确保在正确的目录中运行
if not os.path.exists('index.html'):
    print("错误：请在包含 index.html 的目录中运行此脚本")
    sys.exit(1)

# 创建HTTP服务器
Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"服务器启动成功！")
        print(f"本地预览地址: http://localhost:{PORT}")
        print(f"按 Ctrl+C 停止服务器")
        
        # 自动打开浏览器
        webbrowser.open(f'http://localhost:{PORT}')
        
        # 启动服务器
        httpd.serve_forever()
        
except KeyboardInterrupt:
    print("\n服务器已停止")
except OSError as e:
    if e.errno == 10048:  # Windows端口被占用错误
        print(f"端口 {PORT} 已被占用，尝试使用端口 {PORT + 1}")
        PORT += 1
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"服务器启动成功！")
            print(f"本地预览地址: http://localhost:{PORT}")
            print(f"按 Ctrl+C 停止服务器")
            webbrowser.open(f'http://localhost:{PORT}')
            httpd.serve_forever()
    else:
        print(f"启动服务器时出错: {e}")
