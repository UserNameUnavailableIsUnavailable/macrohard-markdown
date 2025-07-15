<!-- 幻灯片标题页 -->
<template>
  <section id="title-slide">
    <h1 v-html="title_html"></h1>
    <div class="columns" v-if="author_html">
      <div class="column" v-for="author in author_html" :key="author" v-html="author"></div>
    </div>
    <div class="columns" v-if="institute_html">
      <div class="column" v-for="institute in institute_html" :key="institute" v-html="institute"></div>
    </div>
    <div class="additional-info">
      <hr/>
      <p v-if="metadata['work-source']">{{ metadata['work-source'] }}</p>
      <p v-if="metadata['citations']">{{ metadata['citations'] }}</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { Metadata } from '@/scripts/markdown/Metadata';
import { RevealJSParser } from '@/scripts/markdown/Parser';
import { computed } from 'vue';

  const props = defineProps<{
    metadata: Metadata
  }>();

  const title_html = computed(() => {
    RevealJSParser.parse(props.metadata.title);
    return RevealJSParser.content;
  });

  const author_html = computed(() => {
    if (!props.metadata.author) return null;
    if (typeof props.metadata.author === 'string') {
      RevealJSParser.parse(props.metadata.author);
      return [RevealJSParser.content];
    }
    return props.metadata.author.map(author => {
      RevealJSParser.parse(author);
      return RevealJSParser.content;
    });
  });

  const institute_html = computed(() => {
    if (!props.metadata.institute) return null;
    if (typeof props.metadata.institute === 'string') {
      RevealJSParser.parse(props.metadata.institute);
      return [RevealJSParser.content];
    }
    return props.metadata.institute.map(institute => {
      RevealJSParser.parse(institute);
      return RevealJSParser.content;
    });
  });

</script>

<style>
#title-slide {
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}
.additional-info {
  width: 80%;
  position: fixed;
  text-align: left;
  padding-left: 5%;
  padding-right: 5%;
  bottom: 2%;
}

.additional-info hr:only-child {
  display: none;
}

.additional-info hr {
  border: none;
  margin: 24px 0;
  width: 80%;
  opacity: 1;
  border-top: 2px solid #3a74af;
}
</style>
