<template>
  <div class="bottom-navigation">
    <ul>
      <li>
        <router-link :to="{ name: 'schedules' }">
          <icon name="clock" />
          <span>Orari</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'posts' }">
          <icon name="scroll" />
          <span>Avvisi</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'about' }">
          <icon name="paper-plane" />
          <span>Contattami</span>
        </router-link>
      </li>
      <li v-if="supportsWebShare">
        <a @click="displayShareDialog()">
          <icon name="share-alt" />
          <span>Condividi</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import 'vue-awesome/icons/clock';
import 'vue-awesome/icons/scroll';
import 'vue-awesome/icons/paper-plane';
import 'vue-awesome/icons/share-alt';

import Icon from 'vue-awesome/components/Icon';

import Web from '@/web';

export default {
  components: {
    Icon,
  },

  computed: {
    supportsWebShare: Web.supportsWebShare,
  },

  methods: {
    displayShareDialog: Web.displayShareDialog,
  },
};
</script>

<style lang="scss">
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 8px 10px 8px;
  background-color: white;
  box-shadow: 0 0 8px 2px #b5b5b5;
  border-bottom: #757575 solid 1px;

  ul {
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 400px;

    display: flex;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  li {
    list-style-type: none;
    display: inline-block;
    width: 100%;

    a {
      color: #757575;
      text-decoration: none;

      &:hover,
      &.router-link-exact-active {
        color: #3949AB;
      }
    }

    .fa-icon {
      position: relative;
      left: 50%;
      transform: translateX(-50%) scale(1.3);
      margin-bottom: 4px;
    }

    span {
      display: block;
      font-size: small;
      text-align: center;
    }
  }
}
</style>
