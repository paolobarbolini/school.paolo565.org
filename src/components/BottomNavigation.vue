<template>
  <div class="bottom-navigation">
    <ul>
      <li>
        <router-link :to="{ name: 'schedules' }">
          <icon name="home" />
          <span>Home</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'posts' }">
          <icon name="book" />
          <span>Avvisi</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'about' }">
          <icon name="paper-plane" />
          <span>Contattami</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import 'vue-awesome/icons/home';
import 'vue-awesome/icons/book';
import 'vue-awesome/icons/paper-plane';

import Icon from 'vue-awesome/components/Icon';

export default {
  components: {
    Icon,
  },

  computed: {
    displayShare() {
      return !!navigator.share;
    },
  },

  methods: {
    doShare() {
      navigator.share({
        title: 'Istituto Gobetti App',
        text: 'Controlla con facilità gli orari e gli avvisi ' +
              'dell\'Istituto Gobetti',
        url: 'https://school.paolo565.org',
      });
    },
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

    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  li {
    list-style-type: none;
    display: inline-block;

    &:not(:last-of-type) {
      margin-right: 16px;
    }

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
      transform: translateX(-50%) scale(1.5);
      margin-bottom: 4px;
    }

    span {
      display: block;
    }
  }
}
</style>
