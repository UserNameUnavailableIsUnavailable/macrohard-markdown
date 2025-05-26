import Metadata from "@/scripts/markdown/Metadata"
import YAML from "js-yaml"
import MarkdownIt from 'markdown-it';
import MarkdownAttrs from "markdown-it-attrs"
import MarkdownAnchor from "markdown-it-anchor";
import MarkdownFootnote from "@/scripts/markdown/Footnote";
import MarkdownSectionize from "@/scripts/markdown/Sectionize";
import MarkdownAccomodateFigure from "@/scripts/markdown/AccomodateFigure";
import MarkdownContainer from "markdown-it-container";
import * as CustomContainer from '@/scripts/markdown/CustomContainer';
import MarkdownInlineCodeHandler from "./InlineCodeHandler";
import MathHandler from '@/scripts/markdown/MathHandler';
// @ts-expect-error external
import MarkdownSub from "markdown-it-sub";
// @ts-expect-error external
import MarkdownSup from "markdown-it-sup";
// @ts-expect-error external
import MarkdownUnderline from "markdown-it-underline";
// @ts-expect-error external
import MarkdownBracketedSpans from "markdown-it-bracketed-spans";
import SmartTable from "./SmartTable";

export default function(init: {markdown_blob: string, extra_metadata: string[]}) {
  let markdown_blob: string = ""
  let content: string = ""
  // 初始化
    if (init.markdown_blob) {
      markdown_blob = init.markdown_blob
    }
    const metadata = new Metadata()
    init.extra_metadata?.forEach(e => {
      const mt = YAML.load(e) as Partial<Metadata>
      metadata.merge(mt)
    })
    const regex = /^\s*---([\s\S]*?)---\s*/;
    const match = markdown_blob.match(regex);
    if (match) { // 文档的元数据优先级最高，最后解析
      metadata.merge(new Metadata(match[1]))
      markdown_blob = markdown_blob.slice(match[0].length)
      markdown_blob = `# ${metadata.title}\n\n` +  markdown_blob.trim() // 文章开头添加标题
    }
    // 保护数学公式
    const math_renderer = new MathHandler({
      allow_white_space_padding: true,
      inline_delimiters: [['$', '$'], ['\\(', '\\)']],
      block_delimiters: [["$$", "$$"], ['\\[', '\\]']],
      inline_surrounding: ["<span class='math inline'>\n", "</span>\n"],
      block_surrounding: ["<div class='math block'>\n", "</div>\n"]
    })
    // 解析
    const mit = new MarkdownIt()
     // 加载插件
     mit
    .use(MarkdownBracketedSpans) // [Foo]{ #Foo } -> Foo
    .use(MarkdownAttrs) // 自定义属性，如 { #Foo .Bar width="200" }
    .use(MarkdownSub) // 下标
    .use(MarkdownSup) // 上标
    .use(MarkdownUnderline) // 下划线
    .use(MarkdownInlineCodeHandler)
    .use(MarkdownFootnote) // 生成脚注
    .use(MarkdownAnchor, { permalink: true, permalinkBefore: false, permalinkSymbol: "📌" }) // 锚点
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
    ) // 使用 ::: {} ::: 自定义容器
    mit.block.ruler.at("table", SmartTable)
    content = mit.render(markdown_blob)
    console.log(content)
    return content
}
