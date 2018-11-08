<template>
  <div class="about-page">
    <top-heading title="Contatti" />
    <div class="container">
      <p>
        App realizzata da <a href="https://www.paolo565.org">Paolo Barbolini</a>
      </p>
      <p>
        <span>Hai trovato un problema?</span>
        <span>
          Contattami
          <a href="mailto:paolo@paolo565.org">paolo@paolo565.org</a>
        </span>
      </p>
      <p>
        <span>Preferisci Telegram?</span>
        <span>Aggiungi <a href="https://t.me/IstitutoGobettiBot">@IstitutoGobettiBot</a></span>
      </p>
    </div>

    <top-heading title="Installazione" />
    <div class="container">
      <ol>
        <li>
          Aprire il browser (si consiglia l'utilizzo di:
          Google Chrome, Firefox, Safari o Edge)
        </li>
        <li>
          Digitare <i>school.paolo565.org</i> nella barra in alto
          e premere il tasto invio
        </li>
        <li>
          Installare l'app (<b>SOLO col browser Google Chrome</b>):
          Premere sull'icona in alto a destra della pagina
          (quella composta da 3 puntini) e selezionare
          <i>Aggiungi a schermata home</i> o
          <i>Installa Istituto Gobetti Web...</i>
        </li>
      </ol>

      <p v-if="supportsWebShare">
        In alternativa <a @click="displayShareDialog">premi qui</a>
        per condividerla direttamente su WhatsApp o per email
      </p>
    </div>

    <top-heading title="Dietro le quinte" />
    <div class="container">
      <p>
        Dati caricati tramite
        <a href="https://gitlab.com/PaoloBarbolini/school.paolo565.org/snippets/1755327">cors.paolo565.org</a>
        e il servizio <a href="https://cors-anywhere.herokuapp.com">CORS Anywhere</a>
      </p>

      <p>
        Hosting: <a href="https://m.do.co/c/5e302bbc5209">DigitalOcean (referral link)</a>
      </p>
      <p>
        Codice sorgente rilasciato su
        <a href="https://github.com/paolobarbolini/school.paolo565.org">GitHub</a>
        sotto <a href="https://github.com/paolobarbolini/school.paolo565.org/blob/master/LICENSE">licenza MIT</a>
      </p>

      <p>
        Icona fornita da
        <a
          href="https://www.freepik.com"
          title="Freepik">Freepik</a>
        tramite
        <a
          href="https://www.flaticon.com/"
          title="Flaticon">flaticon.com</a>
        sotto licenza
        <a
          href="https://creativecommons.org/licenses/by/3.0/deed.it"
          title="Creative Commons BY 3.0"
          target="_blank">CC 3.0 BY</a>
      </p>
      <!-- https://www.flaticon.com/free-icon/time-zone_806237#term=clock&page=2&position=35 -->
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';

import Web from '@/web';

export default {
  components: {
    TopHeading,
  },

  computed: {
    supportsWebShare: Web.supportsWebShare,
  },

  methods: {
    displayShareDialog: Web.displayShareDialog,
  },
};
</script>

<style lang="scss">
.about-page .container {
  p {
    margin: 0 0 10px 0;
  }

  a {
    text-decoration: none;
    color: #3F51B5;
  }

  span,
  i {
    white-space: nowrap;
  }

  ol {
    margin: 0 0 10px 0;
  }
}
</style>
