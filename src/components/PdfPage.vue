<template>
  <div
    ref="pdfPage"
    class="pdf-page" />
</template>

<script>
import {PDFPageView} from 'pdfjs-dist/web/pdf_viewer';

const CSS_UNITS = 96 / 72;

export default {
  props: {
    pdf: {
      type: Object,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
  },

  watch: {
    pdf: {
      handler: 'watchRenderPdf',
      immediate: true,
    },
  },

  methods: {
    watchRenderPdf() {
      this.$nextTick(this.renderPdf);
    },
    async renderPdf() {
      const container = this.$refs.pdfPage;
      const page = await this.pdf.getPage(this.page);

      // https://github.com/mozilla/pdf.js/issues/5628#issuecomment-367399215
      const baseport = page.getViewport(1);
      let scale = container.clientWidth / (baseport.width * CSS_UNITS);
      scale = scale > 1 ? 1 : scale;
      const viewport = page.getViewport(scale);

      const pdfPageView = new PDFPageView({
        container: container,
        id: this.page,
        scale: scale,
        defaultViewport: viewport,
      });
      pdfPageView.setPdfPage(page);
      pdfPageView.draw();
    },
  },
};
</script>

<style lang="scss">
.pdf-page {
  margin-bottom: 32px;
  box-shadow: 0 0 16px 4px #000000;
}
</style>
