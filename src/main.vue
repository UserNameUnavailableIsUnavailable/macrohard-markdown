<script lang="ts">
import { extractRMarkdownMeta } from "./scripts/markdown/parser";
import jsyaml from "js-yaml";
import MarkdownIt from 'markdown-it';
import MarkdownItAttrs from "markdown-it-attrs"
import MarkdownItAnchor from "markdown-it-anchor";
import MarkdownItFootnote from "./scripts/markdown/footnote";
import MarkdownItSection from "./scripts/markdown/section";
import MarkdownItFigure from "./scripts/markdown/figure";
import MarkdownItContainer from "markdown-it-container";
import { validate, render } from "./scripts/markdown/container";
import { initializeMathJax } from "./scripts/math"

export default {
  name: "MainComponent",
  data() {
    return {
      parsed_markdown: "Loading",
      title: "Macrohard"
    };
  },
  methods: {
    async load() { /* 根据元信息中指明的 URL 加载 Markdown 内容 */
      const __MARKDOWN_SOURCE__ = document.querySelector("meta[name='__MARKDOWN_SOURCE__']") as HTMLMetaElement;
      if (__MARKDOWN_SOURCE__) {
        fetch(__MARKDOWN_SOURCE__.content, { method: "GET" })
          .then((response) => { /* 请求成功 */
            response.text()
              .then((text) => {
                const ret = extractRMarkdownMeta(text);
                if (ret.meta) {
                  const meta = jsyaml.load(ret.meta) as { title: string };
                  ret.content = `# ${meta.title}` + ret.content;
                  this.title = meta.title;
                }
                const md = MarkdownIt();
                md.use(MarkdownItAttrs);
                md.use(MarkdownItAnchor);
                md.use(MarkdownItFootnote);
                md.use(MarkdownItSection);
                md.use(MarkdownItFigure);
                md.use(MarkdownItContainer, "container", {
                  validate: validate,
                  render: render
                });
                md.renderer.rules.footnote_ref = (tokens, idx) => {
                  const id = tokens[idx].meta.id;
                  return `<sup class="footnote-ref"><a href="#fn${id + 1}" id="fnref${id + 1}"> ${id + 1} </a></sup>`;
                };
                // md.use(MarkdownItMathJax3);
                this.parsed_markdown = md.render(ret.content);
              })
          }, () => { /* 请求失败 */

          }
          );
      } else {
        this.parsed_markdown = "404"
      }
    },
  },
  async mounted() {
    await this.load();
  },
  watch: {
    parsed_markdown() { /* 当 parsed_markdown 更新时，重新渲染公式 */
      this.$nextTick(() => {
          initializeMathJax().then(() => {
            window.MathJax.typesetPromise().then(() => {
              console.log('MathJax typesetting complete.')
            });
          })
      })
    },
    title() { /* 标题更新 */
      document.title = this.title;
    }
  }

}
</script>

<template>
  <div id="__PARSED_MARKDOWN__">
    <span v-html="parsed_markdown"></span>
  </div>
</template>

<style lang="scss">
$background-color: #222222;
$text-color: #ffffff;
:root {
    --background-color: white;
    --text-color: black;
}

.dark-mode {
    --background-color: $background-color;
    --text-color: $text-color;
}

body {
    background-color: $background-color;
    color: $text-color;
    transition: 0.3s ease-in-out;
}
.columns {
    display: flex;
    gap: 10px;
}

.column {
    flex: 1;
}

</style>
