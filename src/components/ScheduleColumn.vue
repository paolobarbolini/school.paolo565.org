<template>
  <div
    v-show="visible"
    class="schedule-column"
  >
    <h3 class="center">
      {{ name }}
    </h3>

    <ul>
      <column-item
        v-for="item in items"
        :key="item.name"
        :name="item.name"
        :filter="filter"
        :to="{ name: 'schedule', params: { type: type, name: item.name }}"
      />
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
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    filter: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      required: true,
    },
  },

  computed: {
    visible() {
      const filter = this.filter.toLowerCase();
      for (const item of this.items) {
        if (item.name.toLowerCase().includes(filter)) {
          return true;
        }
      }

      return false;
    },
  },
};
</script>

<style lang="scss">
.schedule-column {
  min-width: 33%;

  @media (max-width: 320px) {
    min-width: 100%;
  }

  @media (max-width: 480px) {
    min-width: 50%;
  }

  h3 {
    margin-top: 0;
  }

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
