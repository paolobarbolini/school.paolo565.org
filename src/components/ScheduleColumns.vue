<template>
  <div class="list-columns-wrapper">
    <div class="list-columns">
      <schedule-column
        :items="classes"
        :filter="filter"
        name="Classi"
        type="classi"
      />

      <schedule-column
        :items="teachers"
        :filter="filter"
        name="Docenti"
        type="docenti"
      />

      <schedule-column
        :items="classrooms"
        :filter="filter"
        name="Aule"
        type="aule"
      />
    </div>
  </div>
</template>

<script>
import ScheduleColumn from '@/components/ScheduleColumn';

export default {
  components: {
    ScheduleColumn,
  },

  props: {
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
    classes() {
      return this.filterColumn(this.items, 'classi');
    },
    teachers() {
      return this.filterColumn(this.items, 'docenti');
    },
    classrooms() {
      return this.filterColumn(this.items, 'aule');
    },
  },

  methods: {
    filterColumn(items, type) {
      return items.filter((item) => {
        return item.type === type;
      });
    },
  },
};
</script>

<style lang="scss">
.list-columns-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  display: inline-flex;
}

.list-columns {
  display: flex;
  width: 100%;
}
</style>
