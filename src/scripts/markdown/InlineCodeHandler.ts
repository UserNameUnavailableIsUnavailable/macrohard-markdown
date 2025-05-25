import type MarkdownIt from "markdown-it";
import type { Token } from "markdown-it/index.js";

export default function PreInlineCode(md: MarkdownIt) {
  md.renderer.rules.code_inline = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
    const token = tokens[idx];
    const content = token.content;

    return `<code class="language-markup">${content}</code>`;
  };
}
