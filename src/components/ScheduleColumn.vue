<template>
  <div
    v-if="items.length > 0"
    class="schedule-column">
    <h3 class="center">
      {{ name }}
    </h3>

    <ul>
      <schedule-item
        v-for="item in items"
        :key="item.name"
        :item="item"
        :filter="filter"
        :type="type" />
    </ul>
  </div>
</template>

<script>
import ScheduleItem from './ScheduleItem';

export default {
  components: {
    ScheduleItem,
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
};
</script>

<style lang="scss">
.schedule-column {
  width: 30vw;
  min-width: 240px;
  max-width: 320px;
  flex: 1;

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
