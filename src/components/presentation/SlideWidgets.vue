<!-- 幻灯片使用的小组件 -->
<template>
  <div class="left-widgets">
    <button class="tool" id="__FONT_SIZE_RESET__" description="reset font size" @mouseover="mouse_over"
      @mouseleave="mouse_leave" @click="reset_font_size">↺</button>
    <button class="tool" id="__FONT_SIZE_UP__" description="increase font size" @mouseover="mouse_over"
      @mouseleave="mouse_leave" @click="increase_font_size">+</button>
    <button class="tool" id="__FONT_SIZE_DOWN__" description="decrease font size" @mouseover="mouse_over"
      @mouseleave="mouse_leave" @click="decrease_font_size">-</button>
    <button class="tool" id="__FULL_SCREEN__" description="toggle full screen (F11)" @mouseover="mouse_over"
      @mouseleave="mouse_leave" @click="toggle_full_screen">🖵</button>
    <!-- 直接将描述文本放入 body 中，位置设为 fixed 并调整 z-index 确保能够显示在所有内容上方 -->
    <Teleport to="body">
      <button v-show="description" class="description" id="ToolDescription" ref="ToolDescription">{{ description }}</button>
    </Teleport>
  </div>
  <div class="bottom-widgets" v-if="toggleMenu">
    <button id="__MENU_BUTTON__" class="tool" @click="toggleMenu($event)">
      <svg xmlns="http://www.w3.org/2000/svg" fill="rgb(42, 118, 221)" class="bi bi-list" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  toggleMenu?: (e?: Event) => void;
}>();

const description = ref("");
const ToolDescription = ref<HTMLButtonElement | null>(null);

const initial_main_font_size = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue("--main-font-size").trim());

console.log(getComputedStyle(document.documentElement).getPropertyValue("--main-font-size"));

function mouse_over(event: MouseEvent) {
  if (!ToolDescription.value) return;
  const target = event.target as HTMLButtonElement;
  description.value = target.getAttribute("description") || "";
  const height = window.getComputedStyle(target).getPropertyValue("height");
  console.log("height", height);
  const h = parseFloat(height);
  if (isNaN(h)) {
    console.warn("Invalid height value:", height);
    return;
  }
  const rect = target.getBoundingClientRect();
  const bottom = `${window.innerHeight - (rect.bottom + rect.top + h) / 2}px`;
  const left = `${rect.right}px`;
  ToolDescription.value!.style.bottom = bottom;
  ToolDescription.value!.style.left = left;
}

function mouse_leave() {
  description.value = "";
}

const increase_font_size = () => {
  const currentSize = parseFloat(
    getComputedStyle(document.documentElement).
      getPropertyValue('--main-font-size')
  );
  document.documentElement.style.setProperty('--main-font-size', `${currentSize + 1}px`);
}

const decrease_font_size = () => {
  const currentSize = parseFloat(
    getComputedStyle(document.documentElement).
      getPropertyValue('--main-font-size')
  );
  document.documentElement.style.setProperty('--main-font-size', `${currentSize - 1}px`);
}

const reset_font_size = () => {
  document.documentElement.style.setProperty('--main-font-size', `${initial_main_font_size}px`);
}

const toggle_full_screen = () => {
  const doc = document as {
    fullscreenElement?: Element | null;
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    exitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };
  if (!( // 非全屏状态
    doc.fullscreenElement ||  // Standard
    doc.webkitFullscreenElement || // Chrome, Safari
    doc.mozFullScreenElement || // Firefox
    doc.msFullscreenElement // IE / Edge
  )) {
    const e = document.documentElement as {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };
    if (e.requestFullscreen) {
      e.requestFullscreen();
    } else if (e.webkitRequestFullscreen) { /* Safari */
      e.webkitRequestFullscreen();
    } else if (e.mozRequestFullScreen) { /* Firefox */
      e.mozRequestFullScreen();
    } else if (e.msRequestFullscreen) { /* Internet Explorer */
      e.msRequestFullscreen();
    }
  } else {
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }
}

</script>

<style scoped>
.left-widgets {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: end;
  left: 5px;
  bottom: 60px;
}

.bottom-widgets {
  position: fixed;
  display: flex;
  flex-direction: row;
  align-items: start;
  left: 5px;
  bottom: 10px;
}

button.tool {
  padding: 0;
  display: block;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: none;
  background-color: transparent;
  color: white;
  margin: 5px;
}

#__FONT_SIZE_RESET__ {
  bottom: 40px;
  background-color: #ad3434;
}

#__FONT_SIZE_RESET__:hover {
  background-color: #8f3333;
}

#__FONT_SIZE_UP__ {
  bottom: 80px;
  background-color: #34ad34;
}

#__FONT_SIZE_UP__:hover {
  background-color: #208a00;
}

#__FONT_SIZE_DOWN__ {
  bottom: 120px;
  background-color: #3446ad;
}

#__FONT_SIZE_DOWN__:hover {
  background-color: #0c3691;
}

#__FULL_SCREEN__ {
  bottom: 160px;
  background-color: #fa0092;
}

#__FULL_SCREEN__:hover {
  background-color: #d243e6;
}

#__MENU_BUTTON__ svg {
  width: 100%;
  height: 100%;
  display: block;
}

button.description {
  position: fixed;
  border: none;
  border-radius: 5px;
  background: #b1c6f1;
  z-index: 20; /* 只是描述文本，在按钮处悬停时弹出，故设置很高的 z-index 不会对主体内容产生影响 */
}
</style>
