import type MarkdownIt from "markdown-it"
import type { Token } from "markdown-it/index.js"
import StateCore from "markdown-it/lib/rules_core/state_core.mjs"


  const allowed_open_type = [ "paragraph_open", "table_open", "thead_open", "tbody_open", "th_open", "tr_open", "td_open", "blockquote_open", "bullet_list_open", "list_item_close", "ordered_list_open" ]

  const allowed_close_type = [ "paragraph_close", "table_close", "thead_close", "tbody_close", "th_close", "tr_close", "td_close", "heading_close", "blockquote_close", "bullet_list_close", "list_item_close", "ordered_list_close" ]

  function build_section(section_tokens: Token[], state: StateCore, index: number, heading_tag: string): number {
    const tokens = state.tokens;
    while (index < tokens.length) {
      const tok = tokens[index];
      if (tok.nesting === 0) {
        section_tokens.push(tok);
        index++;
      } else if (tok.nesting === 1 && allowed_open_type.includes(tok.type)) {
        section_tokens.push(tok);
        index++;
      } else if (tok.nesting === -1 && allowed_close_type.includes(tok.type)) {
        section_tokens.push(tok);
        index++;
      } else if (tok.type === "heading_open") {
        if (tok.tag < heading_tag) { // 子章节
          const sub_section_open = new state.Token("section_open", "section", 1);
          sub_section_open.attrSet("level", tok.tag.slice(1));
          section_tokens.push(sub_section_open); // 章节开始
          section_tokens.push(tok); // 标题开始
          index = build_section(section_tokens, state, index + 1, tok.tag); // 从该 tag 开始构建新章节
          const sub_section_close = new state.Token("section_close", "section", -1);
          section_tokens.push(sub_section_close); // 章节结束
        } else { // 同级别或更高级别的章节
          break;
        }
      } else { // 不属于章节的内容
        break;
      }
    }
    return index;
  }

  export default function Sectionize(md: MarkdownIt) {
    md.core.ruler.push("sectionize", (state) => {
      const tokens = state.tokens;
      let index = 0;
      const section_tokens: Token[] = [];
      while (index < tokens.length) {
        const tok = tokens[index];
        if (tok.type === "heading_open") {
          const section_open = new state.Token("section_open", "section", 1);
          section_open.attrSet("level", tok.tag.slice(1));
          section_tokens.push(section_open); // section_open
          section_tokens.push(tok); // heading_open
          index = build_section(section_tokens, state, index + 1, tok.tag);
          const section_close = new state.Token("section_close", "section", -1); // section_close
          section_tokens.push(section_close);
        } else {
          section_tokens.push(tok);
          index++;
        }
      }
      state.tokens = section_tokens;
    });
  }
