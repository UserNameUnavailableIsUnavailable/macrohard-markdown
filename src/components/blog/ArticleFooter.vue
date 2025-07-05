<!-- 页脚 -->
<template>
  <hr>
  <div v-html="props.html"></div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  html: string
}>();
</script>
