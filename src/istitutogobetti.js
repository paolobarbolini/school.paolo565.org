import Utils from './utils';

const schoolUrl = 'http://www.istitutogobetti.it';

const allowedEmbeddedTags = [
  'table',
  'tbody',
  'tr',
  'td',
  'p',
  'a',
];

export default {
  async getArticlePageLink(allowCache = true) {
    if (allowCache) {
      const articlePageLink = localStorage.getItem('articlepage-url');
      if (articlePageLink) {
        return articlePageLink;
      }
    }

    // Request the home page
    const homePageResponse = await Utils.fetchCors(schoolUrl);
    const homePageText = await homePageResponse.text();
    const homeBody = await Utils.parseHtml(homePageText);
    const homeUrls = homeBody.querySelectorAll('#jsn-pleft a');

    let partialArticlePageLink;
    for (const homeUrl of homeUrls) {
      const linkText = homeUrl.innerText;

      if (!linkText.includes('Orario') || !linkText.includes('lezioni')) {
        continue;
      }

      partialArticlePageLink = homeUrl.getAttribute('href');
    }

    if (!partialArticlePageLink) {
      return;
    }

    // Request the schedule article
    const articlePageLink = Utils.joinUrls(schoolUrl, partialArticlePageLink);
    localStorage.setItem('articlepage-url', articlePageLink);
    return articlePageLink;
  },

  async isSchedulePageUrl(url) {
    return url.startsWith('/web_orario') || url.startsWith('/weborario');
  },

  async getSchedulePageLink(articlePageLink, allowCache = true) {
    if (allowCache) {
      const schedulePageLink = localStorage.getItem('schedulepage-url');
      if (schedulePageLink) {
        return schedulePageLink;
      }
    }

    const articlePageResponse = await Utils.fetchCors(articlePageLink);
    const articlePageText = await articlePageResponse.text();
    const articlePageBody = await Utils.parseHtml(articlePageText);
    const bodyUrls = articlePageBody.querySelectorAll('#jsn-mainbody a');

    let schedulePageLink;
    for (const bodyUrl of bodyUrls) {
      const articleHref = bodyUrl.getAttribute('href');
      const articleAbsUrl = Utils.joinUrls(articlePageLink, articleHref);
      const cleanUrl = Utils.urlPath(articleAbsUrl).toLowerCase();

      if (!this.isSchedulePageUrl(cleanUrl)) {
        continue;
      }

      schedulePageLink = articleAbsUrl;
    }

    if (!schedulePageLink) {
      throw new Error('Can\'t find the url pointing to the orario facile page');
    }

    localStorage.setItem('schedulepage-url', schedulePageLink);
    return schedulePageLink;
  },

  async getScheduleItems(schedulePageLink, allowCache = true) {
    // Try loading the schedule list from the cache
    if (allowCache) {
      const cachedScheduleItems = localStorage.getItem('schedule-items');
      if (cachedScheduleItems) {
        const scheduleItems = JSON.parse(cachedScheduleItems);
        return scheduleItems;
      }
    }

    // Request the schedule list
    const schedulePageResponse = await Utils.fetchCors(schedulePageLink);
    const schedulePageText = await schedulePageResponse.text();
    const schedulePageBody = await Utils.parseHtml(schedulePageText);
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

    localStorage.setItem('schedule-items', JSON.stringify(scheduleItems));
    return scheduleItems;
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

  async buildEmbeddedSchedule(html) {
    const body = await Utils.parseHtml(html);

    const everything = body.querySelectorAll('center:nth-of-type(2) *');
    for (const element of everything) {
      const name = element.tagName.toLowerCase();
      if (!allowedEmbeddedTags.includes(name)) {
        element.parentElement.removeChild(element);
      }
    }

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

    // Load the table from the cache
    const cachedHtml = localStorage.getItem(`scheduleitem-${name}-${type}`);
    if (cachedHtml) {
      this.buildEmbeddedSchedule(cachedHtml);
    }

    // Load from the network and update the existing table.
    const response = await Utils.fetchCors(selectedScheduleInfo.dataset.url);
    const text = await response.text();
    localStorage.setItem(`scheduleitem-${name}-${type}`, text);
    this.buildEmbeddedSchedule(text);
  },
};
