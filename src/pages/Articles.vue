<template>
  <div class="articles-page">
    <top-heading
      :last-update="loaded ? items.date : null"
      title="Avvisi" />

    <div class="container">
      <article-columns
        v-if="loaded"
        :items="items.posts || []" />
      <loading v-else />
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';
import Loading from '@/components/Loading';
import ArticleColumns from '@/components/ArticleColumns';

import IstitutoGobetti from '@/istitutogobetti';

export default {
  components: {
    TopHeading,
    Loading,
    ArticleColumns,
  },

  data() {
    return {
      page: 1,
      items: {
        posts: [],
      },
    };
  },

  computed: {
    loaded() {
      return this.items.posts.length > 0;
    },
  },

  watch: {
    items(items) {
      if (items.cached) {
        requestIdleCallback(() => {
          this.loadPosts(false);
        });
      }
    },
  },

  created() {
    this.loadPosts();
  },

  methods: {
    async loadPosts(cache = true) {
      const home = await IstitutoGobetti.listArticles(cache);
      if (!home.posts) {
        throw new Error('Can\'t find the article pointing to orario facile');
      }

      this.items = home;
    },
  },
};
</script>
