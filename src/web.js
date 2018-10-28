export default {
  supportsWebShare() {
    return !!navigator.share;
  },
  displayShareDialog() {
    navigator.share({
      title: 'Istituto Gobetti App',
      text: 'Controlla con facilità gli orari e gli avvisi ' +
            'dell\'Istituto Gobetti',
      url: 'https://school.paolo565.org',
    });
  },
};
