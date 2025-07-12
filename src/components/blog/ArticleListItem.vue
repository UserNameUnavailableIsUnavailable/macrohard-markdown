<template>
  <li>
    <div class="sidebar-item">
      <!-- 折叠/展开 -->
      <!-- 子元素初始化时若被激活会释放 expanded 事件，其父元素收到后展开 -->
      <!-- 点击 chevron 切换折叠/展开状态 -->
      <a v-if="item.children && item.children.length > 0" @click="expanded = !expanded" class="chevron"
        :class="{ expanded: expanded }"></a>
      &nbsp;
      <!-- 当前文章链接 -->
      <a :href="item.href" :class="{ activated: activated }">
        <span v-html="title">
        </span>
      </a>
    </div>
  </li>
  <!-- 嵌套的子项 -->
  <!-- 子项是否展开由折叠状态 expanded 决定 -->
  <ul v-if="item.children && item.children.length > 0" v-show="expanded" style="padding-left: 1em;">
    <Item v-for="(child, index) in item.children" :item="child" :key="index" @update:need-expand="on_need_expand" />
  </ul>
</template>

<script lang="ts" setup>
import { computed, defineProps, onMounted, ref } from 'vue';
import { type SidebarItem } from '@/scripts/markdown/Sidebar';
import Item from "@/components/blog/ArticleListItem.vue";
import { BlogParser } from '@/scripts/markdown/Parse';

const props = defineProps<{ item: SidebarItem }>();

const expanded = ref(props.item.expanded ?? false); // 是否展开子项
const activated = ref(false); // 是否被激活

const emit = defineEmits<{
  (e: "update:need-expand"): void
}>();

function on_need_expand() {
  expanded.value = true; // 将自己设为展开
  emit("update:need-expand"); // 通知上级展开
}

onMounted(() => {
  activated.value = props.item.href === window.location.pathname; // 如果锚点指向的路径与地址栏的路径相等，则设置为激活
  if (activated.value) {
    emit("update:need-expand"); // 激活后，告知上级展开
  }
});

// 侧边栏显示的博文标题名称
const title = computed(() => {
  // 解析得到的 HTML 会被包含在 <p></p> 内，需要移除外层 <p> 标签
  const title = props.item.title;
  BlogParser.parse(title);
  const parsed_title = BlogParser.content.trim();
  const match = parsed_title.match(/^\<p\>(.*)\<\/p\>$/);
  return match ? match[1] : props.item.title;
});
</script>

<style lang="scss" scoped>
.sidebar-item {
  display: flex;
}

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

.chevron {
  user-select: none;
  position: static;
  cursor: pointer;
  transition: transform 0.5s;
  transform: rotate(0deg);
}

.chevron::before {
  display: inline-block;
  transition: transform 0.5s;
  border-style: solid;
  border-width: 0.15em 0.15em 0 0;
  content: '';
  height: 0.3em;
  width: 0.3em;
  left: -0.25em;
  top: 0.50em;
  position: relative;
  transform: rotate(45deg);
  vertical-align: top;
}

.chevron.expanded::before {
  transform: rotate(135deg);
}
</style>
