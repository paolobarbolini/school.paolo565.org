import Utils from './utils';

export default {
  schoolUrl: 'http://www.istitutogobetti.it',

  isArticlePageButton(text) {
    return text.includes('Orario') &&
           text.includes('lezioni') &&
           !text.includes('sostegno');
  },

  async articlePageUrl(cache = true) {
    return Utils.load('articlepage-url-v2', async () => {
      return await this.findArticlePageUrl();
    }, cache);
  },

  async findArticlePageUrl() {
    const homeBody = await Utils.fetchCorsParseHtml(this.schoolUrl);
    const homeUrls = homeBody.querySelectorAll('#jsn-pleft a');

    let partialArticlePageLink;
    for (const homeUrl of homeUrls) {
      const linkText = homeUrl.innerText;

      if (!this.isArticlePageButton(linkText)) {
        continue;
      }

      partialArticlePageLink = homeUrl.getAttribute('href');
    }

    if (!partialArticlePageLink) {
      return;
    }

    // Request the schedule article
    const articlePage = Utils.joinUrls(this.schoolUrl, partialArticlePageLink);
    return {
      article: articlePage,
    };
  },

  async isSchedulePageUrl(url) {
    const u = url.toLowerCase();
    return u.startsWith('/web_orario') || u.startsWith('/weborario');
  },

  async schedulePageUrl(articlePageLink, cache = true) {
    return Utils.load('schedulepage-url-v2', async () => {
      return this.findSchedulePageUrl(articlePageLink);
    }, cache);
  },

  async findSchedulePageUrl(articlePageLink) {
    const articlePageBody = await Utils.fetchCorsParseHtml(articlePageLink);
    const bodyUrls = articlePageBody.querySelectorAll('#jsn-mainbody a');

    let schedulePageLink;
    for (const bodyUrl of bodyUrls) {
      const articleHref = bodyUrl.getAttribute('href');
      const articleAbsUrl = Utils.joinUrls(articlePageLink, articleHref);

      if (!this.isSchedulePageUrl(articleAbsUrl)) {
        continue;
      }

      schedulePageLink = articleAbsUrl;
    }

    if (!schedulePageLink) {
      throw new Error('Can\'t find the url pointing to the orario facile page');
    }

    return {
      schedule: schedulePageLink,
    };
  },

  async schedulePageItems(schedulePageLink, cache = true) {
    return Utils.load('schedule-items-v2', async () => {
      return this.findSchedulePageItems(schedulePageLink);
    }, cache);
  },

  async findSchedulePageItems(schedulePageLink) {
    // Request the schedule list
    const schedulePageBody = await Utils.fetchCorsParseHtml(schedulePageLink);
    const schedulePageUrls = schedulePageBody.querySelectorAll('a');

    const scheduleItems = [];

    for (const schedulePageUrl of schedulePageUrls) {
      const scheduleHref = schedulePageUrl.getAttribute('href');
      const scheduleAbsUrl = Utils.joinUrls(schedulePageLink, scheduleHref);

      let list; let
        type;
      if (scheduleAbsUrl.indexOf('Classi/') !== -1) {
        list = '#classes';
        type = 'classi';
      } else if (scheduleAbsUrl.indexOf('Docenti/') !== -1) {
        list = '#teachers';
        type = 'docenti';
      } else if (scheduleAbsUrl.indexOf('Aule/') !== -1) {
        list = '#classrooms';
        type = 'aule';
      } else {
        continue;
      }

      scheduleItems.push({
        list,
        type,
        name: schedulePageUrl.innerText,
        url: scheduleAbsUrl,
      });
    }

    return {
      items: scheduleItems,
    };
  },

  generateScheduleItem(item) {
    const liElement = document.createElement('li');
    liElement.classList.add('schedule-list-item');
    liElement.dataset.originalText = item.name;
    liElement.dataset.url = item.url;

    const aElement = document.createElement('a');
    aElement.href = `#/${item.type}/${encodeURIComponent(item.name)}`;
    aElement.innerText = liElement.dataset.originalText;

    liElement.dataset.type = item.type;
    liElement.appendChild(aElement);
    document.querySelector(item.list).appendChild(liElement);
  },

  async scheduleItem(url, name, type, cache = true) {
    return Utils.load(`scheduleitem-v2-${name}-${type}`, async () => {
      return this.findScheduleItem(url);
    }, cache);
  },

  async findScheduleItem(url) {
    const response = await Utils.fetchCors(url);
    const html = await response.text();
    return {
      html: html,
    };
  },

  async buildEmbeddedSchedule(item) {
    const lastUpdateElement = document.querySelector('#schedule-last-update');
    Utils.dateRangeUpdater(lastUpdateElement, item.date);

    const body = await Utils.parseHtml(item.html);
    const tableTrs = body.querySelectorAll('center:nth-of-type(2) table, tr');
    for (const tableTr of tableTrs) {
      for (const attr of tableTr.attributes) {
        tableTr.removeAttribute(attr);
      }
    }

    const urls = body.querySelectorAll('center:nth-of-type(2) a');
    for (const link of urls) {
      const fullUrl = link.getAttribute('href');
      if (!fullUrl.startsWith('../') || !fullUrl.endsWith('.html')) {
        continue;
      }

      const url = fullUrl.substring(2, fullUrl.length - 5);
      const type = url.substring(0, url.lastIndexOf('/')).toLowerCase();
      const name = url.substring(url.lastIndexOf('/'));
      const hash = `#${type}${name}`;
      link.href = hash;
    }

    const scheduleEl = document.querySelector('#embedded-schedule');
    const schedule = body.querySelector('center:nth-of-type(2)');
    scheduleEl.innerHTML = schedule.innerHTML;
  },

  async displayScheduleItem(name, type) {
    const selector = `li[data-original-text="${name}"][data-type="${type}"]`;
    const selectedScheduleInfo = document.querySelector(selector);
    if (!selectedScheduleInfo) {
      window.location.hash = '/';
      Utils.openPage('#school-schedules');
      return;
    }

    const schedule = document.querySelector('#embedded-schedule');
    schedule.innerHTML = '';
    document.querySelector('#school-schedule-title').innerText = name;
    Utils.openPage('#school-schedule');

    const url = selectedScheduleInfo.dataset.url;
    const item = await this.scheduleItem(url, name, type);
    this.buildEmbeddedSchedule(item);

    if (!item.cached) {
      return;
    }

    const freshItem = await this.scheduleItem(url, name, type, false);
    this.buildEmbeddedSchedule(freshItem);
  },
};
