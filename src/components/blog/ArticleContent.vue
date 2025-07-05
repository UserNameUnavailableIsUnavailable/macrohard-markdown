<!-- 文章内容 -->
<template>
  <div v-html="body"></div>
</template>

<script lang="ts" setup>
import { watch, ref, nextTick } from 'vue';
import MathRenderer from '@/scripts/markdown/MathRenderer';
import CodeHighlighter from '@/scripts/markdown/CodeHighlighter';

const math_renderer = new MathRenderer({
  inline_indicator: [['$', '$'], ["\\(", "\\)"]],
  block_indicator: [["$$", "$$"], ["\\[", "\\]"]]
});
const code_highlighter = new CodeHighlighter();

const props = defineProps<{
  html: string
}>();
const body = ref("");
watch(() => props.html, (html) => {
  body.value = html;
  nextTick(() => {
    math_renderer.render_all();
    code_highlighter.highlight_all();
    code_highlighter.keep_compatibility_with_rmd();
  });
}, { immediate: true });
</script>

<style scoped>
.BlogContent {
  margin-left: 2em;
}
</style>
