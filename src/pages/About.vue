<template>
  <div class="about-page">
    <top-heading title="Contattami" />

    <div class="container">
      <p>
        Questo sito è stato creato per velocizzare l'accesso
        agli orari scolastici su
        <a href="http://www.istitutogobetti.it">www.istitutogobetti.it</a>
      </p>
      <p>
        Preferisci utilizzare un bot di Telegram?
        Aggiungi <a href="https://t.me/IstitutoGobettiBot">@IstitutoGobettiBot</a>
      </p>

      <hr>

      <p>
        Sito realizzato da <a href="https://www.paolo565.org">Paolo Barbolini</a>
      </p>
      <p>
        Hai trovato un problema?
        Contattami <a href="mailto:paolo@paolo565.org">paolo@paolo565.org</a>
      </p>

      <hr>

      <h2 class="center">Guida All'Installazione</h2>
      <ol>
        <li>
          Aprire il browser (si consiglia l'utilizzo di:
          Google Chrome, Firefox, Edge o Safari)</li>
        <li>
          Digitare <a href="https://school.paolo565.org">school.paolo565.org</a>
          e premere il tasto invio
        </li>
        <li>
          Attendere il caricamento degli orari
        </li>
        <li>
          Installare l'app (<b>SOLO per dispositivi Android</b>):
          Premere sull'icona in alto a destra della pagina
          (quella composta da 3 puntini) e selezionare
          <i>Aggiungi a schermata home</i>
        </li>
      </ol>

      <hr>

      <h2 class="center">Dietro le Quinte</h2>

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
          href="https://creativecommons.org/licenses/by/3.0/"
          title="Creative Commons BY 3.0"
          target="_blank">CC 3.0 BY</a>
      </p>
      <!-- https://www.flaticon.com/free-icon/time-zone_806237#term=clock&page=2&position=35 -->
    </div>
  </div>
</template>

<script>
import TopHeading from '@/components/TopHeading';

export default {
  components: {
    TopHeading,
  },
};
</script>

<style lang="scss">
.about-page .container {
  p {
    margin: 0;
    text-align: center;

    &:first-of-type {
      margin-top: 20px;
    }
  }

  hr {
    margin: 0 10px;
  }
}
</style>
