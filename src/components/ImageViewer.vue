<template>
  <div style="display: none;">
    <img ref="Image" :src="image_src" :alt="image_alt" />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, useTemplateRef } from 'vue';

declare class Viewer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(e: HTMLElement, opt: any);
  public static noConflict(): void;
  public hide(): void;
  public show(): void;
  public update(): void;
}

const Image = useTemplateRef("Image");
const viewer_busy = ref(false);
const image_src = ref("");
const image_alt = ref("");
const script_src = "https://cdn.bootcdn.net/ajax/libs/viewerjs/1.11.7/viewer.min.js";
const style_src = "https://cdn.bootcdn.net/ajax/libs/viewerjs/1.11.7/viewer.min.css"

onMounted(() => {
  const style = document.createElement("link")
  style.rel = "stylesheet"
  style.href = style_src
  document.head.appendChild(style);
  const script = document.createElement("script");
  script.src = script_src;
  script.async = true;
  script.onload = () => {
    const viewer = new Viewer(Image.value as HTMLImageElement, {
      "url": "src",
      "hidden": () => {
        viewer_busy.value = false; // 隐藏时解除对此 viewer 的锁定
      }
    })
    Viewer.noConflict();
    viewer.hide();
    document.addEventListener("click", (event) => {
      const e = event.target as HTMLImageElement
      if (e.tagName !== "IMG") {
        return;
      }
      if (viewer_busy.value) {
        return; // 当前正在展示其他图片
      }
      viewer_busy.value = true; // 上锁
      try {
        image_src.value = e.src
        image_alt.value = e.alt
        console.log(image_src.value)
        console.log(image_alt.value)
        nextTick(() => {
          viewer.update();
          viewer.show();
        });
      } catch (e) {
        console.log(e);
      }
    })
  }
  document.body.appendChild(script)
})
</script>

<style>
img {
  cursor: zoom-in; /* Makes the cursor look like a magnifying glass */
}
</style>
