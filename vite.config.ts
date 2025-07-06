import YAML from "js-yaml";
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, ViteDevServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// vite-plugin-html-fallback.js
import FS from 'fs';
import PATH from 'path';
import { assert } from "node:console";
import mime from "mime-types";
import { IncomingMessage, ServerResponse } from "node:http";

const SERVER_ROOT = PATH.normalize(PATH.dirname(__filename));
const DOCUMENT_ROOT = PATH.normalize(PATH.join(SERVER_ROOT, "public"));

function getRelativePath(path: string) {
  if (PATH.isAbsolute(path)) {
    return PATH.relative(DOCUMENT_ROOT, path);
  }
  return path;
}

function getAbsolutePath(path: string) {
  if (PATH.isAbsolute(path)) {
    const root = PATH.parse(path).root;
    return PATH.join(DOCUMENT_ROOT, PATH.relative(root, path));
  } else { // 相对路径
    return PATH.join(DOCUMENT_ROOT, path);
  }
}

function getParentPath(path: string) {
  assert(PATH.isAbsolute(path));
  if (PATH.normalize(path) === DOCUMENT_ROOT) {
    return path;
  } else {
    return PATH.dirname(path);
  }
}

function isFile(path: string) {
  try {
    const stat = FS.statSync(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

function isDirectory(path: string) {
  try {
    const stat = FS.statSync(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

function generateJSON(file_path: string) {
  assert(PATH.isAbsolute(file_path));
  assert(file_path.endsWith(".json")); // 必须是对 json 的请求
  const rmd_path = file_path.replace(/json$/, "rmd"); // 用于获取 rmd 文件
  let json: { content: string, sidebar?: string | null, footer?: string | null } = {
    content: "---\ntitle: 404 Not Found\n---"
  };
  if (isFile(rmd_path)) {
    const content = FS.readFileSync(rmd_path, "utf-8");
    json.content = content;
  }
  let cd = PATH.dirname(rmd_path);
  while (true) {
    const metadata_path = PATH.join(cd, "metadata.yml");
    if (isFile(metadata_path)) {
      const raw = FS.readFileSync(metadata_path, "utf-8");
      const obj = YAML.load(raw) as object;
      json = { ...obj, ...json }; // 目录越具体，元数据优先级越高
    }
    const parent = getParentPath(cd);
    if (cd === parent) break;
    else cd = parent;
  }
  if (json.footer) {
    const footer_path = getAbsolutePath(json.footer);
    if (isFile(footer_path)) {
      const footer = FS.readFileSync(footer_path, "utf-8");
      json.footer = footer;
    } else {
      json.footer = null;
    }
  }
  const ret = JSON.stringify(json);
  return ret;
}

function respondWithFile(requested_path: string, res: ServerResponse<IncomingMessage>) {
  FS.stat(requested_path, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    const mime_type = mime.lookup(requested_path) || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime_type,
      "Content-Length": stats.size
    });
    FS.createReadStream(requested_path).pipe(res);
  });
}

function middleware() {
  return {
    name: 'html-fallback',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || req.method !== "GET") {
          return next();
        }
        const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
        let requested_path = PATH.join(DOCUMENT_ROOT, req.url ?? "");
        if (isDirectory(requested_path)) { // 对目录的请求重定向到对 index.html 的请求
          const redirect_path = PATH.posix.join(req.url, "index.html");
          url.pathname = redirect_path;
          res.writeHead(302, { Location: url.pathname + url.search }); // 重定向，同时保留参数
          return res.end();
        } else if (isFile(requested_path)) { // 请求的文件在 DOCUMENT_ROOT 下存在
          return respondWithFile(requested_path, res);
        } else if (requested_path.endsWith(".json")) { // 请求的文件在 DOCUMENT_ROOT 下不存在，但其类型为 json，可以自动生成
          const json = generateJSON(requested_path);
          res.setHeader("Content-Type", "text/json");
          return res.end(json);
        }
        // DOCUMENT_ROOT 下找不到相应的资源，在服务器目录下查找
        requested_path = PATH.join(SERVER_ROOT, req.url);
        if (isFile(requested_path)) {
          return next(); // 由 vite 处理该文件
        } else if (requested_path.endsWith(".html")) { // 请求的文件在 SERVER_ROOT 下不存在，但其类型为 html，可以套用模板
          return respondWithFile(PATH.join(SERVER_ROOT, "index.html"), res);
        }
        return next()
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    middleware()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
});
