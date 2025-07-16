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
  return RevealJSParser.content;
});

function isOverflowing(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight;
}

// 对于章节嵌套的情况，调整级灯片的滚动范围
function update_nested_scroll_range() {
  const current = Reveal.getCurrentSlide() as HTMLElement;
  const parent = current.parentElement;
  if (!parent || parent.tagName !== 'SECTION' || !parent.classList.contains('present')) return;
  console.log(parent.scrollHeight, parent.clientHeight);
  parent.style.overflowY = isOverflowing(parent) ? 'scroll' : 'hidden';
  parent.scrollTop = 0;
}

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

.reveal:not(.overview)> // 非概览模式（ESC）下
.slides section:not(.present) * { // 选取非当前可见的幻灯片内的所有元素
  height: 0 !important; // 隐藏非当前幻灯片的内容（将章节中所有元素高度置为 0，这样不会影响切换特效）
}

.reveal>.slides section {
  max-height: 100%;
  height: auto;
  overflow: auto; // 允许滚动
}

.reveal>.slides section section {
  overflow: visible; // 对于嵌套的幻灯片，其内容保持可见，此时父级幻灯片可以滚动查看其内容
}
</style>
