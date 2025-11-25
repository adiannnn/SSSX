import http.server
import socketserver
import os

# 确保在正确的目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 设置服务器参数
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# 启动服务器 - 修改为绑定到所有网络接口
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"服务器已启动在 http://localhost:{PORT}")
    print(f"远程访问地址: http://你的IP地址:{PORT}")
    print("按 Ctrl+C 停止服务器")
    httpd.serve_forever()