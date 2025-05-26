import type MarkdownIt from "markdown-it";
import type { Token } from "markdown-it/index.js";

export default function PreInlineCode(md: MarkdownIt) {
  md.renderer.rules.code_inline = (tokens: Token[], idx: number) => {
    const token = tokens[idx];
    // 针对 Prism.js 内联代码要求，替换 &, <, > 为转义字符
    // https://prismjs.com/#basic-usage
    token.content = token.content
    .replace(/&/g, `&amp;`) // 先替换 & 为 &amp;
    .replace(/</g, `&lt;`) // > 替换为 &lt;
    .replace(/>/g, `&gt;`); // < 替换为 &gt;
    const attr_list: string[] = [];
    // 检查是否已经指明 language- （使用 `int x= 0;`{.language-c} 语法）
    if (!token.attrGet("class")?.includes("language-")) {
      const classes = (token.attrGet("class") ?? "").split(' ');
      classes.push("language-plain");
      token.attrSet("class", classes.join(' '));
    }
    token.attrs?.forEach(e => {
      attr_list.push(`${e[0]}="${e[1]}"`);
    });
    return `<span><code ${attr_list.join(' ')}>${token.content}</code></span>`;
  };
}
