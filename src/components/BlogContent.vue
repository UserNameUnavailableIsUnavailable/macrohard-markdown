<template>
  <div v-if="blog_content" ref="CONTENT" v-html="blog_content"></div>
</template>

<script lang="ts">
export default {
  name: "BlogContent"
}
</script>

<script lang="ts" setup>
import { nextTick, ref } from "vue"
import FetchMarkdown from "@/scripts/markdown/Fetch"
import ParseMarkdown from "@/scripts/markdown/Parse"
import MathRenderer from "@/scripts/markdown/MathRenderer"
import CodeHighlighter from "@/scripts/markdown/CodeHighlighter"

const blog_content = ref("");

let markdown_path = "";
const path_name = window.location.pathname;
if (path_name.endsWith(".html")) {
  markdown_path = path_name.replace(".html", ".json"); // 文件后缀替换为 json
} else { // 没有文件名（访问的是索引文件）
  if (path_name.endsWith("\/")) { // https://example.com/foo/bar/
    markdown_path = path_name + "index.json";
  } else { // https://example.com/foo
    markdown_path += path_name + "/index.json";
  }
}

const json_url = window.location.origin + markdown_path;

const math_renderer = new MathRenderer({
  inline_indicator: [['$', '$'], ["\\(", "\\)"]],
  block_indicator: [["$$", "$$"], ["\\[", "\\]"]]
})

const code_highlighter = new CodeHighlighter()

fetch(json_url).then((response) => {
  response.json().then((
    meta: {
      markdown_url: string,
      extra_metadata_urls: string[]
    }) => {
      FetchMarkdown(meta).then((ret) => {
        const parse_result = ParseMarkdown(ret);
        blog_content.value = parse_result;
        nextTick(() => {
          math_renderer.render_all()
          code_highlighter.keep_compatibility_with_rmd() // 代码高亮功能与 R Markdown 兼容
          code_highlighter.highlight_all()
        })
      })
  })
})

</script>
<style lang="scss">
@use "@/styles/CustomContainer.scss";

@font-face {
  font-family: "code";
  src: url("/fonts/CascadiaCode.woff2");
}

:not(pre) > code[class*=language-], // 内联代码
pre[class*=language-] > code[class*=language-] { // 代码块
  color: inherit;
  font-family: "code", sans-serif;
  font-variant-ligatures: common-ligatures discretionary-ligatures historical-ligatures contextual; // 启用所有连字特性
}
</style>

