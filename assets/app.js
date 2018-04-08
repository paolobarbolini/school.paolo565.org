const scheduleCss = `
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

var parseHtml = function(html) {
    const newHTMLDocument = document.implementation.createHTMLDocument('preview');
    const element = newHTMLDocument.createElement('div')
    element.innerHTML = html;

    const scripts = element.getElementsByTagName('script');
    const i = scripts.length;
    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }


    return element;
}

var onScheduleClick = function() {
    fetch('https://crossorigin.me/' + this.dataset.url).then(response => {
        response.text().then(text => {
            const body = parseHtml(text);
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

var filterList = function(list, query) {
    qee(list, "li", entry => {
        const text = entry.dataset.originalText;
        if(query == "") {
            entry.innerHTML = text;
            entry.classList.remove("hidden");
            return;
        }

        if(text.includes(query)) {
            entry.classList.remove("hidden");

            var newText = "";
            const splitted = text.split(query);
            splitted.forEach((entry, index, array)=> {
                newText += entry;

                if((index + 1) != array.length) {
                    newText += "<span class=\"highlighted-text\">" + query + "</span>";
                }
            });
            entry.innerHTML = newText;
        } else {
            entry.classList.add("hidden");
        }
    });
};

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
            const body = parseHtml(text);

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
                        const body = parseHtml(text);

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
                                    const body = parseHtml(text);
                                    const schedulePages = body.querySelectorAll("a");

                                    const classes = q("#classes");
                                    const teachers = q("#teachers");
                                    const classrooms = q("#classrooms");

                                    schedulePages.forEach((schedulePage, index, array) => {
                                        const schedulePageHref = schedulePage.getAttribute("href");  
                                        const schedulePageAbsUrl = joinUrl(articleAbsUrl, schedulePageHref);

                                        const liElement = document.createElement('li');
                                        liElement.innerHTML = liElement.dataset.originalText = schedulePage.innerHTML;
                                        liElement.dataset.url = schedulePageAbsUrl;
                                        liElement.addEventListener('click', onScheduleClick);

                                        if(schedulePageAbsUrl.indexOf("Classi/") != -1) {
                                            classes.appendChild(liElement);
                                        } else if(schedulePageAbsUrl.indexOf("Docenti/") != -1) {
                                            teachers.appendChild(liElement);
                                        } else if(schedulePageAbsUrl.indexOf("Aule/") != -1) {
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

    /* ============================================================ */
    /* Search */
    /* ============================================================ */
    const searchBox = q("#search-box");
    searchBox.value = "";
    searchBox.oninput = function() {
        const searchQuery = searchBox.value.trim();

        filterList(q("#classes"), searchQuery);
        filterList(q("#teachers"), searchQuery);
        filterList(q("#classrooms"), searchQuery);
    };
};