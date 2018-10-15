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

  created() {
    this.loadPosts();
  },

  methods: {
    async loadPosts(page = 1) {
      const home = await IstitutoGobetti.articlePageUrl(false, page);
      if (!home.posts) {
        throw new Error('Can\'t find the article pointing to orario facile');
      }

      if (page === 1) {
        this.items.date = home.date;
      }
      this.items.posts = this.items.posts.concat(home.posts);
    },
  },
};
</script>
