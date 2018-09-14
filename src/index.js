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
        const link = entry.querySelector('a');
        link.innerHTML = text;
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
      const link = entry.querySelector('a');
      link.innerHTML = newText;
    }

    if (visible) {
      column.parentElement.classList.remove('hidden');
    } else {
      column.parentElement.classList.add('hidden');
    }
  }
}

function loadFromHash() {
  const hash = window.location.hash.substring(1);
  const splitted = hash.split('/');
  const type = splitted[1];

  if (['classi', 'docenti', 'aule'].includes(type)) {
    // Show a schedule
    const name = decodeURIComponent(splitted[splitted.length - 1]);

    Gobetti.displayScheduleItem(name, type);
  } else if (hash.startsWith('/about')) {
    Utils.openPage('#about');
  } else {
    Utils.openPage('#school-schedules');
  }
}

async function loadSchedules(cache = false) {
  const articlePage = await Gobetti.getArticlePageLink(cache);
  if (!articlePage) {
    throw new Error('Can\'t find the article pointing to orario facile');
  }
  setLoadingStatus('Ci siamo quasi...');

  const schedulePage = await Gobetti.getSchedulePageLink(articlePage, cache);
  if (!schedulePage) {
    throw new Error('Can\'t find the article pointing to orario facile');
  }
  setLoadingStatus('Ancora qualche secondo...');

  const scheduleItems = await Gobetti.getScheduleItems(schedulePage, cache);

  if (!cache) {
    const items = document.querySelectorAll('.list-column li');
    for (const item of items) {
      item.parentElement.removeChild(item);
    }
  }

  for (const item of scheduleItems) {
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
