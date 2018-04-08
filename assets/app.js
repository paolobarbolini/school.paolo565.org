const range = document.createRange();

var scheduleCss = `
* {
    font-weight: bold;
    text-decoration: none;
    text-transform: uppercase;
    font-family: 'Designosaur';
    font-size: 9pt;
}
.nodecBlack {
    color: #000000;
}
.nodecWhite {
    color: #FFFFFF;
}
td {
    padding: 10px;
}
center:first-of-type,
center:last-of-type,
.mathema p,
#mathema {
    display: none;
}
.nodecBlack, .nodecWhite {
  max-height: 20px;
}
 #nodecBlack, #nodecWhite {
  height: 10px;
  max-height: 10px;
}
p {
  margin: 0;
  margin-top: 5px;
  padding: 0;
}
`

var onScheduleClick = function() {
    fetch('https://crossorigin.me/' + this.dataset.url).then(response => {
        response.text().then(text => {
            const body = range.createContextualFragment(text);
            body.querySelector("style").innerHTML = scheduleCss;

            var div = document.createElement('div');
            div.appendChild(body.cloneNode(true));

            const iframe = document.querySelector("#embedded-schedule");
            iframe.contentWindow.document.open('text/html', 'replace');
            iframe.contentWindow.document.write(div.innerHTML);
            iframe.contentWindow.document.close();
        });
    });

    Pages.push("#school-schedule");
}

var renderList = function(classes, ) {

}

window.onload = function() {

    /* ============================================================ */
    /* Init pages */
    /* ============================================================ */

    Pages.init();

    /* ============================================================ */
    /* Resize the iframe */
    /* ============================================================ */

    const embeddedSchedule = document.getElementById("embedded-schedule");
    embeddedSchedule.onload = function() {
        embeddedSchedule.style.height = embeddedSchedule.contentWindow.document.body.offsetHeight + 20 + 'px';
    };

    /* ============================================================ */
    /* Load schedules */
    /* ============================================================ */

    // Request the home page
    fetch('https://crossorigin.me/http://www.istitutogobetti.it').then(response => {
        response.text().then(text => {
            const body = range.createContextualFragment(text);
            qee(body, "#jsn-pleft a", homepageLink => {
                if(homepageLink.innerHTML.indexOf("Orario") == -1) {
                    return;
                }

                if(homepageLink.innerHTML.indexOf("lezioni") == -1) {
                    return;
                }

                // Request the schedule article
                const articlePageLink = joinUrl("http://www.istitutogobetti.it", homepageLink.getAttribute("href"));
                fetch('https://crossorigin.me/' + articlePageLink).then(response => {
                    response.text().then(text => {
                        const body = range.createContextualFragment(text);
                        qee(body, "#jsn-mainbody a", articleLink => {
                            const articleHref = articleLink.getAttribute("href");
                            const articleAbsUrl = joinUrl(articlePageLink, articleHref);
                            const cleanUrl = urlPath(articleAbsUrl).toLowerCase();

                            if(!cleanUrl.startsWith("/web_orario") && !cleanUrl.startsWith("/weborario")) {
                                return;
                            }

                            // Request the schedule list
                            fetch('https://crossorigin.me/' + articleAbsUrl).then(response => {
                                response.text().then(text => {
                                    const body = range.createContextualFragment(text);
                                    const schedulePages = body.querySelectorAll("a");

                                    const classes = q("#classes");
                                    const teachers = q("#teachers");
                                    const classrooms = q("#classrooms");

                                    schedulePages.forEach((schedulePage, index, array) => {
                                        const schedulePageHref = schedulePage.getAttribute("href");  
                                        const schedulePageAbsUrl = joinUrl(articleAbsUrl, schedulePageHref);

                                        if(schedulePageAbsUrl.indexOf("Classi/") != -1) {
                                            var liElement = document.createElement('li');
                                            liElement.textContent = schedulePage.innerHTML;
                                            liElement.dataset.url = schedulePageAbsUrl;
                                            liElement.addEventListener('click', onScheduleClick);
                                            classes.appendChild(liElement);
                                        } else if(schedulePageAbsUrl.indexOf("Docenti/") != -1) {
                                            var liElement = document.createElement('li');
                                            liElement.textContent = schedulePage.innerHTML;
                                            liElement.dataset.url = schedulePageAbsUrl;
                                            liElement.addEventListener('click', onScheduleClick);
                                            teachers.appendChild(liElement);
                                        } else if(schedulePageAbsUrl.indexOf("Aule/") != -1) {
                                            var liElement = document.createElement('li');
                                            liElement.textContent = schedulePage.innerHTML;
                                            liElement.dataset.url = schedulePageAbsUrl;
                                            liElement.addEventListener('click', onScheduleClick);
                                            classrooms.appendChild(liElement);
                                        }

                                        if((index + 1) == array.length) {
                                            Pages.push("#school-schedules");
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};