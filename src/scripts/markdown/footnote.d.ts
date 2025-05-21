import type { PluginSimple } from "markdown-it";

declare module "./footnote.js" {
    const MarkdownItFootnote: PluginSimple;
    export default MarkdownItFootnote
}
