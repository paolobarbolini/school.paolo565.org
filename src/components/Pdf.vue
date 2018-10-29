<template>
  <div
    v-if="pdf"
    class="pdf">
    <pdf-page
      v-for="page in pdf.numPages"
      :key="page"
      :pdf="pdf"
      :page="page" />
  </div>
</template>

<script>
import pdfjsLib from 'pdfjs-dist/webpack.js';

import PdfPage from '@/components/PdfPage';

export default {
  components: {
    PdfPage,
  },

  props: {
    url: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      pdf: null,
    };
  },

  watch: {
    url: {
      handler: 'loadPdf',
      immediate: true,
    },
  },

  methods: {
    async loadPdf() {
      this.pdf = await pdfjsLib.getDocument('https://cors.paolo565.org/' + this.url);
      this.$emit('pdf-loaded');
    },
  },
};
</script>
