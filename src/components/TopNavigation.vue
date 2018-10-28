<template>
  <div class="top-navigation">
    <router-link :to="{ name: 'schedules' }">
      <icon
        class="logo"
        name="logo" />
    </router-link>

    <div class="search">
      <input
        type="text"
        placeholder="Cerca">

      <icon name="search" />
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/search';

import Icon from 'vue-awesome/components/Icon';

Icon.register({
  logo: {
    width: 512,
    height: 512,
    /* eslint-disable */
    raw: `
      <circle cx="256" cy="256" r="256" fill="#ffdc00"/>
      <g fill="#ffc000">
        <path d="M211.2 290l-106 90.3 131 131A254.8 254.8 0 0 0 393.3 472L211.2 289.9zM511.3 274.6l-187-187.1-135.1 154.2 124.9 124.5-11 11.6 92.6 92.7a255.8 255.8 0 0 0 115.6-195.9z"/>
      </g>
      <circle cx="256" cy="164" r="102.5" fill="#347fea"/>
      <path fill="#1b56db" d="M256 61.5v205a102.5 102.5 0 0 0 0-205z"/>
      <path fill="#fff" d="M225.3 205.3l-14.1-14.1 35.3-35.3V87.5h20v76.6z"/>
      <path fill="#e0e0e0" d="M266.5 87.5H256v87.2l10.5-10.6z"/>
      <circle cx="156" cy="332.5" r="69.7" fill="#1f66cc"/>
      <path fill="#154797" d="M156 262.8h-.6v139.4h.6a69.7 69.7 0 1 0 0-139.4z"/>
      <path fill="#fff" d="M177.4 364.6l-29.1-31.7V286h16v40.7l24.9 27.1z"/>
      <path fill="#e0e0e0" d="M189.2 353.8l-24.9-27.1V286h-8.9v54.6l22 24z"/>
      <circle cx="356" cy="332.5" r="69.7" fill="#1f66cc"/>
      <path fill="#154797" d="M356 262.8h-.6v139.4h.6a69.7 69.7 0 1 0 0-139.4z"/>
      <path fill="#fff" d="M348.6 367.4l-.3-42.3 43.3-24 7.8 14-35 19.4.2 32.8z"/>
      <path fill="#e0e0e0" d="M364.4 334.5l35-19.4-7.8-14-36.2 20.1v46.2l9.2-.1z"/>
    `,
    /* eslint-enable */
  },
});

export default {
  components: {
    Icon,
  },
};
</script>

<style lang="scss">
.top-navigation {
  height: 40px;
  padding: 16px;
  background-color: #3F51B5;
  box-shadow: 0 0 12px 4px #b5b5b5;

  .logo {
    transform: scale(2.5);
    margin-left: 16px;
    margin-top: 10px;
  }

  .search {
    color: white;
    float: right;
    transform: scale(1.5);
    margin-right: 16px;
    margin-top: 12px;
  }
}
</style>
