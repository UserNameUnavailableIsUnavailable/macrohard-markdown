import type MarkdownIt from "markdown-it";
import type { Token, Options, Renderer } from "markdown-it/index.js";

export default function (md: MarkdownIt) {
    md.renderer.rules.image = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
        const token = tokens[idx];
        const src = token.attrs ? token.attrs[token.attrIndex("src")][1] : "";
        const alt = token.content;
        if (!alt.trim()) {
          const attr_list = new Array<string>();
          token.attrs?.forEach(e => {
            attr_list.push(`${e[0]}="${e[1]}"`);
          });
          return `<img ${attr_list.join(' ')} />\n`;
        }
        // 渲染 token 的子元素用 renderInline
        const caption_html = self.renderInline(token.children as Token[], options, env)
        // HTML 格式的字符串不能直接存入 <img> 的 alt 属性，否则标签将会被截断！
        // 这里创建一个新的 HTML 标签，将 HTML 字符串传给 innerHTML。
        // 然后，通过 textContent 获取到转义后的文本，即可安全地存放到 alt 属性中。
        const p = document.createElement('p');
        p.innerHTML = caption_html.replace(/\n/g, ''); // 原始标签内可能包含换行，故先替换之，否则写进 alt 属性的内容也会包含换行
        console.log(p.textContent);
        const attr_list: string[] = [];
        const IGNORE_PROPERTIES = ["alt", "src"]
        token.attrs?.forEach(e => {
          if (!IGNORE_PROPERTIES.includes(e[0])) {
            attr_list.push(`${e[0]}="${e[1]}"`);
          }
        });
        const ret = `<figure ${attr_list.join(' ')}>\n<img src="${src}" alt="${p.textContent}" ${attr_list.join(' ')} />\n<figcaption>${caption_html}</figcaption>\n</figure>`;
        return ret;
    };
}
