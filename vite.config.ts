import YAML from "js-yaml";
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, ViteDevServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// vite-plugin-html-fallback.js
import fs from 'fs';
import path from 'path';
import { assert } from "node:console";

function isFile(path: string) {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

function isDirectory(path: string) {
  try {
    const stat = fs.statSync(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

function generateJSON(file_path: string) {
  assert(!path.isAbsolute(file_path));
  assert(file_path.endsWith(".json")); // 必须是对 json 的请求
  file_path = file_path.replace(/json$/, "rmd"); // 用于获取 rmd 文件
  const root = process.cwd();
  // if (!isFile(file_path)) {
  //   root = path.join(root, "public");
  // }
  file_path = path.normalize(path.join(root, file_path));
  let json: { content: string, sidebar?: string, footer?: string } = {
    content: "---\ntitle: 404 Not Found\n---"
  };
  if (isFile(file_path)) {
    const content = fs.readFileSync(file_path, "utf-8");
    json.content = content;
  }
  let dir = path.dirname(file_path);
  while (dir !== root) {
    const metadata_file_path = path.join(dir, "metadata.yml");
    if (isFile(metadata_file_path)) {
      const raw = fs.readFileSync(metadata_file_path, "utf-8");
      const obj = YAML.load(raw) as object;
      json = { ...obj, ...json }; // 目录越具体，元数据优先级越高
    }
    dir = path.normalize(path.join(dir, "..")); // 上一级目录
  }
  // dir === root
  // 读取根目录的 metadata
  assert(dir === root);
  const metadata_file_path = path.join(dir, "metadata.yml");
  if (isFile(metadata_file_path)) {
    const raw = fs.readFileSync(metadata_file_path, "utf-8");
    const obj = YAML.load(raw) as object;
    json = { ...obj, ...json }; // 目录越具体，元数据优先级越高
  }

  if (json.footer === undefined && isFile("public/footer.rmd")) {
    const footer = fs.readFileSync("public/footer.rmd", "utf-8");
    json.footer = footer;
  }
  const ret = JSON.stringify(json);
  return ret;
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
        const rel_path = path.join("public", url.pathname.slice(1)); // 文件相对路径
        if (isDirectory(rel_path)) {
            url.pathname = path.posix.join(url.pathname, "index.html");
            res.writeHead(302, { Location: url.pathname + url.search }); // 重定向，同时保留参数
            return res.end();
        } else if (isFile(rel_path)) {
          return next();
        }
        // 文件不存在
        // 请求的文件类型为 HTML，此时可以返回模板
        if (path.extname(rel_path) === ".html") {
          const index_file_path = path.resolve(process.cwd(), 'index.html');
          let html = fs.readFileSync(index_file_path, 'utf-8');
          html = await server.transformIndexHtml(req.url, html);
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
        } else if (path.extname(rel_path) === ".json") {
          const json = generateJSON(rel_path);
          res.setHeader("Content-Type", "text/json");
          return res.end(json);
        } else {
          return next();
        }
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
