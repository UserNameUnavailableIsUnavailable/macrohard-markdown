import http.server
import socketserver
import pathlib
import os
from urllib.parse import urlparse
from flask import Flask, request, send_file

SERVE_PATH = "dist"

SCRIPT_ROOT = os.path.dirname(__file__)
ROOT = os.path.join(SCRIPT_ROOT, SERVE_PATH)

app = Flask(__name__)

@app.route('/')
@app.route('/<path:requested_path>', methods=['GET'])
def handle(requested_path=''):
    requested_path = os.path.join(ROOT, requested_path)
    if (os.path.isdir(requested_path)): # 请求的路径对应于目录
        requested_path = os.path.join(requested_path, "index.html") # 改为请求 index.html
    if (not os.path.exists(requested_path)): # 请求的文件不存在
        if (requested_path.endswith(".html")): # 请求了不存在的 HTML 文件
            template_path = os.path.join(ROOT, "index.html")
            return send_file(template_path) # 返回 HTML 模板文件
    if (os.path.isfile(requested_path)): # 请求的文件存在，且是普通文件
        return send_file(requested_path)

    return "File not found", 404

if __name__ == "__main__":
    app.run(port=11451, debug=True)


# class MyHandler(http.server.SimpleHTTPRequestHandler):
#     def do_GET(self):
#         file_path = "." + self.path
#         response_file_path = ""
#         if (file_path.endswith('/')): response_file_path = "index.html"
#         elif (pathlib.Path(file_path).suffix == ".html"): response_file_path = os.path.dirname(file_path) + "index.html"
#         else: response_file_path = file_path
#         print(response_file_path)
#         if os.path.exists(response_file_path):  # Check if the .md file exists
#             self.path = response_file_path
#             return http.server.SimpleHTTPRequestHandler.do_GET(self)
#         else:
#             self.send_error(404, "File not found")

# PORT = 1236
# os.chdir("dist")
# try:
#     httpd = socketserver.TCPServer(("", PORT), MyHandler)
#     print(f"Serving on port {PORT}")
#     httpd.serve_forever()
# except KeyboardInterrupt:
#     print("\nKeyboard interrupt received, shutting down server.")
# except Exception as e:
#     print(f"error: {e}")
# finally:
#     if httpd:
#         print("shutdown")
#         httpd.server_close()
