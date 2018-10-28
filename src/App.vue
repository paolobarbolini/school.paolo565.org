<template>
  <div class="app-container">
    <top-navigation @search-query="setSearchQuery" />

    <router-view :search-query="searchQuery" />

    <bottom-navigation />
  </div>
</template>

<script>
import TopNavigation from '@/components/TopNavigation';
import BottomNavigation from '@/components/BottomNavigation';

export default {
  components: {
    TopNavigation,
    BottomNavigation,
  },

  data() {
    return {
      searchQuery: '',
    };
  },

  methods: {
    setSearchQuery(query) {
      this.searchQuery = query;
    },
  },
};
</script>
