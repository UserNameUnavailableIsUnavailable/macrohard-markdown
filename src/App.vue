<template>
  <ImageViewer />
  <ArticleLayout v-if="metadata?.format==='html'" :metadata="metadata" />
  <SlideLayout v-else-if="metadata?.format==='revealjs'" :metadata="metadata" />
</template>

<script lang="ts" setup>
import ArticleLayout from '@/components/blog/ArticleLayout.vue';
import ImageViewer from './components/ImageViewer.vue';
import { onUpdated, ref } from 'vue';
import SlideLayout from './components/presentation/SlideLayout.vue';
import type { Metadata } from './scripts/markdown/Metadata';

const metadata = ref<Metadata>();

const metadata_tag = document.getElementById("__metadata__");
if (metadata_tag) {
  const text_content = metadata_tag.textContent ? metadata_tag.textContent : "{}";
  metadata.value = JSON.parse(text_content) as Metadata;
}

onUpdated(() => {
  document.body.querySelectorAll("[width]").forEach(e => {
    const width = e.getAttribute("width");
    if (width) {
        (e as HTMLElement).style.setProperty("width", width);
    }
  });
  document.body.querySelectorAll("[height]").forEach(e => {
    const height = e.getAttribute("height");
    if (height) {
      (e as HTMLElement).style.setProperty("height", height);
    }
  });
});

</script>

<style lang="scss">
@use "@/styles/CustomContainer.scss";

@font-face {
  font-family: "code";
  src: url("/fonts/CascadiaCode.woff2");
}

:not(pre)>code[class*=language-],
// 内联代码
pre[class*=language-]>code[class*=language-] {
  // 代码块
  color: inherit;
  font-family: "code", sans-serif;
  font-variant-ligatures: common-ligatures discretionary-ligatures historical-ligatures contextual; // 启用所有连字特性
}
</style>
