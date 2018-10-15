<template>
  <div>
    <div class="loading-bars">
      <div class="loading-bar" />
      <div class="loading-bar" />
      <div class="loading-bar" />
      <div class="loading-bar" />
    </div>

    <p class="loading-status">
      {{ loadingStatus }}
    </p>
  </div>
</template>

<script>
import VueTimers from 'vue-timers/mixin';

export default {
  mixins: [
    VueTimers,
  ],

  data() {
    return {
      loadingStatus: '',
      messages: [
        'Caricamento in corso...',
        'Ci siamo quasi...',
        'Ora ci sta davvero mettendo tanto tempo...',
        'Stiamo ancora aspettando...',
        'C\'è nessuno?',
        'Hai davvero molta pazienza!',
        'Stai davvero leggendo questo messaggio?',
        'Forse qualcosa è andato storto?',
      ],
    };
  },

  timers: {
    updateMessage: {
      time: 2500,
      autostart: true,
      repeat: true,
      immediate: true,
    },
  },

  methods: {
    updateMessage() {
      const message = this.messages.shift();
      if (!message) return;
      this.loadingStatus = message;
    },
  },
};
</script>

<style lang="scss">
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
