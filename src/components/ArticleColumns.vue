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

  background-color: rgba(234, 164, 7, .65);
  box-shadow: 3px 4px 9px 0px rgba(0, 0, 0, .2);
  transition: background-color .3s;
  border-radius: 16px;

  &:hover {
    background-color: rgba(234, 164, 7, .45);
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
