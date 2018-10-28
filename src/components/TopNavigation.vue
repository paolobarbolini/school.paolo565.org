<template>
  <div class="top-navigation">
    <router-link :to="{ name: 'schedules' }">
      school.paolo565.org
    </router-link>

    <div
      class="search"
      @click="searchVisible = true">
      <icon name="search" />
    </div>

    <div
      :class="{ 'active': searchVisible }"
      class="search-bar">
      <div @click="searchVisible = false">
        <icon name="arrow-left" />
      </div>

      <input
        ref="searchQuery"
        v-model.trim="searchQuery"
        type="text"
        placeholder="Cerca"
        @keyup.enter="blurSearch()"
        @keyup.esc="searchVisible = false">
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/search';
import 'vue-awesome/icons/arrow-left';

import Icon from 'vue-awesome/components/Icon';

export default {
  components: {
    Icon,
  },

  data() {
    return {
      searchVisible: false,
      searchQuery: '',
    };
  },

  watch: {
    searchQuery(query) {
      this.$emit('search-query', query);
    },
    searchVisible(visible) {
      this.searchQuery = '';

      if (visible) {
        this.$refs.searchQuery.focus();
      }
    },
    $route() {
      this.searchVisible = false;
    },
  },

  methods: {
    blurSearch() {
      this.$refs.searchQuery.blur();
    },
  },
};
</script>

<style lang="scss">
.top-navigation {
  height: 47px;
  padding: 0 16px;
  background-color: #3F51B5;
  box-shadow: 0 0 12px 0 #b5b5b5;
  display: flex;
  align-items: center;
  position: relative;

  .fa-icon {
    cursor: pointer;
  }

  a {
    color: white;
    text-decoration: none;
  }

  .search {
    color: white;
    margin-left: auto;
  }

  .search-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 16px;
    background: #fff;
    display: flex;
    align-items: center;
    opacity: 0;
    will-change: opacity;
    pointer-events: none;
    transition: opacity 0.1s ease-in-out;

    &.active {
      pointer-events: all;
      opacity: 1;
    }

    input {
      outline: 0;
      width: 100%;
      background-color: white;
      line-height: normal;
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      vertical-align: baseline;

      margin-left: 16px;
    }
  }
}
</style>
