<!-- 幻灯片整体布局 -->
<template>
  <img v-if="metadata.logo" class="slide-logo" :src="metadata.logo" />
  <div class="reveal">
    <div class="slides">
      <TitlePage :metadata="metadata" />
      <RawHTML :html="content_html" />
    </div>
  </div>
  <SlideWidgets :toggle-menu="toggle_menu" />
</template>

<script lang="ts" setup>
import TitlePage from './SlideTitlePage.vue';
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import type { Metadata } from "@/scripts/markdown/Metadata";
import 'reveal.js/dist/reveal.css';
// @ts-expect-error this plugin provides no type info
import Reveal from 'reveal.js/dist/reveal.js';
import { RevealJSParser } from '@/scripts/markdown/Parser';
import MathRenderer from '@/scripts/markdown/MathRenderer';
import CodeHighlighter from '@/scripts/markdown/CodeHighlighter';
import RawHTML from '../RawHTML.vue';
import SlideWidgets from './SlideWidgets.vue';
import LoadScript from '@/scripts/LoadScript';

declare global {
  interface Window {
    RevealMenu: unknown;
  }
}

const props = defineProps<{
  metadata: Metadata
}>();

const math_renderer = new MathRenderer({
  inline_indicator: [['$', '$'], ["\\(", "\\)"]],
  block_indicator: [["$$", "$$"], ["\\[", "\\]"]]
});
const code_highlighter = new CodeHighlighter({
  theme: "themes/prism.min.css"
});

const content_html = computed(() => {
  RevealJSParser.parse(props.metadata.content);
  console.log(RevealJSParser.content);
  return RevealJSParser.content;
});

// 对于章节嵌套的情况，调整级灯片的滚动范围
// function update_nested_scroll_range() {
//   const current = Reveal.getCurrentSlide() as HTMLElement;
//   const parent = current.parentElement;

//   if (!parent || parent.tagName !== 'SECTION' || !parent.classList.contains('present')) return;

//   const children = Array.from(parent.children);
//   const relevant = children.filter(el => {
//     return el.classList.contains('present');
//   });

//   const total_height = relevant
//     .map(el => el.scrollHeight)
//     .reduce((sum, h) => sum + h, 0);

//   parent.style.maxHeight = `${window.innerHeight}px`;
//   parent.style.height = `${total_height}px`;
//   console.log("Total height:", total_height);
//   console.log("Window height:", window.innerHeight);
//   console.log("Scroll height:", parent.scrollHeight);
//   parent.style.overflowY = total_height > window.innerHeight ? 'auto' : 'hidden';
//   parent.scrollTop = 0;
// }

function on_fullscreen_change() {
  Reveal.layout();
}

const toggle_menu = ref();

onMounted(() => {
  nextTick(async () => {
    try {
      await LoadScript("node_modules/reveal.js-menu/menu.js").then(() => {
        console.log("RevealMenu loaded");
      });
      code_highlighter.keep_compatibility_with_rmd();
      await code_highlighter.highlight_all();
      await math_renderer.render_all();
      Reveal.initialize({
        // @ts-expect-error this plugin provides no type info
        plugins: [RevealMenu],
        controls: true,
        progress: true,
        history: true,
        center: false,
        slideNumber: true,
        width: "100%",
        height: "100%",
        margin: 0.1,
        menu: {
          side: "left",
          width: "normal",
          markers: true,
          transitions: true,
          openButton: false,
          titleSelector: "h1, h2, h3, h4, h5, h6",
        }
      });
      console.log(Reveal.getPlugin("menu"));
      toggle_menu.value = Reveal.getPlugin("menu").toggle; // RevealJS v4+ 的获取插件方式
      document.addEventListener('fullscreenchange', on_fullscreen_change);
    } catch (error) {
      console.error(error);
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', on_fullscreen_change);
});
</script>

<style lang="scss">
@use "@/styles/presentation.scss";

.reveal {
  width: 100vw;
  height: 100vh;
}

.reveal>.slides {
  width: 100%;
  height: 100%;
}

.reveal>.slides section {
  text-align: left;
}

.slide-logo {
  position: fixed;
  top: 5px;
  right: 5px;
  z-index: 0;
}

// 处理幻灯片的滚动行为
.reveal .slides section > section.past,
.reveal .slides section > section.future {
  height: 0 !important; // 将不可见的幻灯片高度强行置为 0，以免影响真实 scrollHeight 的计算，此方法好处是不影响切换时的动画效果
}

.reveal>.slides section {
  overflow: auto; // 允许滚动
  max-height: 100%;
}

.reveal>.slides section section {
  overflow: visible; // 对于嵌套的幻灯片，其内容保持可见，此时父级幻灯片可以滚动查看其内容
}
</style>
