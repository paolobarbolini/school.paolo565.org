/* ============================================================ */
/* Service Worker */
/* ============================================================ */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
    });
}

/* ============================================================ */
/* Page Sharing */
/* ============================================================ */

if (navigator.share) {
    document.addEventListener('load', () => {
        const share = document.querySelector('#web-share');
        share.addEventListener('click', () => {
            navigator.share({
                title: document.title,
                text: 'Controlla con facilità gli orari e gli avvisi dell\'Istituto Gobetti',
                url: window.location.href ,
            });          
        });
        
        share.classList.remove('hidden');
    });
}
