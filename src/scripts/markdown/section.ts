import type { Options } from "markdown-it"
import type MarkdownIt from "markdown-it"
import type { Renderer, Token } from "markdown-it/index.js"

export default function section_wrapper(md: MarkdownIt) {
    md.renderer.rules.heading_open = heading_open
    md.renderer.rules.paragraph_close = paragraph_close
}

const headings: Array<number> = []

function heading_open(tokens: Token[], index: number, options: Options, env: unknown, self: Renderer) {
    const token = tokens[index]
    if (
        token.tag === "h1" ||
        token.tag === "h2" ||
        token.tag === "h3" ||
        token.tag === "h4" ||
        token.tag === "h5" ||
        token.tag === "h6"
    ) {
        const heading_level = token.tag.charCodeAt(1) - '0'.charCodeAt(0)
        let end_sections = ""
        for (let i = headings.length - 1; i > 0; i--) {
            if (headings[i] <= heading_level) {
                headings.pop()
                end_sections += "</section>\n"
            }
        }
        headings.push(heading_level)
        return `${end_sections}<section>\n${self.renderToken(tokens, index, options)}`
    }
    return self.renderToken(tokens, index, options)
}

function paragraph_close(tokens: Token[], index: number, options: Options, env: unknown, self: Renderer) {
    const next = tokens[index + 1]
    if (headings.length > 0 && (!next || next.type.includes("footnote"))) {
        const end_sections_count = headings.length
        headings.length = 0
        return `${self.renderToken(tokens, index, options)}\n${"</section>\n".repeat(end_sections_count)}`;
    }
    return self.renderToken(tokens, index, options)
}
