<template>
  <div class="article-page">
    <top-heading :title="title" />

    <div class="container">
      <p
        v-if="loaded && !pdfUrl"
        class="bold center no-pdf">
        Questo articolo non contiene un pdf.<br>
        <a :href="articleUrl">Vai all'articolo</a>
      </p>

      <pdf
        v-if="loaded"
        :url="pdfUrl"
        class="article" />
      <loading v-if="!loaded" />
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';
import Loading from '@/components/Loading';

const Pdf = () => import(/* webpackChunkName: "pdf" */ '@/components/Pdf');

import IstitutoGobetti from '@/istitutogobetti';

export default {
  components: {
    TopHeading,
    Loading,
    Pdf,
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
    };
  },

  computed: {
    articleUrl() {
      return IstitutoGobetti.getArticlePageUrl(this.id);
    },
  },

  watch: {
    id: {
      handler: 'loadArticle',
      immediate: true,
    },
  },

  methods: {
    async loadArticle() {
      this.loaded = false;
      this.pdfUrl = null;
      this.pdf = null;

      const id = this.id;
      const pdf = await IstitutoGobetti.articlePagePdf(id);
      this.title = pdf.title;
      this.pdfUrl = pdf.pdfUrl;
      this.loaded = true;
    },
  },
};
</script>

<style lang="scss">
.article-page {
  .container {
    background-color: #525659;
  }

  .no-pdf {
    color: white;

    a {
      color: #536DFE;
    }
  }
}
</style>
