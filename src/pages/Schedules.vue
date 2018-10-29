<template>
  <div class="hours-page">
    <top-heading
      :last-update="loaded ? items.date : null"
      title="Orari" />

    <div class="container clear-container">
      <schedule-columns
        v-if="loaded"
        :items="items.items || []"
        :filter="searchQuery" />
      <loading v-else />
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';
import Loading from '@/components/Loading';
import ScheduleColumns from '@/components/ScheduleColumns';

import IstitutoGobetti from '@/istitutogobetti';

export default {
  components: {
    TopHeading,
    Loading,
    ScheduleColumns,
  },

  props: {
    searchQuery: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
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
        requestIdleCallback(() => {
          this.loadSchedules(false);
        });
      }
    },
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
