<!-- 文章目录，显示在右侧 -->
<template>
  <div ref="div">
    <ul v-for="(item, index) in props.items" :key="index">
      <Item :item="item" />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { TableOfContents as TableOfContents } from '@/scripts/markdown/Parser';
import Item from "@/components/blog/ArticleTableOfContentsItem.vue";
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  items: TableOfContents
}>();

const div = ref<HTMLDivElement>();

let last_scroll_top = 0;
// 判断滚动方向
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function get_scroll_direction(): "up" | "down" {
  const current_scroll_top = window.pageYOffset || document.documentElement.scrollTop;
  last_scroll_top = current_scroll_top <= 0 ? 0 : current_scroll_top; // For Mobile or negative scrolling
  if (current_scroll_top < last_scroll_top) {
    return "up";
  } else {
    return "down";
  }
}


// 滚动监听（ScrollSpy），并根据当前所在的章节位置激活目录中相应的锚点元素
function activate_toc_item() {
  // 获取所有标题
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  // 标题元素距离视口顶部可能存在距离相同的情况（使用 columns 进行布局）
  // 需要维护各个标题元素距离视口顶部的距离
  // 并根据距离远近进行筛选
  const candidate_list: { element: Element, distance: number }[] = [];
  let activated_list: { element: Element, distance: number }[];

  for (const heading of headings) {
    const rect = heading.getBoundingClientRect();
    const distance = rect.top; // 元素底部距离视口顶部的距离
      candidate_list.push({
        element: heading,
        distance: distance
    })
  }

  candidate_list.sort((x, y) => Math.abs(x.distance) - Math.abs(y.distance)); // 按照距离绝对值进行排序

  const positive_distance_elements = []; // 距离是正数的元素
  const negative_distance_elements = []; // 距离是负数的元素

  if (candidate_list.length > 0) {
    // 在视口下方的元素，其底部到视口的距离是递增的，故只需要选取前面几个距离相等的元素
    const min_distance = Math.abs(candidate_list[0].distance); // 最小距离
    for (let i = 0; i < candidate_list.length; i++) { // 依次检查前面的元素
      const item = candidate_list[i];
      if (Math.abs(item.distance) === min_distance) { // 距离相等
        if (item.distance >= 0) {
          positive_distance_elements.push(item);
        } else {
          negative_distance_elements.push(item);
        }
      } else { // 一旦不相等，说明后面的距离都更大（递增）
        break;
      }
    }
  }

  if (positive_distance_elements.length > 0) {
    activated_list = positive_distance_elements;
  } else {
    activated_list = negative_distance_elements;
  }

  const id_list = activated_list.map(e => e.element.id); // 取出待激活的锚点指向的元素 id

  const anchors = div.value?.querySelectorAll("a") ?? [] as HTMLAnchorElement[];
  anchors.forEach(anchor => {
    const index = anchor.href.indexOf('#') + 1;
    if (id_list.includes(anchor.href.slice(index))) { // 列表中存在于该锚点对应的 id
      anchor.classList.add('activated');
    } else {
      anchor.classList.remove('activated');
    }
  });
}

onMounted(() => {
  activate_toc_item();
  document.addEventListener("scroll", activate_toc_item);
});

onUnmounted(() => {
  document.removeEventListener("scroll", activate_toc_item);
});


</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
}
</style>
