<template>
  <div class="articles-page">
    <top-heading
      :last-update="loaded ? items.date : null"
      title="Avvisi" />

    <div class="container clear-container">
      <article-columns
        v-if="loaded"
        :items="items.posts || []"
        :filter="searchQuery" />
      <loading
        v-else
        :offline="offline" />
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';
import Loading from '@/components/Loading';
import ArticleColumns from '@/components/ArticleColumns';
import Offline from '@/components/Offline';

import IstitutoGobetti from '@/istitutogobetti';

export default {
  components: {
    TopHeading,
    Loading,
    ArticleColumns,
    Offline,
  },

  props: {
    searchQuery: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      offline: false,
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

  async created() {
    try {
      await this.loadPosts();
    } catch (e) {
      this.offline = true;
    }
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

<style lang="scss">
.articles-page {
  .top-heading {
    max-width: 512px;
  }
}
</style>
