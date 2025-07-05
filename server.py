import json
import pathlib
import os
from urllib.parse import urljoin
from flask import Flask, send_file, redirect, request
from flask_cors import CORS

class ResourcesOrigin:
    def __init__(self, host: str, root: pathlib.Path):
        self.HOST = host
        self.ROOT = root
        self.main_markdown_url_ = None
        self.sidebar_yml_url_ = None
        self.footer_markdown_url_ = None

    @property
    def main_markdown_url(self):
        return self.main_markdown_url_
    @main_markdown_url.setter
    def main_markdown_url(self, path: pathlib.Path|str):
        if (isinstance(path, str)):
            self.main_markdown_url_ = path
        elif (path.is_file()):
            self.main_markdown_url_ = urljoin(self.HOST, path.relative_to(self.ROOT).as_posix())
    @property
    def sidebar_yml_url(self):
        return self.sidebar_yml_url_
    @sidebar_yml_url.setter
    def sidebar_yml_url(self, path: pathlib.Path|str):
        if (isinstance(path, str)):
            self.sidebar_yml_url_ = path
        elif (path.is_file()):
            self.sidebar_yml_url_ = urljoin(self.HOST, path.relative_to(self.ROOT).as_posix())
    @property
    def footer_markdown_url(self):
        return self.footer_markdown_url_
    @footer_markdown_url.setter
    def footer_markdown_url(self, path: pathlib.Path|str):
        if (isinstance(path, str)):
            self.footer_markdown_url_ = path
        elif (path.is_file()):
            self.footer_markdown_url_ = urljoin(self.HOST, path.relative_to(self.ROOT).as_posix())
    def to_json(self) -> str:
        data = {
            "main_markdown_url": self.main_markdown_url,
            "sidebar_yml_url": self.sidebar_yml_url,
            "footer_markdown_url": self.footer_markdown_url
        }
        return json.dumps(data)
        
SERVE_PATH = "dist"

SCRIPT_ROOT = os.path.dirname(__file__)
ROOT = os.path.join(SCRIPT_ROOT, SERVE_PATH)

SERVER_ROOT = pathlib.Path(__file__).parent.joinpath(SERVE_PATH)

app = Flask(__name__)
CORS(app)
@app.route('/')
@app.route('/<path:url_path>', methods=['GET'])
def handle(url_path=''):
    host = request.host_url
    requested_path = os.path.join(ROOT, url_path)
    if (os.path.isdir(requested_path)): # 请求的路径对应于目录
        redirectd_url = urljoin(base=host, url=f"{url_path}/index.html")
        return redirect(redirectd_url, code=302)  # Redirect to index.html
    if (not os.path.exists(requested_path)): # 请求的文件不存在
        if (requested_path.endswith(".html")): # 请求了不存在的 HTML 文件
            template_path = os.path.join(ROOT, "index.html")
            return send_file(template_path) # 返回 HTML 模板文件
        elif (requested_path.endswith(".json")):
            return GenerateJSON(host, pathlib.Path(requested_path))
    if (os.path.isfile(requested_path)): # 请求的文件存在，且是普通文件
        return send_file(requested_path)

    return "File not found", 404

def GenerateJSON(origin: str, p: pathlib.Path) -> str | None:
    # /foo/bar/index.json
    dir = p.parent # /foo/bar/
    base = p.stem # index
    ext = p.suffix # .json
    assert(ext == ".json")
    ro = ResourcesOrigin(origin, SERVER_ROOT)
    ro.main_markdown_url = dir.joinpath(f"{base}.rmd") # /foo/bar/index.rmd
    ro.sidebar_yml_url = dir.joinpath("sidebar.yml") # /foo/bar/sidebar.yml
    ro.footer_markdown_url = SERVER_ROOT.joinpath(f"footer.rmd") # /footer.rmd
    return ro.to_json()

if __name__ == "__main__":
    app.run(port=8080, debug=True)