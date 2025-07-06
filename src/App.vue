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
import YAML from "js-yaml";
import ArticleLayout from '@/components/blog/ArticleLayout.vue';
import { computed, onUpdated, ref } from 'vue';
import ImageViewer from './components/ImageViewer.vue';
import axios from 'axios';
import type { Sidebar } from "./scripts/markdown/Sidebar";

const path_name = window.location.pathname;

// 对于以 pathname 对应于目录的情况，由后端服务器负责重定向到相应目录下的 index.html
// 因此 pathname 始终指向 .html 文件
const url = computed(() => {
  return path_name.replace(/html$/, "json"); // 文件后缀替换为 json
});

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

axios({
  method: "get",
  url: url.value,
})
.then(response => {
  const mt = response.data;
  format.value = mt.format;
  article_list.value = mt.sidebar;
  footer_markdown.value = mt.footer;
  if (!mt) return;
  const regex = /^\s*---([\s\S]*?)---\s*/;
  const match = mt.content.match(regex);
  if (match) {
    let inline_mt = YAML.load(match[1]) as Metadata;
    inline_mt = { ...mt, ...inline_mt };
    format.value = inline_mt.format;
    content_markdown.value = `# ${inline_mt.title}\n${inline_mt.content.slice(match[0].length)}`;
    article_list.value = inline_mt.sidebar;
    footer_markdown.value = inline_mt.footer;
  }
});

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
