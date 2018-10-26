<template>
  <li
    v-show="visible"
    class="schedule-item">
    <router-link
      :to="{ name: 'schedule', params: { type: type, name: item.name }}"
      v-html="name" />
  </li>
</template>

<script>
import Utils from '@/utils';

export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    filter: {
      type: String,
      default: '',
    },
    item: {
      type: Object,
      required: true,
    },
  },

  computed: {
    visible() {
      return this.item.name.toLowerCase().includes(this.filter.toLowerCase());
    },

    name() {
      if (!this.visible) return this.item.name;

      const name = Utils.escapeHtml(this.item.name);
      if (!this.filter) return name;
      const filter = Utils.escapeHtml(this.filter);

      const escapedQuery = Utils.escapeRegExp(filter);
      const regex = new RegExp(escapedQuery, 'ig');

      const i = name.toLowerCase().indexOf(filter.toLowerCase());
      const queryReplacement = name.substring(i, i + filter.length);
      const highlightedName = name.replace(regex, `<b>${queryReplacement}</b>`);

      return highlightedName;
    },
  },
};
</script>

<style lang="scss">
.schedule-item {
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
