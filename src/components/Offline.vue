<template>
  <div class="offline-page">
    <icon
      name="hammer"
      scale="3"
    />

    <p>
      Al momento sei offline,
      riprova ad aprire questa pagina tra qualche minuto.
    </p>

    <pre>{{ message }}</pre>

    <p>
      <a @click="$router.go(-1)">
        Torna Indietro
      </a>
    </p>
  </div>
</template>

<script>
import 'vue-awesome/icons/hammer';

import Icon from 'vue-awesome/components/Icon';

export default {
  components: {
    Icon,
  },

  data() {
    return {
      messages: [
        `Un bambino preistorico torna alla caverna con la pagella,
        mette il lastrone di marmo sul tavolo e il padre lo prende
        in mano scuotendo la testa come di uno che non si capacita:
        “...4 in italiano lo capisco: è poco che parliamo,
        sono le prime volte...”
        “...4 in matematica lo capisco:
        le nostre menti non sono ancora sufficientemente evolute...”
        “...ma 4 in storia... dai ... sono due cavolate!!”`,

        `Prof: Claudia per oggi hai studiato?
        Claudia: Sì professoressa. Certo!
        Prof: Bene!!! Sono contenta.
        Allora dimmi una cosa: dove si trova la Francia?
        Claudia: A pagina 132, professoressa.`,

        `Perchè la giraffa prendeva brutti voti?
        Perchè aveva la testa fra le nuvole.`,

        `Prof: Ti avevo chiesto di disegnare una mucca che mangia l'erba,
        tu hai disegnato solo la mucca!
        Studente: Sì professoressa. La mucca ha mangiato tutta l'erba.`,

        `Prof: Qual'è la frase più usata a scuola?
        Studente: Non lo so.
        Prof: Giusto.`,

        `Prof ma non si può essere puniti per qualcosa che non si è fatto?
        Ma certo che no!
        Bene, non ho fatto i compiti!`,

        `Cosa dice un libro di matematica a un'altro libro di matematica?
        Fra te e me ci sono parecchi problemi!`,
      ],
    };
  },

  computed: {
    message() {
      const i = Math.floor((Math.random() * this.messages.length));
      return ' ' + this.messages[i].replace(/ +(?= )/g, '');
    },
  },
};
</script>

<style lang="scss">
.offline-page {
  margin: 30vh 24px 0;

  @media (max-width: 480px) {
    margin-top: 0;
  }

  .fa-icon {
    position: relative;
    left: 50%;
  }

  pre {
    white-space: pre-line;
  }

  p {
    text-align: center;
  }

  a {
    color: #3F51B5;
    font-weight: bold;
    cursor: pointer;
  }
}
</style>
