<template>
  <div class="article-columns-wrapper">
    <div class="article-columns">
      <ul>
        <li
          v-for="item in items"
          :key="item.id"
          class="article-item">
          <router-link
            :to="{ name: 'post', params: { id: item.id }}">
            {{ item.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.article-columns-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  display: inline-flex;
}

.article-columns {
  width: 90%;
  max-width: 500px;
  margin: auto;

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

.article-item {
  padding: 10px 15px;
  margin: 0;
  margin-bottom: 5px;
  text-align: center;

  background-color: rgba(27, 31, 35, .15);
  transition: background-color .3s;
  border-radius: 3px;

  &:hover {
    background-color: rgba(27, 31, 35, .25);
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
