import type MarkdownIt from "markdown-it";
import type { Token, Options, Renderer } from "markdown-it/index.js";


export default function markdownFigure(md: MarkdownIt) {
    md.renderer.rules.image = (tokens: Token[], idx: number, options: Options, env: any, self: Renderer) => {
        const token = tokens[idx];
        const src = token.attrs ? token.attrs[token.attrIndex("src")][1] : "";
        const caption = token.content || ""; // caption 存放在 content 字段中
        return `<figure><img src="${src}" alt="${caption}" "title=${caption}"><figcaption>${caption}</figcaption></figure>`;
    };
}
