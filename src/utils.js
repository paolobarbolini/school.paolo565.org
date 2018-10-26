const corsProxies = [
  'https://cors.paolo565.org/',
  'https://cors-anywhere.herokuapp.com/',
];

export default {
  msToStr(ms) {
    // From https://stackoverflow.com/a/8212878
    function formatNumber(n, uom) {
      if (n == 1) {
        const p = uom.substr(0, uom.length - 1);

        if (uom.endsWith('e')) {
          uom = `${p}a`; // e -> a
        } else {
          uom = `${p}o`; // i -> o
        }
      }

      return `${n} ${uom} fa`;
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

  timePassed(date) {
    const now = new Date().getTime();
    const then = date.getTime();

    return this.msToStr(now - then);
  },

  joinUrls(baseUrl, url) {
    return new URL(url, baseUrl).href;
  },

  parseHtml(html) {
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

  escapeHtml(string) {
    const element = document.createElement('span');
    element.innerText = string;
    return element.innerHTML;
  },

  async fetchOk(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Invalid response: ${resp.status}`);
    }

    return resp;
  },

  async promiseRaceSuccessfull(ps) {
    // From https://stackoverflow.com/a/39941616
    const invert = (p) => new Promise((res, rej) => p.then(rej, res));
    return await invert(Promise.all(ps.map(invert)));
  },

  fetchCors(url) {
    return this.promiseRaceSuccessfull(
        corsProxies.map((proxy) => {
          return this.fetchOk(`${proxy}${url}`);
        })
    );
  },

  async fetchCorsParseHtml(url) {
    const resp = await this.fetchCors(url);
    const html = await resp.text();
    const parsedHtml = this.parseHtml(html);
    return parsedHtml;
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
        const value = JSON.parse(val);
        value.date = new Date(value.date);
        value.cached = true;
        return value;
      }
    }

    const value = await await loader();
    const savedValue = await this.save(key, value);
    savedValue.cached = false;
    return savedValue;
  },
};
