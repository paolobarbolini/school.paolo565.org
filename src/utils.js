const corsProxies = [
  'https://cors-anywhere.herokuapp.com/',
  'https://crossorigin.me/',
];

export default {
  timeInterval: null,
  currentlyOpenPage: '#unsupported-device',

  msToStr(ms) {
    // From https://stackoverflow.com/a/8212878

    function formatNumber(n, uom) {
      if (n == 1) {
        const p = uom.substr(0, uom.length - 1);

        if (uom.endsWith('e')) {
          uom = p + 'a'; // a -> e
        } else {
          uom = p + 'o'; // e -> i
        }
      }

      return n + ' ' + uom + ' fa';
    }

    let temp = Math.floor(ms / 1000);
    const years = Math.floor(temp / 31536000);
    if (years) {
      return formatNumber(years, 'anni');
    }

    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      return formatNumber(days, 'giorni');
    }
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      return formatNumber(hours, 'ore');
    }
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      return formatNumber(minutes, 'minuti');
    }
    const seconds = temp % 60;
    if (seconds) {
      return formatNumber(seconds, 'secondi');
    }
    return 'ora';
  },

  dateToRangeStr(date) {
    const now = new Date().getTime();
    const then = date.getTime();

    return this.msToStr(now - then);
  },

  dateRangeUpdater(element, date) {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    element.title = date.toLocaleString();
    this.timeInterval = setInterval(() => {
      element.innerText = this.dateToRangeStr(date);
    }, 1000);
  },

  joinUrls(baseUrl, url) {
    return new URL(url, baseUrl).href;
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
    if (query === this.currentlyOpenPage) {
      return;
    }

    document.querySelector(query).classList.remove('hidden');
    document.querySelector(this.currentlyOpenPage).classList.add('hidden');
    this.currentlyOpenPage = query;
  },

  save(key, value) {
    value.date = new Date();
    const val = JSON.stringify(value);
    localStorage.setItem(key, val);
    return value;
  },

  async load(key, loader, cache = true) {
    if (cache) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const value = JSON.parse(val);
          value.date = new Date(value.date);
          value.cached = true;
          return value;
        } catch (err) {}
      }
    }

    const value = await await loader();
    const savedValue = await this.save(key, value);
    savedValue.cached = false;
    return savedValue;
  },
};
