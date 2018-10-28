import Vue from 'vue';
import Router from 'vue-router';

import Schedules from '@/pages/Schedules';
import Schedule from '@/pages/Schedule';
import Articles from '@/pages/Articles';
import About from '@/pages/About.vue';

const Article = () => import(/* webpackChunkName: "pdf" */ '@/pages/Article');

Vue.use(Router);

const routes = [
  {
    name: 'schedules',
    path: '/',
    component: Schedules,
  },
  {
    name: 'posts',
    path: '/posts/',
    component: Articles,
  },
  {
    name: 'post',
    path: '/posts/:id',
    component: Article,
    props: true,
  },
  {
    name: 'schedule',
    path: '/:type/:name',
    component: Schedule,
    props: true,
  },
  {
    name: 'about',
    path: '/about',
    component: About,
  },
  {
    name: 'not-found',
    path: '*',
    redirect: '/',
  },
];

export default new Router({
  routes,
});
