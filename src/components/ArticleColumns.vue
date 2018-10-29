<template>
  <div class="article-columns">
    <ul>
      <column-item
        v-for="item in items"
        :key="item.name"
        :name="item.title"
        :filter="filter"
        :to="{ name: 'post', params: { id: item.id }}" />
    </ul>
  </div>
</template>

<script>
import ColumnItem from './ColumnItem';

export default {
  components: {
    ColumnItem,
  },

  props: {
    items: {
      type: Array,
      required: true,
    },
    filter: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss">
.article-columns {
  max-width: 512px;
  margin: 0 auto;

  ul {
    margin: 0;
    padding: 0;
    margin-left: 10px;
    list-style: none;

    &:last-of-type {
      margin-right: 10px;
    }
  }
}
</style>
