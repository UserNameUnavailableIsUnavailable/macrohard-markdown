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

const blog_content = ref("")

const __MARKDOWN_SOURCE__ = document.querySelector("meta[name='__MARKDOWN_SOURCE__']") as HTMLMetaElement

const math_renderer = new MathRenderer({
  inline_indicator: [['$', '$']],
  block_indicator: [["$$", "$$"]]
})

const code_highlighter = new CodeHighlighter()

if (__MARKDOWN_SOURCE__) {
  FetchMarkdown({
    markdown_url: __MARKDOWN_SOURCE__.content,
    extra_metadata_urls: []
  }).then((ret) => {
    const parse_result = ParseMarkdown(ret)
    blog_content.value = parse_result
    nextTick(() => {
      math_renderer.render_all()
      code_highlighter.keep_compatibility_with_rmd() // 代码高亮功能与 R Markdown 兼容
      code_highlighter.highlight_all()
    })
  })
}
</script>
<style lang="scss">
@use "@/styles/CustomContainer.scss";
</style>

