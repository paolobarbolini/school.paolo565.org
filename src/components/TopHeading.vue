<template>
  <div class="top-heading base-container">
    <h1>
      {{ title }}
    </h1>

    <span v-if="displayLastUpdate">
      aggiornato {{ displayLastUpdate }}
    </span>
  </div>
</template>

<script>
import VueTimers from 'vue-timers/mixin';

import Utils from '@/utils';

export default {
  mixins: [
    VueTimers,
  ],

  props: {
    title: {
      type: String,
      required: true,
    },
    lastUpdate: {
      validator: (prop) => prop instanceof Date || prop === null,
      default: null,
    },
  },

  data() {
    return {
      displayLastUpdate: '',
    };
  },

  watch: {
    lastUpdate(date) {
      this.$nextTick(this.updateLastUpdate);
    },
  },

  timers: {
    updateLastUpdate: {
      time: 1000,
      autostart: true,
      repeat: true,
    },
  },

  methods: {
    updateLastUpdate() {
      const lu = this.lastUpdate ? Utils.timePassed(this.lastUpdate) : '';
      this.displayLastUpdate = lu;
    },
  },
};
</script>

<style lang="scss">
.top-heading {
  color: #888;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 0 0 16px;
  white-space: nowrap;

  h1 {
    font-weight: bold;
    font-size: 100%;
    margin-right: .3rem;
  }

  span {
    font-size: .8rem;

    &:before {
      content: '-';
      margin-right: .3rem;
    }
  }
}
</style>
