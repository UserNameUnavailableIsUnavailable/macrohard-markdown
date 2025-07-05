<!-- 文章目录项，每个项对应于一个锚点元素 -->
<template>
  <li>
    <a :href="item.href">
      <span v-html="item.html"></span>
    </a>
  </li>
  <ul v-for="(item, index) in props.item.children" :key="index" style="padding-left: 1em;">
    <Item :item="item" />
  </ul>
</template>

<script lang="ts" setup>
import type { TableOfContentsItem } from '@/scripts/markdown/Parse';
import Item from "@/components/blog/ArticleTableOfContentsItem.vue";

const props = defineProps<{
  item: TableOfContentsItem
}>();

</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 8px;
  position: relative;
}

a {
  display: inline-block;
  text-decoration: none;
  color: var(--text-color);
}

a:hover {
  color: #777777;
}

a.activated {
  background: #77777777;
  border-radius: 4px;
  padding: 2px 6px;
  transition: background 0.2s;
}
</style>
