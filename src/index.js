import Vue from 'vue';
import router from './router';
import App from './App';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import 'request-idle-polyfill'; // Edge Browser is evil
import './index.scss';

window.addEventListener('load', () => {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app');

  runtime.register();
});
