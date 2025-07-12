<template>
  <article class="BlogLayout">
    <nav class="SideNav" v-if="props.sidebar">
      <ArticleSidebar :items="props.sidebar" />
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
import { BlogParser, type TableOfContents } from '@/scripts/markdown/Parser';
import ArticleSidebar from './ArticleSidebar.vue';
import ArticleTableOfContents from "./ArticleTableOfContents.vue";
import { computed, ref, watch } from 'vue';
import { type Sidebar } from '@/scripts/markdown/Sidebar';
import Footer from './ArticleFooter.vue';

const props = defineProps<{
  content_markdown: string,
  sidebar?: Sidebar|null,
  footer_markdown?: string|null
}>();

const content_html = ref("");
const toc = ref<TableOfContents>([]);

watch(() => props.content_markdown, (content_markdown) => {
  BlogParser.parse(content_markdown);
  content_html.value = BlogParser.content;
  toc.value = BlogParser.toc;
}, {
  immediate: true
});

watch(() => props.sidebar, (s) => {
  if (s) {

  }
});

const footer_html = computed(() => {
  if (!props.footer_markdown) return "";
  BlogParser.parse(props.footer_markdown);
  return BlogParser.content;
});
</script>

<style lang="scss" scoped>
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
  height: 100vh;
  width: 300px;
  background-color: var(--background-color);
  color: var(--text-color);
  padding-left: 5px;
  padding-right: 10px;
  // border-right: 2px solid whitesmoke;
  box-sizing: border-box;
  overflow: auto;
}

.SideToC {
  position: sticky;
  grid-area: toc;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background-color: var(--background-color);
  color: var(--text-color);
  padding-left: 10px;
  padding-right: 5px;
  // border-left: 2px solid whitesmoke;
  box-sizing: border-box;
  overflow: auto;
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
