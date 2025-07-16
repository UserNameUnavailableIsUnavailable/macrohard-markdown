<template>
  <article class="BlogLayout">
    <nav class="SideNav" v-if="metadata.sidebar">
      <ArticleSidebar :items="metadata.sidebar" />
    </nav>
    <nav v-if="toc.length > 0" class="SideToC">
      <ArticleTableOfContents :items="toc" />
    </nav>
    <div class="Content">
      <Content :html="content_html" />
    </div>
    <footer v-if="footer_html" class="Footer">
      <Footer :html="footer_html" />
    </footer>
  </article>
</template>

<script lang="ts" setup>
import Content from './ArticleContent.vue';
import { HTMLParser, type TableOfContents } from '@/scripts/markdown/Parser';
import ArticleSidebar from './ArticleList.vue';
import ArticleTableOfContents from "./ArticleTableOfContents.vue";
import { computed, ref, watch } from 'vue';
import Footer from './ArticleFooter.vue';
import type { Metadata } from '@/scripts/markdown/Metadata';

const props = defineProps<{
  metadata: Metadata
}>();

const content = computed(() => {
  return `# ${props.metadata.title}\n${props.metadata.content}`;
});
const content_html = ref("");
const toc = ref<TableOfContents>([]);

watch(content, (content) => {
  HTMLParser.parse(content);
  content_html.value = HTMLParser.content;
  toc.value = HTMLParser.toc;
}, {
  immediate: true
});

const footer_html = computed(() => {
  if (!props.metadata.footer) return null;
  HTMLParser.parse(props.metadata.footer);
  return HTMLParser.content;
});
</script>

<style lang="scss">
@use "@/styles/blog.scss";
.BlogLayout {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "nav content toc"
    "nav footer toc";
  min-height: 100vh;
  gap: 1px;
}

.BlogLayout.NoSidebar {
  grid-template-areas:
    "content toc"
    "footer toc";
}

.SideNav {
  position: sticky;
  grid-area: nav;
  top: 0;
  left: 0;
  height: 75vh;
  width: 300px;
  background-color: var(--background-color);
  color: var(--text-color);
  padding-left: 5px;
  padding-right: 10px;
  box-sizing: border-box;
  overflow: auto;
}

.SideToC {
  position: sticky;
  grid-area: toc;
  top: 0;
  right: 0;
  height: 75vh;
  width: 300px;
  background-color: var(--background-color);
  color: var(--text-color);
  padding-left: 10px;
  padding-right: 5px;
  box-sizing: border-box;
  overflow: auto;
  margin-left: 5px;
}

.Content {
  margin-left: 5px;
  grid-area: content;
  overflow: auto;
}

.Footer {
  grid-area: footer;
}
</style>
