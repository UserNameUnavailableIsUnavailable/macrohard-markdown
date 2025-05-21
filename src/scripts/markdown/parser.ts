export function extractRMarkdownMeta(text: string): { meta: string, content: string } {
    const regex = /^---\s\n([\s\S]*?)\s\n---/;
    const match = text.match(regex);
    return {
        meta: match ? match[1] : "",
        content: text.replace(regex, '\n')
    };
}
