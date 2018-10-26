<template>
  <div class="articles-page">
    <top-section
      :items="[ { name: 'Torna Indietro', destination: 'schedules' } ]" />

    <last-update :date="loaded ? items.date : null" />

    <article-columns
      v-if="loaded"
      :items="items.posts || []" />
    <loading v-else />
  </div>
</template>

<script>
import TopSection from '@/components/TopSection';
import LastUpdate from '@/components/LastUpdate';
import Loading from '@/components/Loading';
import ArticleColumns from '@/components/ArticleColumns';

import IstitutoGobetti from '@/istitutogobetti';

export default {
  components: {
    TopSection,
    LastUpdate,
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
