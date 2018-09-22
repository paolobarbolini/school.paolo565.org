import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import Gobetti from './istitutogobetti';
import Utils from './utils';

import './index.scss';

function setLoadingStatus(text) {
  const loadingStatus = document.querySelector('#loading-status');
  loadingStatus.innerText = text;
}

function filterColumns() {
  const searchBox = document.querySelector('#search-box');
  const searchQuery = searchBox.value.trim();

  const columns = document.querySelectorAll('.list-column ul');
  for (const column of columns) {
    const escapedQuery = Utils.escapeRegExp(searchQuery);
    const regEx = new RegExp(escapedQuery, 'ig');
    let visible = false;

    const entries = column.querySelectorAll('.schedule-list-item');
    for (const entry of entries) {
      const text = entry.dataset.originalText;

      if (searchQuery === '') {
        visible = true;
        entry.classList.remove('hidden');
        const url = entry.querySelector('a');
        url.innerHTML = text;
        continue;
      }

      if (text.search(new RegExp(escapedQuery, 'i')) === -1) {
        entry.classList.add('hidden');
        continue;
      }

      const i = text.toLowerCase().indexOf(searchQuery.toLowerCase());
      const queryReplacement = text.substring(i, i + searchQuery.length);
      const newText = text.replace(regEx, `<b>${queryReplacement}</b>`);

      visible = true;
      entry.classList.remove('hidden');
      const url = entry.querySelector('a');
      url.innerHTML = newText;
    }

    if (visible) {
      column.parentElement.classList.remove('hidden');
    } else {
      column.parentElement.classList.add('hidden');
    }
  }
}

async function loadFromHash() {
  const hash = window.location.hash.substring(1);
  const splitted = hash.split('/');
  const type = splitted[1];

  if (['classi', 'docenti', 'aule'].includes(type)) {
    // Show a schedule
    const name = decodeURIComponent(splitted[splitted.length - 1]);

    Gobetti.displayScheduleItem(name, type);
  } else if (hash === '/posts/') {
    Utils.openPage('#posts-page');
  } else if (hash.startsWith('/posts/')) {
    const title = decodeURIComponent(splitted[splitted.length - 1]);
    Gobetti.displayPdfItem(title);
  } else if (hash.startsWith('/about')) {
    Utils.openPage('#about');
  } else {
    const before = Utils.currentlyOpenPage;
    Utils.openPage('#school-schedules');

    if (before !== '#school-schedule') {
      return;
    }

    const articlePage = await Gobetti.articlePageUrl();
    const articleUrl = articlePage.article;
    const schedulePage = await Gobetti.schedulePageUrl(articleUrl);
    const scheduleUrl = schedulePage.schedule;
    const scheduleItems = await Gobetti.schedulePageItems(scheduleUrl);
    const lastUpdateElement = document.querySelector('#schedules-last-update');
    Utils.dateRangeUpdater(lastUpdateElement, scheduleItems.date);
  }
}

async function loadSchedules(cache = false) {
  const articlePage = await Gobetti.articlePageUrl(cache);
  if (!articlePage) {
    throw new Error('Can\'t find the article pointing to orario facile');
  }
  setLoadingStatus('Ci siamo quasi...');

  const articles = document.querySelector('#articles');
  Utils.emptyElement(articles);

  for (const post of articlePage.posts) {
    Gobetti.generateArticleItem(post);
  }
  const lastUpdatePosts = document.querySelector('#posts-last-update');
  Utils.dateRangeUpdater(lastUpdatePosts, articlePage.date);

  const articleUrl = articlePage.article;
  const schedulePage = await Gobetti.schedulePageUrl(articleUrl, cache);
  if (!schedulePage) {
    throw new Error('Can\'t find the article pointing to orario facile');
  }
  setLoadingStatus('Ancora qualche secondo...');

  const scheduleUrl = schedulePage.schedule;
  const scheduleItems = await Gobetti.schedulePageItems(scheduleUrl, cache);

  const items = document.querySelector('.list-column ul');
  Utils.emptyElement(items);

  const lastUpdateElement = document.querySelector('#schedules-last-update');
  Utils.dateRangeUpdater(lastUpdateElement, scheduleItems.date);
  for (const item of scheduleItems.items) {
    Gobetti.generateScheduleItem(item);
  }

  if (cache) {
    loadFromHash();
  } else {
    filterColumns();
  }

  if (cache) {
    loadSchedules(false);
  }
}

window.addEventListener('load', () => {
  /* ============================================================ */
  /* Check browser compatibility */
  /* ============================================================ */

  if (!window.fetch) {
    return;
  }

  /* ============================================================ */
  /* Iframe resizer */
  /* ============================================================ */

  const embeddedSchedule = document.querySelector('#embedded-schedule');
  embeddedSchedule.addEventListener('load', () => {
    const h = embeddedSchedule.contentWindow.document.body.offsetHeight + 20;
    embeddedSchedule.style.height = `${h}px`;
  });

  /* ============================================================ */
  /* Page changer */
  /* ============================================================ */

  window.addEventListener('hashchange', loadFromHash);

  /* ============================================================ */
  /* Search */
  /* ============================================================ */

  const searchBox = document.querySelector('#search-box');
  searchBox.value = '';
  searchBox.addEventListener('input', filterColumns);

  /* ============================================================ */
  /* Load schedules */
  /* ============================================================ */

  setLoadingStatus('Caricamento in corso...');
  Utils.openPage('#loading');

  try {
    loadSchedules(true);
  } catch (e) {
    setLoadingStatus('Impossibile caricare la lista degli orari.');
  }

  /* ============================================================ */
  /* Service Worker */
  /* ============================================================ */

  runtime.register();
});
