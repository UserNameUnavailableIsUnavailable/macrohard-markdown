<template>
  <ImageViewer />
  <ArticleLayout
    v-if="format === 'blog'"
    :content_markdown="content_markdown"
    :sidebar="article_list"
    :footer_markdown="footer_markdown"
  />
</template>
<script lang="ts" setup>
import ArticleLayout from '@/components/blog/ArticleLayout.vue';
import ImageViewer from './components/ImageViewer.vue';
import type { Sidebar } from "./scripts/markdown/Sidebar";
import { onUpdated, ref } from 'vue';

type Metadata = {
  format: "blog" | "presentation" | undefined, // 格式类型
  title: string, // 标题
  content: string, // 主题内容
  sidebar?: Sidebar, // 边栏导航
  footer?: string // 页脚
};

const format = ref<string|undefined>("");
const content_markdown = ref("");
const article_list = ref<Sidebar>();
const footer_markdown = ref<string|undefined>("");

const metadata_tag = document.getElementById("__metadata__");
if (metadata_tag) {
  const text_content = metadata_tag.textContent ? metadata_tag.textContent : "{}";
  const metadata = JSON.parse(text_content) as Metadata;
  format.value = metadata.format;
  content_markdown.value = metadata.content;
  article_list.value = metadata.sidebar;
  footer_markdown.value = metadata.footer;
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
@use "@/styles/main.scss";
@use "@/styles/CustomContainer.scss";

.Layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
}

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
