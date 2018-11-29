import Vue from 'vue';
import router from './router';
import App from './App';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import * as Sentry from '@sentry/browser';

import 'request-idle-polyfill'; // Edge Browser is evil
import './index.scss';

Sentry.init({
  dsn: 'https://7c001b53eb4b459d8eeb8806eaa7b898@sentry.io/1333778',
  integrations: [new Sentry.Integrations.Vue({Vue})],
});

runtime.register();

window.addEventListener('load', () => {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app');
});
