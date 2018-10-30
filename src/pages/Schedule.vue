<template>
  <div class="schedule-page">
    <top-heading
      :last-update="loaded ? item.date : null"
      :title="name" />

    <div class="last-container">
      <div
        v-if="loaded"
        class="schedule"
        v-html="schedule" />
      <loading v-else />
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';
import Loading from '@/components/Loading';
import ScheduleColumns from '@/components/ScheduleColumns';

import IstitutoGobetti from '@/istitutogobetti';
import DB from '@/db';

export default {
  components: {
    TopHeading,
    Loading,
    ScheduleColumns,
  },

  props: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      item: null,
      schedule: '',
    };
  },

  computed: {
    loaded() {
      return !!this.item;
    },
  },

  watch: {
    name: {
      handler: 'load',
      immediate: true,
    },
    item(item, oldItem) {
      this.schedule = IstitutoGobetti.buildEmbeddedSchedule(item.html);
      if (item.cached) {
        requestIdleCallback(() => {
          this.loadSchedule(false);
        });
      }
    },
  },

  methods: {
    async load() {
      DB.addToFrequentyUsed(this.type, this.name);
      await this.loadSchedule();
    },
    async loadSchedule(cache = true) {
      const items = await IstitutoGobetti.schedulePageItems('');
      for (const item of items.items) {
        if (item.type !== this.type || item.name !== this.name) {
          continue;
        }

        const url = item.url;
        const name = this.name;
        const type = this.type;
        this.item = await IstitutoGobetti.scheduleItem(url, name, type, cache);
        break;
      }
    },
  },
};
</script>

<style lang="scss">
.schedule {
  overflow-y: auto;
  width: calc(100vw - 40px);
  max-width: 1500px;
  margin: 10px auto;

  @media (max-width: 1200px) {
    width: 100vw;
    margin-bottom: 0;
  }

  table {
    width: 100%;
  }

  td:first-of-type {
    position: sticky;
    left: 0;
    background-color: #e9e9e9;
    width: 30px;
  }

  // Table fixes
  table {
    * {
      font-weight: bold;
      text-decoration: none;
      text-transform: uppercase;
      text-align: center;
      font-family: 'Designosaur';
      font-size: 9pt;

      .nodecBlack {
        color: #000000;
      }

      .nodecWhite {
        color: #FFFFFF;
      }

      td {
        padding: 10px;
        white-space: nowrap;
      }

      table,
      tr,
      td {
        border: 1px solid black;
        border-collapse: collapse;
      }

      .mathema p,
      #mathema {
        display: none;
      }

      .nodecBlack,
      .nodecWhite {
        max-height: 20px;
      }

      #nodecBlack,
      #nodecWhite {
        height: 10px;
      }

      p {
        margin: 0;
        padding: 0;
        margin-top: 5px;
      }
    }
  }
}
</style>
