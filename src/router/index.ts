import BlogContent from '@/components/blog/ArticleContent.vue';
import { createMemoryHistory, createRouter } from 'vue-router'

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/:path(.*)",
      name: "blog",
      component: BlogContent,
      props: router => router.params.path
    }
  ],
});
