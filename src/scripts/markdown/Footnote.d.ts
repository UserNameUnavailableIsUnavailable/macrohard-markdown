import type { PluginSimple } from "markdown-it";

declare module "./Footnote.js" {
    const Footnote: PluginSimple;
    export default Footnote
}
