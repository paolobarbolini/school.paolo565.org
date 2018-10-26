<template>
  <div class="hours-page">
    <top-section
      :items="[
        { name: 'Avvisi', destination: 'posts' },
        { name: 'Maggiori Informazioni', destination: 'about' }
    ]" />

    <input
      ref="searchQuery"
      v-model="searchQuery"
      class="search-box"
      placeholder="Cerca..."
      type="text">

    <last-update :date="loaded ? items.date : null" />

    <schedule-columns
      v-if="loaded"
      :items="items.items || []"
      :filter="searchQuery" />
    <loading v-else />
  </div>
</template>

<script>
import TopSection from '@/components/TopSection';
import LastUpdate from '@/components/LastUpdate';
import Loading from '@/components/Loading';
import ScheduleColumns from '@/components/ScheduleColumns';

import IstitutoGobetti from '@/istitutogobetti';

export default {
  components: {
    TopSection,
    LastUpdate,
    Loading,
    ScheduleColumns,
  },

  data() {
    return {
      searchQuery: '',
      items: null,
    };
  },

  computed: {
    loaded() {
      return !!this.items;
    },
  },

  watch: {
    items(items) {
      if (items.cached) {
        this.loadSchedules(false);
      }
    },
  },

  mounted() {
    this.$refs.searchQuery.focus();
  },

  created() {
    this.loadSchedules();
  },

  methods: {
    async loadSchedules(cache = true) {
      const home = await IstitutoGobetti.articlePageUrl(cache);
      if (!home.article) {
        throw new Error('Can\'t find the article pointing to orario facile');
      }

      const article = home.article;
      const schedule = await IstitutoGobetti.schedulePageUrl(article, cache);
      if (!schedule.schedule) {
        throw new Error('Can\'t find the article pointing to orario facile');
      }

      const schedules = schedule.schedule;
      this.items = await IstitutoGobetti.schedulePageItems(schedules, cache);
    },
  },
};
</script>

<style lang="scss">
.search-box {
  width: 80vw;
  max-width: 400px;
  transform: translate(-50%, -50%);
  position: relative;
  left: 50%;
  box-sizing: border-box;
  margin-top: 40px;
  border: rgba(234, 158, 19, 0.66) solid 2px;
  box-shadow: 3px 4px 9px 0px rgba(0, 0, 0, .3);
}
</style>
