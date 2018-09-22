import PDFJS from 'pdfjs-dist';

import Utils from './utils';

export default {
  schoolUrl: 'http://www.istitutogobetti.it/',
  scheduleLoadingMessages: [
    'Caricamento in corso...',
    'Ci siamo quasi...',
    'Ora ci sta davvero mettendo tanto tempo...',
    'Stiamo ancora aspettando...',
    'C\'è nessuno?',
    'Hai davvero molta pazienza!',
    'Stai davvero leggendo questo messaggio?',
    'Forse qualcosa è andato storto?',
  ],
  scheduleLoadingTimer: null,

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

    const posts = [];
    const homePosts = homeBody.querySelectorAll('.jsn-article');
    for (const post of homePosts) {
      const titleElement = post.querySelector('.contentheading');
      const dateElement = post.querySelector('.createdate');
      const linkElement = post.querySelector('.readon');

      const rUrl = linkElement.getAttribute('href');
      const url = Utils.joinUrls(this.schoolUrl, rUrl);

      posts.push({
        title: titleElement.innerText.trim(),
        date: dateElement.innerText.trim(),
        url: url,
      });
    }

    const homeUrls = homeBody.querySelectorAll('#jsn-pleft a');
    let partialArticlePageUrl;
    for (const homeUrl of homeUrls) {
      const linkText = homeUrl.innerText;

      if (!this.isArticlePageButton(linkText)) {
        continue;
      }

      partialArticlePageUrl = homeUrl.getAttribute('href');
    }

    if (!partialArticlePageUrl) {
      return;
    }

    // Request the schedule article
    const articlePage = Utils.joinUrls(this.schoolUrl, partialArticlePageUrl);
    return {
      posts: posts,
      article: articlePage,
    };
  },

  async articlePagePdf(title, url, cache = true) {
    return Utils.load('article-pdf-' + title, async () => {
      return this.findArticlePagePdf(title, url);
    }, cache);
  },

  async findArticlePagePdf(title, pageUrl) {
    const articlePdfPage = await Utils.fetchCorsParseHtml(pageUrl);
    const content = articlePdfPage.querySelector('.jsn-article-content');
    const urls = content.querySelectorAll('a');
    for (const url of urls) {
      const href = url.getAttribute('href');
      if (!href || !href.endsWith('.pdf')) {
        continue;
      }

      const fullUrl = Utils.joinUrls(pageUrl, href);
      return {
        url: fullUrl,
      };
    }
  },

  async isSchedulePageUrl(url) {
    const u = url.toLowerCase();
    return u.startsWith('/web_orario') || u.startsWith('/weborario');
  },

  async schedulePageUrl(articlePageUrl, cache = true) {
    return Utils.load('schedulepage-url-v2', async () => {
      return this.findSchedulePageUrl(articlePageUrl);
    }, cache);
  },

  async findSchedulePageUrl(articlePageUrl) {
    const articlePageBody = await Utils.fetchCorsParseHtml(articlePageUrl);
    const bodyUrls = articlePageBody.querySelectorAll('#jsn-mainbody a');

    let schedulePageUrl;
    for (const bodyUrl of bodyUrls) {
      const articleHref = bodyUrl.getAttribute('href');
      const articleAbsUrl = Utils.joinUrls(articlePageUrl, articleHref);

      if (!this.isSchedulePageUrl(articleAbsUrl)) {
        continue;
      }

      schedulePageUrl = articleAbsUrl;
    }

    if (!schedulePageUrl) {
      throw new Error('Can\'t find the url pointing to the orario facile page');
    }

    return {
      schedule: schedulePageUrl,
    };
  },

  async schedulePageItems(schedulePageUrl, cache = true) {
    return Utils.load('schedule-items-v2', async () => {
      return this.findSchedulePageItems(schedulePageUrl);
    }, cache);
  },

  async findSchedulePageItems(schedulePageUrl) {
    // Request the schedule list
    const schedulePageBody = await Utils.fetchCorsParseHtml(schedulePageUrl);
    const scheduleUrls = schedulePageBody.querySelectorAll('a');

    const scheduleItems = [];

    for (const scheduleUrl of scheduleUrls) {
      const scheduleHref = scheduleUrl.getAttribute('href');
      const scheduleAbsUrl = Utils.joinUrls(schedulePageUrl, scheduleHref);

      let list; let
        type;
      if (scheduleAbsUrl.includes('Classi/')) {
        list = '#classes';
        type = 'classi';
      } else if (scheduleAbsUrl.includes('Docenti/')) {
        list = '#teachers';
        type = 'docenti';
      } else if (scheduleAbsUrl.includes('Aule/')) {
        list = '#classrooms';
        type = 'aule';
      } else {
        continue;
      }

      scheduleItems.push({
        list,
        type,
        name: scheduleUrl.innerText,
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

  generateArticleItem(post) {
    const liElement = document.createElement('li');
    liElement.classList.add('article-list-item');
    liElement.dataset.url = post.url;
    liElement.dataset.title = post.title;

    const aElement = document.createElement('a');
    aElement.href = `#/posts/${post.title}`;
    aElement.innerText = post.title;

    liElement.appendChild(aElement);
    document.querySelector('#articles').appendChild(liElement);
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

  async scheduleItemAndRender(url, name, type, cache = true) {
    const loadingElement = document.querySelector('#schedule-loading');
    let loadingIndex = 0;

    const loader = () => {
      if (loadingIndex >= this.scheduleLoadingMessages.length) {
        clearInterval(this.scheduleLoadingTimer);
        this.scheduleLoadingTimer = null;
        return;
      }

      loadingElement.innerText = this.scheduleLoadingMessages[loadingIndex];

      loadingIndex++;
    };

    if (this.scheduleLoadingTimer) {
      clearInterval(this.scheduleLoadingTimer);
      this.scheduleLoadingTimer = null;
    }

    this.scheduleLoadingTimer = setInterval(loader, 2500);
    loader();

    const item = await this.scheduleItem(url, name, type, cache);
    await this.buildEmbeddedSchedule(item);

    if (this.scheduleLoadingTimer) {
      clearInterval(this.scheduleLoadingTimer);
      this.scheduleLoadingTimer = null;
    }
    loadingElement.innerText = '';

    return item;
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
    for (const u of urls) {
      const fullUrl = u.getAttribute('href');
      if (!fullUrl.startsWith('../') || !fullUrl.endsWith('.html')) {
        continue;
      }

      const url = fullUrl.substring(2, fullUrl.length - 5);
      const type = url.substring(0, url.lastIndexOf('/')).toLowerCase();
      const name = url.substring(url.lastIndexOf('/'));
      const hash = `#${type}${name}`;
      u.href = hash;
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
    const item = await this.scheduleItemAndRender(url, name, type);
    if (!item.cached) {
      return;
    }

    this.scheduleItemAndRender(url, name, type, false);
  },

  async displayPdfItem(title) {
    const selector = `li[data-title="${title}"]`;
    const pdfButton = document.querySelector(selector);
    if (!pdfButton) {
      window.location.hash = '/';
      return;
    }

    Utils.openPage('#post-page');

    const titlee = pdfButton.dataset.title;
    const url = pdfButton.dataset.url;
    const data = await this.articlePagePdf(titlee, url);

    document.querySelector('#post-title').innerText = titlee;

    const container = document.querySelector('#post-canvases');
    Utils.emptyElement(container);

    const pdf = await PDFJS.getDocument('https://cors.paolo565.org/' + data.url);
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport(1);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
      container.appendChild(canvas);
    }
  },
};
