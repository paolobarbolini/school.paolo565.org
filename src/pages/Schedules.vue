<template>
  <div class="hours-page">
    <top-heading
      :last-update="loaded ? items.date : null"
      :offline="offline"
      title="Orari"
    />

    <div class="container clear-container">
      <ul class="highlighted-schedules">
        <column-item
          v-for="item in highlightedSchedules"
          :key="item.name"
          :name="item.name"
          :filter="searchQuery"
          :to="{ name: 'schedule',
                 params: { type: item.type, name: item.name }}"
        />
      </ul>

      <schedule-columns
        v-if="loaded"
        :items="items.items || []"
        :filter="searchQuery"
      />
      <loading
        v-else
        :offline="offline"
      />
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';
import Loading from '@/components/Loading';
import ScheduleColumns from '@/components/ScheduleColumns';
import ColumnItem from '@/components/ColumnItem';

import IstitutoGobetti from '@/istitutogobetti';
import DB from '@/db';

export default {
  components: {
    TopHeading,
    Loading,
    ScheduleColumns,
    ColumnItem,
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
      items: null,
    };
  },

  computed: {
    loaded() {
      return !!this.items;
    },
    highlightedSchedules() {
      return DB.getMostFrequentlyUsed().slice(0, 3);
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

  async created() {
    try {
      await this.loadSchedules();
    } catch (e) {
      this.offline = true;
    }
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
.highlighted-schedules {
  list-style: none;
  margin: 0 0 10px 0;
  padding: 0;
  display: flex;

  .column-item {
    display: inline-block;
    width: 100%;
    margin: 0 10px;
  }
}
</style>
