<!-- 文章列表，显示在左侧 -->
<template>
  <div>
    <div style="text-align: center;">
      <img src="/favicon.ico" style="width: 24px;">
      &nbsp;
      <span style="font-size: 24px;">Macrohard</span>
    </div>
    <ul>
      <Item v-for="(child, index) in props.items?.children" :item="child" :key="index" />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import Item from './ArticleSidebarItem.vue';
import { type Sidebar } from '@/scripts/markdown/Sidebar';

const props = defineProps<{
  items: Sidebar
}>();
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
}
</style>
