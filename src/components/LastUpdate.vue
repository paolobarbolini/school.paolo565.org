<template>
  <p
    :class="{ invisible: !lastUpdate }"
    class="last-update">
    Ultimo Aggiornamento
    <b>
      {{ lastUpdate }}
    </b>
  </p>
</template>

<script>
import VueTimers from 'vue-timers/mixin';

import Utils from '@/utils';

export default {
  mixins: [
    VueTimers,
  ],

  props: {
    date: {
      validator: (prop) => prop instanceof Date || prop === null,
      required: true,
    },
  },

  data() {
    return {
      lastUpdate: '',
    };
  },

  watch: {
    date(date) {
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
      this.lastUpdate = this.date ? Utils.timePassed(this.date) : '';
    },
  },
};
</script>

<style lang="scss">
.last-update {
  text-align: center;
}

// Stop Edge from hurting itself
@supports(width: max-content) {
  .last-update {
    width: max-content;
    margin: 16px auto;
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.3);
    padding: 8px;
  }
}

.loading-bars {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -20px;
  width: 40px;
}

.loading-bar {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 4px;
  animation: loading 1s ease-in-out infinite;

  &:nth-child(1) {
    background-color: #3498db;
    animation-delay: 0;
  }

  &:nth-child(2) {
    background-color: #c0392b;
    animation-delay: .09s;
  }

  &:nth-child(3) {
    background-color: #f1c40f;
    animation-delay: .18s;
  }

  &:nth-child(4) {
    background-color: #27ae60;
    animation-delay: .27s;
  }
}

@keyframes loading {
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1, 2.2);
  }
  40% {
    transform: scale(1);
  }
}

.loading-status {
  top: 58%;
  position: absolute;
  text-align: center;
  left: 0;
  right: 0;
}
</style>
