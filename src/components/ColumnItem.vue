<template>
  <li
    v-show="visible"
    class="column-item"
  >
    <router-link
      :to="to"
      v-html="displayName"
    />
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

      const regex = new RegExp(`(${escapedQuery})`, 'ig');
      return name.replace(regex, '<b>$1</b>');
    },
  },
};
</script>

<style lang="scss">
.column-item {
  padding: 5px 10px;
  margin-bottom: 8px;
  text-align: center;
  transition: background-color .5s;
  background-color: white;
  box-shadow: 0 0 8px grey;
  border-radius: 2px;

  &:hover {
    background-color: #E3F2FD;
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
