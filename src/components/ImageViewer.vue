<template>
  <div style="display: none;">
    <img ref="img" :src="image_src" :alt="image_alt" />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

declare class Viewer {
  constructor(e: HTMLElement, opt: unknown);
  public static noConflict(): void;
  public hide(): void;
  public show(): void;
  public update(): void;
}

const img = useTemplateRef<HTMLImageElement>("img");

let busy = false; // 是否处于忙状态，即正在显示图片
const image_src = ref("");
const image_alt = ref("");

const script_src = "https://cdn.bootcdn.net/ajax/libs/viewerjs/1.11.7/viewer.min.js";
const style_src = "https://cdn.bootcdn.net/ajax/libs/viewerjs/1.11.7/viewer.min.css"

let viewer: Viewer|undefined;

function on_click(event: MouseEvent) {
    const e = event.target as HTMLImageElement
    if (e.tagName !== "IMG") {
      return;
    }
    if (busy) {
      return; // 当前正在展示其他图片
    }
    busy = true; // 上锁
    try {
      image_src.value = e.src;
      image_alt.value = e.alt;
      console.log(image_src.value);
      console.log(image_alt.value);
      nextTick(() => {
        viewer?.update();
        viewer?.show();
      });
    } catch (e) {
      console.log(e);
    }
}

onMounted(() => {
  document.addEventListener("click", on_click);

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = style_src;
  document.head.appendChild(style);
  const script = document.createElement("script");
  script.src = script_src;
  script.async = true;

  script.onload = () => { // 脚本加载后初始化 viewer
    viewer = new Viewer(img.value as HTMLImageElement, {
      "url": "src",
      "hidden": () => {
        busy = false; // 隐藏时解除对此 viewer 的锁定
      }
    })
    Viewer.noConflict();
    viewer.hide();
    console.log("Image viewer is initialized.");
  }
  document.body.appendChild(script);
});

onUnmounted(() => {
  document.removeEventListener("click", on_click);
});
</script>

<style>
img {
  cursor: zoom-in; /* Makes the cursor look like a magnifying glass */
}
</style>
