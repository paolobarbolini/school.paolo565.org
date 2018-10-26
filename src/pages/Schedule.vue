<template>
  <div class="schedule-page">
    <top-section
      :items="[ { name: 'Torna Indietro', destination: 'schedules' } ]" />

    <h2 class="center">
      {{ name }}
    </h2>

    <last-update :date="loaded ? item.date : null" />

    <div
      v-if="loaded"
      class="schedule"
      v-html="schedule" />
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
    name(name) {
      this.item = null;
      this.loadSchedule();
    },

    item(item) {
      this.schedule = IstitutoGobetti.buildEmbeddedSchedule(item.html);
      if (item.cached) {
        requestIdleCallback(() => {
          this.loadSchedule(false);
        });
      }
    },
  },

  created() {
    this.loadSchedule();
  },

  methods: {
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
.schedule-page {
  padding: 0;

  .schedule {
    overflow-y: auto;
    width: calc(100vw - 40px);
    max-width: 1500px;
    margin: 10px auto;

    table {
      width: 100%;
    }

    * {
      font-weight: bold;
      text-decoration: none;
      text-transform: uppercase;
      text-align: center;
      font-family: "Designosaur";
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

@media screen and (max-width: 1000px) {
  .schedule-page {
    .schedule {
      width: 100vw;
      margin-bottom: 0;
    }
  }
}
</style>
