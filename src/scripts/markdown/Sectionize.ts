import type MarkdownIt from "markdown-it"
import type { Token } from "markdown-it/index.js"
import StateCore from "markdown-it/lib/rules_core/state_core.mjs"

// 根据文章标题级别构建章节
function build_section(section_tokens: Token[], state: StateCore, index: number, max_allowed_level: number, heading_tag: string, nesting: number): number {
  const tokens = state.tokens;
  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === "footnote_block_open") {
      if (nesting !== 0) {
        throw new Error("Nesting level mismatch.");
      }
      break;
    }

    if (nesting + token.nesting < 0) {
      if (nesting !== 0) {
        throw new Error("Nesting level mismatch.");
      }
      return index; // 如果 nesting 变为负数，说明遇到外部标签，已经离开 section 作用域
    } else {
      if (token.type === "heading_open") { // 遇到标题开始
        if (token.tag > heading_tag) { // 子章节
          if (parseInt(token.tag.slice(1), 10) <= max_allowed_level) { // 检查标题级别是否超过最大允许级别
            const section_open = new state.Token("section_open", "section", 1);
            section_open.attrSet("level", token.tag.slice(1));
            section_tokens.push(section_open);

            section_tokens.push(token); // 添加标题开始
            index++;
            index = build_section(section_tokens, state, index, max_allowed_level, token.tag, 1); // 递归处理子章节

            const section_close = new state.Token("section_close", "section", -1);
            section_tokens.push(section_close);
          } else { // 超过最大允许级别的标题，不加入 section
            section_tokens.push(token); // 添加标题开始
            index++;
            index = build_section(section_tokens, state, index, max_allowed_level, token.tag, 1); // 递归处理子章节
          }
        } else { // 同级别或更高级别的章节
          if (nesting !== 0) {
            throw new Error("Nesting level mismatch.");
          }
          return index;
        }
      } else {
        nesting += token.nesting; // 更新 nesting
        section_tokens.push(token); // 添加 token
        index++;
      }
    }
  } // end while
  if (nesting !== 0) {
    throw new Error("Nesting level mismatch.");
  }
  return index;
}

export type SectionizeOptions = {
  max_allowed_level?: number // 最大允许的标题级别，默认为 6
}

export default function Sectionize(md: MarkdownIt, options: SectionizeOptions) {
  md.core.ruler.push("sectionize", (state) => {
    const section_tokens: Token[] = [];
    const max_allowed_level = options.max_allowed_level ?? 6; // 默认最大标题级别为 6
    let index = 0;
    index = build_section(section_tokens, state, index, max_allowed_level, "h0", 0);
    if (index < state.tokens.length) {
      section_tokens.push(...state.tokens.slice(index)); // 添加剩余的 tokens
    }
    state.tokens = section_tokens;
  });
}
