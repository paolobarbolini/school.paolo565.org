<template>
  <div>
    <top-navigation />

    <router-view />

    <bottom-navigation />
  </div>
</template>

<script>
import TopNavigation from '@/components/TopNavigation';
import BottomNavigation from '@/components/BottomNavigation';

export default {
  components: {
    TopNavigation,
    BottomNavigation,
  },
};
</script>
