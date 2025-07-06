import type MarkdownIt from "markdown-it";

// 公用同一个 parser，避免重复创建
const parser = new DOMParser();

// 为当前文章生成目录，并将结果以列表形式记录到 env.toc 中
export default function (md: MarkdownIt) {
  md.core.ruler.push('extract_rendered_headings', function (state) {
    const tokens = state.tokens;
    const renderer = md.renderer;
    state.env.toc = state.env.toc || [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'heading_open') {
        const level = Number(token.tag.slice(1));
        const inlineToken = tokens[i + 1];

        // 将 Markdown 渲染为 HTML
        // @ts-expect-error state.options
        const rendered = renderer.render([inlineToken], state.options, state.env);

        // 解析 HTML
        const doc = parser.parseFromString(rendered.trim(), "text/html");

        let href = "";
        // 移除由 markdiwn-it-anchor 插件产生的 header-anchor 锚点，并记录其链接到的标题
        doc.querySelectorAll('a.header-anchor').forEach(e => {
          href = (e as HTMLAnchorElement).href;
          e.remove();
        });
        // doc.querySelectorAll('a').forEach(e => { // 用 span 替换普通的锚点
        //   const span = document.createElement("span");
        //   span.innerHTML = e.innerHTML;
        //   e.replaceWith(span);
        // })
        // 保存标题等级和相应的标题 HTML 代码
        state.env.toc.push({
          level,
          html: doc.body.innerHTML.trim(),
          href: href
        });
      }
    }
  });
}
