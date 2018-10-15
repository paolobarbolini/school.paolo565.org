<template>
  <div class="article-page">
    <top-section
      :items="[ { name: 'Torna Indietro', destination: 'posts' } ]" />

    <h2
      v-if="loaded"
      class="center">
      {{ title }}
    </h2>

    <p
      v-if="loaded && !pdf"
      class="bold center">
      Questo articolo non contiene un pdf.<br>
      <a :href="articleUrl">Vai all'articolo</a>
    </p>

    <div class="article" />
    <loading v-if="!loaded" />
  </div>
</template>

<script>
import pdfjsLib from 'pdfjs-dist/webpack.js';
import {PDFPageView} from 'pdfjs-dist/web/pdf_viewer';

import TopSection from '@/components/TopSection';
import LastUpdate from '@/components/LastUpdate';
import Loading from '@/components/Loading';

import IstitutoGobetti from '@/istitutogobetti';

const CSS_UNITS = 96 / 72;

export default {
  components: {
    TopSection,
    LastUpdate,
    Loading,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      title: '',
      loaded: false,
      pdfUrl: null,
      pdf: null,
    };
  },

  computed: {
    articleUrl() {
      return IstitutoGobetti.getArticlePageUrl(this.id);
    },
  },

  watch: {
    async id(id) {
      this.loaded = false;
      this.pdfUrl = null;
      this.pdf = null;

      await this.loadArticle();
    },

    async pdfUrl(pdfUrl) {
      if (!pdfUrl) return;
      this.pdf = await pdfjsLib.getDocument('https://cors.paolo565.org/' + pdfUrl);
      this.loaded = true;
    },

    async pdf(pdf) {
      if (!pdf) return;
      const container = document.querySelector('.article');
      container.innerHTML = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // https://github.com/mozilla/pdf.js/issues/5628#issuecomment-367399215
        const baseport = page.getViewport(1);
        let scale = container.clientWidth / (baseport.width * CSS_UNITS);
        scale = scale > 1 ? 1 : scale;
        const viewport = page.getViewport(scale);

        const pdfPageView = new PDFPageView({
          container: container,
          id: i,
          scale: scale,
          defaultViewport: viewport,
        });
        pdfPageView.setPdfPage(page);
        pdfPageView.draw();
      }
    },
  },

  created() {
    this.loadArticle();
  },

  methods: {
    async loadArticle(cache = true) {
      const id = this.id;
      const pdf = await IstitutoGobetti.findArticlePagePdf(id);
      this.pdfUrl = pdf.pdfUrl;
      if (!this.pdfUrl) {
        this.loaded = true;
      }
    },
  },
};
</script>

<style lang="scss">
.article-page {
  padding: 0;

  .article {
    .page {
      margin: 0 auto 20px;
    }
  }
}
</style>
