import json
import yaml
import pathlib
import os
from urllib.parse import urljoin
from flask import Flask, send_file, redirect, request
from flask_cors import CORS

SCRIPT_ROOT = pathlib.Path(__file__).parent # 脚本文件所在路径
SERVER_ROOT = SCRIPT_ROOT / "dist" # 服务器根目录
DOCUMENT_ROOT = SCRIPT_ROOT.parent / "macrohard-blog" # 文档路径

print(f"server root: {SERVER_ROOT}")
print(f"document root: {DOCUMENT_ROOT}")

def get_relative_path(path: pathlib.Path):
    if (path.is_absolute()):
        return path.relative_to(DOCUMENT_ROOT)
    return path

def get_absolute_path(path: pathlib.Path):
    if (path.is_absolute()):
        return DOCUMENT_ROOT / path.relative_to('/')
    else:
        return DOCUMENT_ROOT / path

def get_parent_path(path: pathlib.Path):
    assert(path.is_absolute())
    if (str(path) == str(DOCUMENT_ROOT)):
        return path
    else:
        return path.parent

def generate_json(json_path: pathlib.Path):
    assert(json_path.is_absolute())
    assert(json_path.suffix == ".json") # 必须是对 json 文件的请求
    obj: dict[str, str | None] = { "content": "---\ntitle: 404 Not Found\n---" }
    rmd_path = json_path.with_suffix(".rmd") # 后缀替换为 rmd
    if (rmd_path.is_file()): # 文件存在
        with rmd_path.open(mode='r', encoding='utf-8') as file:
            content = file.read() # 读取 rmd 文件
            obj["content"] = content
    # 逐级读取 metadata 文件并合并
    cd = rmd_path.parent # 从 rmd 所在的目录开始
    while True:
        metadata_path = cd.joinpath("metadata.yml")
        if (metadata_path.is_file()):
            with metadata_path.open(mode='r', encoding="utf-8") as file:
                raw = file.read()
                mt = yaml.safe_load(raw) # 读取 metadata
                if (mt): obj = mt | obj # 合并，若存在相同名称的元数据，则优先使用 json 中的
        parent = get_parent_path(cd)
        if (str(cd) == str(parent)): # 上一级目录仍是自身，说明已经到达根目录
            break
        else:
            cd = parent
    # 读取根目录的 metadata
    footer = obj.get("footer")
    if footer is not None:
        footer_path = get_absolute_path(pathlib.Path(footer))
        if footer_path.is_file():
            with footer_path.open(mode='r', encoding='utf-8') as file:
                footer = file.read()
                obj["footer"] = footer
        else:
            obj["footer"] = None
    ret = json.dumps(obj)
    return ret

app = Flask(__name__)
CORS(app)
@app.route('/')
@app.route('/<path:url_path>', methods=['GET'])
def handle(url_path=''):
    host = request.host_url
    requested_path = DOCUMENT_ROOT / url_path # 先在文档目录下查找资源
    if requested_path.is_dir(): # 请求的是某个路径
        redirect_path = str(pathlib.Path(url_path) / "index.html")
        return redirect(f"/{redirect_path}", code=302) # 重定向到 index.html
    elif (requested_path.is_file()):
        return send_file(str(requested_path))
    elif requested_path.suffix == ".json": # 请求 json 文件
        return generate_json(requested_path)
    # 文档目录下没有找到相应资源，在服务器目录下查找
    requested_path = SERVER_ROOT / url_path
    if requested_path.is_file():
        return send_file(str(requested_path))
    elif requested_path.suffix == ".html": # 请求不存在的 html，返回模板文件
        return send_file(str(SERVER_ROOT / "index.html"))
    return "File Not Found", 404

if __name__ == "__main__":
    app.run(port=8080, debug=False)