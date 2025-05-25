import type MarkdownIt from "markdown-it";
import type { Token, Options, Renderer } from "markdown-it/index.js";


export default function TidyFigure(md: MarkdownIt) {
    md.renderer.rules.image = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
        const token = tokens[idx];
        const src = token.attrs ? token.attrs[token.attrIndex("src")][1] : "";
        // 渲染 token 的子元素用 renderInline
        const caption_html = self.renderInline(token.children as Token[], options, env)
        // HTML 格式的字符串不能直接存入 <img> 的 alt 属性，否则标签将会被截断！
        // 这里创建一个新的 HTML 标签，将 HTML 字符串传给 innerHTML。
        // 然后，通过 textContent 获取到转义后的文本，即可安全地存放到 alt 属性中。
        const p = document.createElement('p')
        p.innerHTML = caption_html;
        const ret = `<figure>\n<img src="${src}" alt="${p.textContent}" />\n<figcaption>${caption_html}</figcaption>\n</figure>`;
        return ret;
    };
}
