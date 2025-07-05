import MarkdownIt from 'markdown-it';
import MarkdownAttrs from "markdown-it-attrs"
import MarkdownAnchor from "markdown-it-anchor";
import MarkdownFootnote from "@/scripts/markdown/Footnote";
import MarkdownSectionize from "@/scripts/markdown/Sectionize";
import MarkdownAccomodateFigure from "@/scripts/markdown/AccomodateFigure";
import MarkdownContainer from "markdown-it-container";
import * as CustomContainer from '@/scripts/markdown/CustomContainer';
import MarkdownInlineCodeHandler from "./InlineCodeHandler";
import MarkdownBlockQuoteHandler from "./BlockQuoteHandler";
import MathHandler from '@/scripts/markdown/MathHandler';
import ToCGenerator from "@/scripts/markdown/ToCGenerator";
// @ts-expect-error external
import MarkdownSub from "markdown-it-sub";
// @ts-expect-error external
import MarkdownSup from "markdown-it-sup";
// @ts-expect-error external
import MarkdownUnderline from "markdown-it-underline";
// @ts-expect-error external
import MarkdownBracketedSpans from "markdown-it-bracketed-spans";
import SmartTable from "./SmartTable";
import type { SidebarItem } from "./Sidebar";

export class ParseResult {
  main_content: string = "";
  sidebar_content: SidebarItem[] = [];
  footer_content: string = "";
};

export type TableOfContentsItem = {
  level: number,
  html: string,
  href: string
  children: TableOfContentsItem[]
};

export type TableOfContents = TableOfContentsItem[];

export class Parser {
  private parser_: MarkdownIt;
  private content_: string = "";
  private toc_: TableOfContents = [];

  public constructor(type: "blog" | "presentation") {
    this.parser_ = new MarkdownIt();
    // 保护数学公式
    const math_renderer = new MathHandler({
      allow_white_space_padding: true,
      inline_delimiters: [['$', '$'], ['\\(', '\\)']],
      block_delimiters: [["$$", "$$"], ['\\[', '\\]']],
      inline_surrounding: ["<span class='math inline'>\n", "</span>\n"],
      block_surrounding: ["<div class='math block'>\n", "</div>\n"]
    });

    this.parser_
      .use(MarkdownBracketedSpans) // [Foo]{ #Foo } -> Foo
      .use(MarkdownAttrs) // 自定义属性，如 { #Foo .Bar width="200" }
      .use(MarkdownSub) // 下标
      .use(MarkdownSup) // 上标
      .use(MarkdownUnderline) // 下划线
      .use(MarkdownInlineCodeHandler) // 内联代码块
      .use(MarkdownBlockQuoteHandler) // 引用块
      .use(MarkdownFootnote) // 生成脚注
      .use(MarkdownAnchor, { permalink: true, permalinkBefore: false, permalinkSymbol: '§' }) // 锚点
      .use(ToCGenerator)
      .use(MarkdownSectionize) // 将标题及其内容纳入 <section> 中
      .use(MarkdownAccomodateFigure) // 图片增强功能
      .use(math_renderer.get_markdown_it_plugin())
      .use(
        MarkdownContainer,
        "CustomContainer",
        {
          validate: CustomContainer.validate,
          render: CustomContainer.render
        }
      ); // 使用 ::: {} ::: 自定义容器
    this.parser_.block.ruler.at("table", SmartTable);
  }

  public parse(blob: string) {
    const env = {
      toc: new Array<{level: number, html: string, href: string}>()
    };
    this.content_ = this.parser_.render(blob, env);

    const runtime_stack = new Array<TableOfContentsItem>();
    const toc = new Array<TableOfContentsItem>();

    for (let i = 0; i < env.toc.length; i++) {
      const node = {
        level: env.toc[i].level,
        html: env.toc[i].html,
        href: env.toc[i].href,
        children: new Array<TableOfContentsItem>()
      };
      let parent: TableOfContentsItem | undefined;
      // 回溯，找到级别更高的标题
      while (runtime_stack.length > 0) {
        const top = runtime_stack[runtime_stack.length - 1]; // 取栈顶元素
        if (node.level <= top.level) { // 栈顶元素级别相同或更低
          runtime_stack.length--; // 弹出栈顶节点元素
        } else { // 栈顶节点元素级别更高，选作父节点
          parent = top;
          break;
        }
      }
      if (parent) { // 找到父节点，作为父节点的孩子
        parent.children.push(node);
      } else { // 未找到父节点，直接添加到 toc
        toc.push(node);
      }
      runtime_stack.push(node); // 当前节点作为最近处理过的节点，入栈
    }
    this.toc_ = toc;
  }

  // 获取渲染后的 HTML
  public get content() { return this.content_ }
  // 获取文章目录
  public get toc() {
    return this.toc_;
  }
}

export const BlogParser = new Parser("blog");
