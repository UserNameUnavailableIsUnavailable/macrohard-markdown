import type { StateBlock, StateInline, Token } from "markdown-it/index.js";
import type MarkdownIt from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

const BACKSLASH = '\\'.charCodeAt(0);

export default class MathProtector {
  private allow_whitespace_padding_: boolean;
  private inline_delimiters_: [string, string][];
  private block_delimiters_: [string, string][];
  private math_inline_rule_: RuleInline;
  private math_block_rule_: RuleBlock;
  private math_inline_renderer_: RenderRule;
  private math_block_renderer_: RenderRule;
  private inline_surrounding_: [string, string];
  private block_surrounding_: [string, string];
  constructor(
    options: {
      allow_white_space_padding: boolean,
      inline_delimiters: [string, string][],
      block_delimiters: [string, string][],
      inline_surrounding: [string, string],
      block_surrounding: [string, string]
    }
  ) {
    this.allow_whitespace_padding_ = options.allow_white_space_padding;
    this.inline_delimiters_ = options.inline_delimiters;
    this.block_delimiters_ = options.block_delimiters;
    this.inline_surrounding_ = options.inline_surrounding;
    this.block_surrounding_ = options.block_surrounding;
    this.math_inline_rule_ = MathProtector.create_inline_math_rule({
      delimiters: options.inline_delimiters,
      allowWhiteSpacePadding: options.allow_white_space_padding
    });
    this.math_block_rule_ = MathProtector.create_block_math_rule(options.block_delimiters);
    this.math_inline_renderer_ = (tokens: Token[], index: number) => {
      const token = tokens[index];
      return `${this.inline_surrounding_[0]}${this.inline_delimiters_[0][0]}${token.content}${this.inline_delimiters_[0][1]}${this.inline_surrounding_[1]}`;
    };
    this.math_block_renderer_ = (tokens: Token[], index: number) => {
      const token = tokens[index];
      return `${this.block_surrounding_[0]}${this.block_delimiters_[0][0]}${token.content}${this.block_delimiters_[0][1]}${this.block_surrounding_[1]}`;
    };
  }
  // 目前仅支持 $...$ 和 $$...$$ 限定的公式
  private static create_inline_math_rule(options: {
    delimiters: Array<[string, string]>, // 公式限定符
    allowWhiteSpacePadding: boolean // 是否允许在公式开头和末尾添加空白字符
  }) {

    return (state: StateInline, silent: boolean) => {
      const start = state.pos;
      // 公式开始标记
      const markers = options.delimiters.filter(([open]) => {
        const indicator = state.src.slice(start, start + open.length);
        if (open === indicator) { // 开始标记匹配
          // 回溯，检查前方是否存在转义字符
          if (start > 0 && state.src.charCodeAt(start - 1) === BACKSLASH) { // 前面一个字符是 \
            if (start > 1 && state.src.charCodeAt(start - 2) === BACKSLASH) { // 前面两个字符是 \\
              return true; // \\ 对当前公式无影响
            }
          } else {
            return true;
          }
          return false;
        }
      });
      if (markers.length === 0) { return false; }
      // 找到标记
      for (const [open, close] of markers) {
        const pos = start + open.length;
        if (
          state.md.utils.isWhiteSpace(state.src.charCodeAt(pos)) &&
          !options.allowWhiteSpacePadding
        ) {
          continue;
        }

        const formulaEnd = state.src.indexOf(close, pos); // 结束符第一次出现的位置

        if (formulaEnd === -1 || // 该行未出现结束符（公式不允许断行）
          pos === formulaEnd) { // 公式长度为 0
            continue;
        }

        if ( // 公式结束符前是空白字符
          state.md.utils.isWhiteSpace(state.src.charCodeAt(formulaEnd - 1)) &&
          !options.allowWhiteSpacePadding
        ) {
          continue;
        }

        let content = state.src.slice(pos, formulaEnd).replace(/\n/g, '');

        if (options.allowWhiteSpacePadding) {
          content = content.replace(/^\s*(.+)\s*$/, "$1"); // 裁剪首尾的空白
        }

        if (!silent) {
          const token = state.push("math_inline", "math", 0);
          token.markup = open;
          token.content = content;
        }

        state.pos = formulaEnd + close.length; // 行内公式末尾

        return true;
      }

      return false;
    };
  }
  private static create_block_math_rule(delimiters: [string, string][]) {
    return function math_block(state: StateBlock, startLine: number, endLine: number, silent: boolean) {
      const start = state.bMarks[startLine] + state.tShift[startLine];

      for (const [open, close] of delimiters) {
        let pos = start;
        let max = state.eMarks[startLine];

        if (pos + open.length > max) {
          continue;
        }

        const openDelim = state.src.slice(pos, pos + open.length);

        if (openDelim !== open) {
          continue;
        }

        pos += open.length;
        let firstLine = state.src.slice(pos, max);

        // Since start is found, we can report success here in validation mode
        if (silent) {
          return true;
        }

        let haveEndMarker = false;

        if (firstLine.trim().slice(-close.length) === close) {
          // Single line expression
          firstLine = firstLine.trim().slice(0, -close.length);
          haveEndMarker = true;
        }

        // search end of block
        let nextLine = startLine;
        /** @type {string | undefined} */
        let lastLine;

        for (;;) {
          if (haveEndMarker) {
            break;
          }

          nextLine += 1;

          if (nextLine >= endLine) {
            // unclosed block should be autoclosed by end of document.
            // also block seems to be autoclosed by end of parent
            break;
          }

          pos = state.bMarks[nextLine] + state.tShift[nextLine];
          max = state.eMarks[nextLine];

          if (state.src.slice(pos, max).trim().slice(-close.length) !== close) {
            continue;
          }

          if (state.tShift[nextLine] - state.blkIndent >= 4) {
            // closing block math should be indented less then 4 spaces
            continue;
          }

          const lastLinePos = state.src.slice(0, max).lastIndexOf(close);
          lastLine = state.src.slice(pos, lastLinePos);

          pos += lastLine.length + close.length;

          // make sure tail has spaces only
          pos = state.skipSpaces(pos);

          if (pos < max) {
            continue;
          }

          // found!
          haveEndMarker = true;
        }

        // If math block has heading spaces, they should be removed from its inner block
        const len = state.tShift[startLine];

        state.line = nextLine + (haveEndMarker ? 1 : 0);

        const token = state.push("math_block", "math", 0);
        token.block = true;

        const firstLineContent = firstLine && firstLine.trim() ? firstLine : "";
        const contentLines = state.getLines(startLine + 1, nextLine, len, false);
        const lastLineContent = lastLine && lastLine.trim() ? lastLine : "";

        token.content = `${firstLineContent}${firstLineContent && (contentLines || lastLineContent) ? "\n" : ""}${contentLines}${contentLines && lastLineContent ? "\n" : ""}${lastLineContent}`;
        token.map = [startLine, state.line];
        token.markup = open;

        return true;
      }
      return false;
    };

  }
  public get_markdown_it_plugin() {
    return (md: MarkdownIt) => {
      md.inline.ruler.before("escape", "math_inline", this.math_inline_rule_);
      md.block.ruler.after("blockquote", "math_block", this.math_block_rule_, {
        alt: ["paragraph", "reference", "blockquote", "list"],
      });
      md.renderer.rules.math_inline = this.math_inline_renderer_;
      md.renderer.rules.math_block = this.math_block_renderer_;
    };
  }
}
