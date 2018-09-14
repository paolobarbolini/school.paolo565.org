const corsProxies = [
  'https://cors-anywhere.herokuapp.com/',
  'https://crossorigin.me/',
];

let currentlyOpenPage = '#unsupported-device';

export default {
  joinUrls(baseUrl, url) {
    return new URL(url, baseUrl).href;
  },

  urlPath(url) {
    return new URL(url).pathname;
  },

  async parseHtml(html) {
    const doc = document.implementation.createHTMLDocument('preview');
    const element = doc.createElement('div');
    element.innerHTML = html;

    const scripts = element.querySelectorAll('script');
    for (const script of scripts) {
      script.parentElement.removeChild(script);
    }

    return element;
  },

  escapeRegExp(str) {
    return str.replace(/[-[]\/{}()\*\+\?\.\\\^\$\|]/g, '\\$&');
  },

  async fetchCors(url, retries = 0) {
    if (retries >= corsProxies.length) {
      throw new Error(`No CORS proxy could fetch: ${url}`);
    }

    try {
      const response = await fetch(corsProxies[retries] + url);
      if (!response.ok) {
        throw new Error(`Invalid response: ${response.status}`);
      }

      return response;
    } catch (err) {
      return this.fetchCors(url, retries + 1);
    }
  },

  openPage(query) {
    if (query === currentlyOpenPage) {
      return;
    }

    document.querySelector(query).classList.remove('hidden');
    document.querySelector(currentlyOpenPage).classList.add('hidden');
    currentlyOpenPage = query;
  },
};
