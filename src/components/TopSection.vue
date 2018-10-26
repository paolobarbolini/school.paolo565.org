<template>
  <div class="top-section bold">
    <p class="center">
      App realizzata da
      <a href="https://www.paolo565.org">Paolo Barbolini</a>
    </p>
    <p class="center">
      Classe
      <router-link
        :to="{ name: 'schedule', params: { type: 'classi', name: '3H' } }">
        3H
      </router-link>
    </p>

    <ul class="center">
      <li
        v-for="item of items"
        :key="item.name">
        <router-link
          :to="{ name: item.destination }">
          {{ item.name }}
        </router-link>
      </li>
      <li
        v-if="displayShare"
        @click="doShare()">
        Condividi
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => {
        return [];
      },
    },
    share: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },

  computed: {
    displayShare() {
      return this.share && navigator.share;
    },
  },

  methods: {
    doShare() {
      navigator.share({
        title: 'Istituto Gobetti App',
        text: 'Controlla con facilità gli orari e ricevi gli ultimi avvisi',
        url: 'https://school.paolo565.org',
      });
    },
  },
};
</script>

<style lang="scss">
.top-section {
  background-color: #303030;
  color: #cccbcb;
  display: inline-block;
  width: 100%;

  a {
    color: #fffefe;
    text-decoration: none;
  }

  p {
    margin: 8px 0 0;

    &:first-of-type {
      margin-top: 16px;
    }
  }

  ul {
    padding: 0;
    margin: 0 0 16px 0;
  }

  li {
    list-style-type: none;
    display: inline-block;
    margin: 6px;

    &:not(:last-of-type):after {
      content: '|';
      margin-left: 6px;
    }
  }
}
</style>
