<template>
  <li
    v-show="visible"
    class="column-item">
    <router-link
      :to="to"
      v-html="displayName" />
  </li>
</template>

<script>
import Utils from '@/utils';

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    filter: {
      type: String,
      default: '',
    },
    to: {
      type: Object,
      required: true,
    },
  },

  computed: {
    visible() {
      return this.name.toLowerCase().includes(this.filter.toLowerCase());
    },
    displayName() {
      const name = Utils.escapeHtml(this.name);
      if (!this.filter || !this.visible) return name;

      const filter = Utils.escapeHtml(this.filter);

      const escapedQuery = Utils.escapeRegExp(filter);
      const regex = new RegExp(escapedQuery, 'ig');

      const i = name.toLowerCase().indexOf(filter.toLowerCase());
      const queryReplacement = name.substring(i, i + filter.length);
      return name.replace(regex, `<b>${queryReplacement}</b>`);
    },
  },
};
</script>

<style lang="scss">
.column-item {
  padding: 10px 15px;
  margin: 0;
  margin-bottom: 5px;
  text-align: center;

  background-color: rgba(113, 181, 0, .75);
  box-shadow: 3px 4px 9px 0px rgba(0, 0, 0, .2);
  transition: background-color .3s;
  border-radius: 16px;

  &:hover {
    background-color: rgba(113, 181, 0, .5);
  }

  a {
    color: #303030;
    text-decoration: none;
    display: block;
    height: 100%;
    width: 100%;
  }
}
</style>
