import type MarkdownIt from "markdown-it";
import type { Token, Options, Renderer } from "markdown-it/index.js";


/* 用 <div> 包裹 <blockquote> 元素 */
export default function (md: MarkdownIt) {
  const default_blockquote_open_renderer = md.renderer.rules.blockquote_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.blockquote_open = (token: Token[], index: number, options: Options, env: unknown, self: Renderer) => {
    return `<div>\n${default_blockquote_open_renderer(token, index, options, env, self)}`;
  }
  const default_blockquote_close_renderer = md.renderer.rules.blockquote_close || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  }
  md.renderer.rules.blockquote_close = (token: Token[], index: number, options: Options, env: unknown, self: Renderer) => {
    return `${default_blockquote_close_renderer(token, index, options, env, self)}\n</div>`;
  }
}
