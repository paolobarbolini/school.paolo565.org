import Utils from './utils';

export default {
  schoolUrl: 'http://www.istitutogobetti.it/',

  isArticlePageButton(text) {
    return text.includes('Orario') &&
           text.includes('lezioni') &&
           !text.includes('sostegno');
  },

  async articlePageUrl(cache = true, page = 1) {
    return Utils.load(`articlepage-url-v2-${page}`, async () => {
      return await this.findArticlePageUrl(page);
    }, cache);
  },

  async findArticlePageUrl(page = 1) {
    const limit = ((page - 1) * 4);
    const query = `?limitstart=${limit}`;
    const body = await Utils.fetchCorsParseHtml(`${this.schoolUrl}${query}`);

    const posts = [];
    const postsSelector = body.querySelectorAll('.jsn-article');
    for (const post of postsSelector) {
      const titleElement = post.querySelector('.contentheading');
      const dateElement = post.querySelector('.createdate');
      const linkElement = post.querySelector('.readon');

      const title = titleElement.innerText.trim();
      const date = dateElement.innerText.trim();
      const rUrl = linkElement.getAttribute('href');
      const url = Utils.joinUrls(this.schoolUrl, rUrl);
      let id = url.substring(url.indexOf('&id=') + 4);
      id = id.substring(0, id.indexOf(':'));

      posts.push({
        id,
        title,
        date,
        url,
      });
    }

    const homeUrls = body.querySelectorAll('#jsn-pleft a');
    let article;
    for (const homeUrl of homeUrls) {
      if (!this.isArticlePageButton(homeUrl.innerText)) {
        continue;
      }

      article = Utils.joinUrls(this.schoolUrl, homeUrl.getAttribute('href'));
      break;
    }

    if (!article) {
      return {
        posts,
      };
    }

    return {
      posts,
      article,
    };
  },

  getArticlePageUrl(id) {
    return `${this.schoolUrl}?option=com_content&id=${id}`;
  },

  async articlePagePdf(id, cache = true) {
    return Utils.load(`article-pdf-v2-${id}`, async () => {
      return this.findArticlePagePdf(id);
    }, cache);
  },

  async findArticlePagePdf(id) {
    const url = this.getArticlePageUrl(id);
    const articlePdfPage = await Utils.fetchCorsParseHtml(url);
    const content = articlePdfPage.querySelector('.jsn-article-content');
    const urls = content.querySelectorAll('a');
    for (const url of urls) {
      const href = url.getAttribute('href');
      if (!href || !href.endsWith('.pdf')) {
        continue;
      }

      const fullUrl = Utils.joinUrls(this.schoolUrl, href);
      return {
        pdfUrl: fullUrl,
      };
    }

    return {};
  },

  isSchedulePageUrl(url) {
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

    let schedule;
    for (const bodyUrl of bodyUrls) {
      const href = bodyUrl.getAttribute('href');
      schedule = Utils.joinUrls(articlePageUrl, href);

      if (this.isSchedulePageUrl(href)) {
        break;
      }
    }

    if (!schedule) {
      return {};
    }

    return {
      schedule,
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

    const items = [];
    for (const scheduleUrl of scheduleUrls) {
      const name = scheduleUrl.innerText.trim();
      const href = scheduleUrl.getAttribute('href');
      const url = Utils.joinUrls(schedulePageUrl, href);

      let type;
      if (url.includes('Classi/')) {
        type = 'classi';
      } else if (url.includes('Docenti/')) {
        type = 'docenti';
      } else if (url.includes('Aule/')) {
        type = 'aule';
      } else {
        continue;
      }

      items.push({
        name,
        type,
        url,
      });
    }

    return {
      items,
    };
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
      html,
    };
  },

  async buildEmbeddedSchedule(html) {
    const body = await Utils.parseHtml(html);
    const schedule = body.querySelector('center:nth-of-type(2)');

    // Remove all attributes from table and tr
    const tableTrs = schedule.querySelectorAll('table, tr');
    for (const tableTr of tableTrs) {
      for (const attr of tableTr.attributes) {
        tableTr.removeAttribute(attr);
      }
    }

    // Update all urls
    const urls = schedule.querySelectorAll('a');
    for (const u of urls) {
      const href = u.getAttribute('href');
      if (!href.startsWith('../') || !href.endsWith('.html')) {
        continue;
      }

      const url = href.substring(3, href.length - 5);
      const type = url.substring(0, url.lastIndexOf('/')).toLowerCase();
      const name = url.substring(url.lastIndexOf('/'));
      const hash = `#/${type}${name}`;
      u.href = hash;
    }

    return schedule.innerHTML;
  },
};
