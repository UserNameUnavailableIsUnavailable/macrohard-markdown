import YAML from "js-yaml";
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, ViteDevServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import DOMParser, { HTMLElement } from 'node-html-parser';

// vite-plugin-html-fallback.js
import FS from 'fs';
import PATH from 'path';
import { assert } from "node:console";

import { IncomingMessage, ServerResponse } from "node:http";
import mime from 'mime';

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

function generateMetadata(file_path: string) {
  assert(PATH.isAbsolute(file_path));
  assert(file_path.endsWith(".json")); // 必须是对 json 的请求
  const rmd_path = file_path.replace(/json$/, "rmd"); // 用于获取 rmd 文件
  let json: Record<string, string | null> = {
    title: "404 Not Found",
    content: "😱😱😱😱😱"
  };
  if (isFile(rmd_path)) {
    json.title = "Untitled"; // 默认标题
    const content = FS.readFileSync(rmd_path, "utf-8");
    json.content = content;
    const match = content.match(/^\s*---([\s\S]*?)---\s*/);
    if (match) {
      const metadata_str = match[1].trim();
      json.content = content.slice(match[0].length); // 去掉 YAML 元数据
      try {
        const metadata = YAML.load(metadata_str) as Record<string, string | null>;
        json = { ...json, ...metadata }; // 合并元数据
        json.content = `# ${json.title}\n${json.content}`; // 将标题放在内容前面
      } catch {
        // 解析失败，忽略
      }
    }
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
  return json;
}

function respondWithFile(requested_path: string, res: ServerResponse<IncomingMessage>) {
  FS.stat(requested_path, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    const mime_type = mime.getType(requested_path) || "application/octet-stream";
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
        const requested_path = PATH.join(DOCUMENT_ROOT, req.url ?? "");
        if (isDirectory(requested_path)) { // 对目录的请求重定向到对 index.html 的请求
          const redirect_path = PATH.posix.join(req.url, "index.html");
          url.pathname = redirect_path;
          res.writeHead(302, { Location: url.pathname + url.search }); // 重定向，同时保留参数
          return res.end();
        } else if (isFile(requested_path)) { // 请求的文件在 DOCUMENT_ROOT 下存在
          return respondWithFile(requested_path, res);
        } else if (requested_path.endsWith(".html")) { // 请求的是不存在的 HTML 文件，套用模板
          console.log(`Requesting non-existent HTML file: ${requested_path}`);
          // 读取 index.html 模板
          const templatePath = PATH.join(SERVER_ROOT, "index.html");
          if (!isFile(templatePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Template not found');
          }
          const template = FS.readFileSync(templatePath, 'utf-8');
          const doc = DOMParser.parse(template);
          const scriptEl = new HTMLElement("script", {}, "");
          scriptEl.setAttribute("type", "application/json");
          scriptEl.setAttribute("id", "__metadata__");
          doc.querySelector("head")?.appendChild(scriptEl);
          const json = generateMetadata(requested_path.replace(/\.html$/, ".json"));
          const json_string = JSON.stringify(json); // 生成对应的 JSON-LD
          scriptEl.textContent = json_string;
          let title = doc.querySelector("head > title");
          if (!title) {
            title = new HTMLElement("title", {}, "Macrohard");
            doc.querySelector("head")?.appendChild(title);
          }
          title.textContent = `${json.title} | Macrohard`;
          const ret = doc.toString();
          return res.end(ret);
        }
        return next();
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
