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
    document.addEventListener('DOMContentLoaded', () => {
        const share = document.querySelector('#web-share');
        share.addEventListener('click', () => {
            const i = document.title.indexOf(' | ISG PWA');
            const title = i ? document.title.substring(0, i) : document.title;
            navigator.share({
                title: title,
                url: '',
            });          
        });
        
        share.classList.remove('hidden');
    });
}

/* ============================================================ */
/* Search Bar */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const search = document.querySelector('#search');
    if (!search) return;
    search.classList.remove('hidden');

    // Display the search input
    const searchBar = document.querySelector('#search-bar');
    const searchInput = document.querySelector('#search-bar input');
    search.addEventListener('click', () => {
        searchBar.classList.add('active');
        searchInput.focus();
    });

    // Hide search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' && event.key !== 'Enter') return;

        searchBar.classList.remove('active');
    });

    const searchBack = document.querySelector('#search-back');
    searchBack.addEventListener('click', () => {
        searchBar.classList.remove('active');
    });

    // Search
    searchInput.addEventListener('input', (event) => {
        const value = event.target.value.toLowerCase();
        const elements = document.querySelectorAll('.column-item');

        for (const element of elements) {
            if (!value) {
                element.classList.remove('hidden');
                continue;
            }

            if (element.innerText.toLowerCase().includes(value)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });
});

/* ============================================================ */
/* Printing */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.print);

    const print = document.querySelector('#print');
    if (!print) return;
    print.classList.remove('hidden');

    print.addEventListener('click', () => {
        window.print();
    });
});

/* ============================================================ */
/* Frequently Searched Hours */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const highlightsElement = document.querySelector('#highlighted-schedules');
    if (highlightsElement) {
        // We are in the schedules page
        const previous = JSON.parse(localStorage.getItem('schedule-searches') || '[]');
        if (previous.length === 0) return;

        let bests = previous.sort((a, b) => {
            return a.loads - b.loads;
        }).reverse().slice(0, 3);
        for (const best of bests) {
            // pathname migration since switching from rocket to warp
            const href = best.pathname.includes(' ') ? best.pathname.replace('+', '').replace(' ', '+') : best.pathname;

            const a = document.createElement('a');
            a.setAttribute('href', href);
            a.innerText = best.title;

            const li = document.createElement('li');
            li.classList.add('column-item');
            li.appendChild(a);
            highlightsElement.appendChild(li);
        }

        highlightsElement.classList.remove('hidden');
    } else if (document.querySelector('.schedule')) {
        // We are in the schedule page
        const titleElement = document.querySelector('h1');
        const title = titleElement.innerText;
        const pathname = window.location.pathname;
        let found = false;
        
        let previous = JSON.parse(localStorage.getItem('schedule-searches') || '[]');
        for (let i = 0; i < previous.length; i++) {
            const prev = previous[i];
            if (prev.pathname.toLowerCase() !== pathname.toLowerCase()) continue;

            previous[i].loads += 1;
            found = true;
            break;
        }

        if (!found) {
            const loads = 1;
            previous.push({
                title,
                pathname,
                loads,
            });
        }
        localStorage.setItem('schedule-searches', JSON.stringify(previous));
    }
});

/* ============================================================ */
/* Hours Auto Scrolling */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const schedule = document.querySelector('.schedule');
    if (!schedule) return; // aren't we in the schedule page?
    if (!schedule.scrollTo) return; // unsupported scrollTo

    const i = new Date().getDay() + 1;
    const leftEl = document.querySelector('td:nth-child(1)');
    const destEl = document.querySelector(`td:nth-child(${i})`);
    if (!destEl) return;

    const x = destEl.offsetLeft - leftEl.scrollWidth;
    const y = leftEl.scrollHeight;
    schedule.scrollTo(x, y);

});

/* ============================================================ */
/* PDF Preview */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const pdfPreview = document.querySelector('#pdf-preview');
    if (!pdfPreview) return;

    const url = `${document.location.href}/pdf/1`;
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/vendored/pdf-js/pdf.worker.js';

    const loadPage = (pdf, pageNumber) => {
        return new Promise((resolve, reject) => {
            pdf.getPage(pageNumber).then((page) => {
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
    
                const container = document.querySelector('#pdf-preview');
                const canvas = document.createElement('canvas');
                container.appendChild(canvas);

                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
    
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                const renderTask = page.render(renderContext);
                renderTask.promise.then(resolve).catch(reject);
            });
        });
    }

    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(async (pdf) => {
        for(let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            await loadPage(pdf, pageNumber);

            if (pageNumber === 1) pdfPreview.classList.remove('hidden');
        }
    });
});
