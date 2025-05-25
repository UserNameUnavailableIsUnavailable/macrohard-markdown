<template>
  <div v-if="content" ref="CONTENT" v-html="content"></div>
  <ImageViewer />
</template>

<script lang="ts" setup>
import { nextTick, ref } from "vue"
import FetchMarkdown from "@/scripts/markdown/Fetch"
import ParseMarkdown from "@/scripts/markdown/Parse"
import MathRenderer from "@/scripts/markdown/MathRenderer"
import CodeHighlighter from "@/scripts/markdown/CodeHighlighter"
import ImageViewer from "./components/ImageViewer.vue"

const content = ref("")

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
    // console.log(ret.markdown_blob)
    content.value = parse_result
    nextTick(() => {
      math_renderer.render_all()
      code_highlighter.keep_compatibility_with_rmd()
      code_highlighter.highlight_all()
    })
  })
}
</script>
<style lang="scss">
@import "./styles/main.scss";
</style>
