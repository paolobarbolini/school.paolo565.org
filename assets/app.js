const scheduleCss = `
* {
    font-weight: bold;
    text-decoration: none;
    text-transform: uppercase;
    font-family: "Designosaur";
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

var filterList = function(list, query) {
    const escapedQuery = escapeRegExp(query);

    qee(list, ".schedule-list-item", entry => {
        const text = entry.dataset.originalText;

        if(query == "") {
            entry.classList.remove("hidden");
            entry.querySelector("a").innerHTML = text;
            return;
        }

        if(text.search(new RegExp(escapedQuery, "i")) == -1) {
            entry.classList.add("hidden");
            return;
        }

        const i = text.toLowerCase().indexOf(query.toLowerCase());
        const queryReplacement = text.substring(i, i + query.length);

        const regEx = new RegExp(escapedQuery, "ig");
        const newText = text.replace(regEx, '<span class="highlighted-text">' + queryReplacement + "</span>");

        entry.classList.remove("hidden");
        entry.querySelector("a").innerHTML = newText;
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
        embeddedSchedule.style.height = embeddedSchedule.contentWindow.document.body.offsetHeight + 20 + "px";
    };

    /* ============================================================ */
    /* Load schedules */
    /* ============================================================ */

    const loadingStatus = q("#loading-status");
    loadingStatus.innerText = "Caricamento in corso...";

    // Request the home page
    fetch("https://crossorigin.me/http://www.istitutogobetti.it").then(response => {
        response.text().then(text => {
            const body = parseHtml(text);

            qee(body, "#jsn-pleft a", homepageLink => {
                if(homepageLink.innerHTML.indexOf("Orario") == -1) {
                    return;
                }

                if(homepageLink.innerHTML.indexOf("lezioni") == -1) {
                    return;
                }

                loadingStatus.innerText = "Ci siamo quasi...";

                // Request the schedule article
                const articlePageLink = joinUrl("http://www.istitutogobetti.it", homepageLink.getAttribute("href"));
                fetch("https://crossorigin.me/" + articlePageLink).then(response => {
                    response.text().then(text => {
                        const body = parseHtml(text);

                        qee(body, "#jsn-mainbody a", articleLink => {
                            const articleHref = articleLink.getAttribute("href");
                            const articleAbsUrl = joinUrl(articlePageLink, articleHref);
                            const cleanUrl = urlPath(articleAbsUrl).toLowerCase();

                            if(!cleanUrl.startsWith("/web_orario") && !cleanUrl.startsWith("/weborario")) {
                                return;
                            }

                            loadingStatus.innerText = "Ancora qualche secondo...";

                            // Request the schedule list
                            fetch("https://crossorigin.me/" + articleAbsUrl).then(response => {
                                response.text().then(text => {
                                    const body = parseHtml(text);
                                    const schedulePages = body.querySelectorAll("a");

                                    const classes = q("#classes");
                                    const teachers = q("#teachers");
                                    const classrooms = q("#classrooms");

                                    schedulePages.forEach((schedulePage, index, array) => {
                                        const schedulePageHref = schedulePage.getAttribute("href");  
                                        const schedulePageAbsUrl = joinUrl(articleAbsUrl, schedulePageHref);

                                        const liElement = document.createElement("li");
                                        liElement.classList.add("schedule-list-item");
                                        liElement.dataset.originalText = schedulePage.innerHTML;
                                        liElement.dataset.url = schedulePageAbsUrl;

                                        if(schedulePageAbsUrl.indexOf("Classi/") != -1) {
                                            classes.appendChild(liElement);
                                            liElement.dataset.type = "classi";
                                        } else if(schedulePageAbsUrl.indexOf("Docenti/") != -1) {
                                            teachers.appendChild(liElement);
                                            liElement.dataset.type = "docenti";
                                        } else if(schedulePageAbsUrl.indexOf("Aule/") != -1) {
                                            classrooms.appendChild(liElement);
                                            liElement.dataset.type = "aule";
                                        }

                                        const aElement = document.createElement("a");
                                        aElement.href = "#/" + liElement.dataset.type + "/" + liElement.dataset.originalText;
                                        aElement.innerHTML = liElement.dataset.originalText;

                                        liElement.appendChild(aElement);

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
    /* Page changer */
    /* ============================================================ */

    window.onhashchange = function() {
        const hash = window.location.hash.substring(1);

        if(hash.startsWith("/classi/") || hash.startsWith("/docenti/") || hash.startsWith("/classi/")) {
            // Show a schedule

            const splitted = hash.split("/");
            const name = decodeURIComponent(splitted[splitted.length - 1]);
            const type = splitted[1];

            const selectedScheduleInfo = q("li[data-original-text=\"" + name + "\"][data-type=\"" + type + "\"]");
            if(selectedScheduleInfo == null) {
                Pages.push("#school-schedules");
                return;
            }

            const iframe = document.querySelector("#embedded-schedule");
    
            fetch("https://crossorigin.me/" + selectedScheduleInfo.dataset.url).then(response => {
                response.text().then(text => {
                    const body = parseHtml(text);
                    body.querySelector("style").innerHTML = scheduleCss;
        
                    var div = document.createElement("div");
                    div.appendChild(body.cloneNode(true));
        
                    
                    iframe.contentWindow.document.open("text/html", "replace");
                    iframe.contentWindow.document.write(div.innerHTML);
                    iframe.contentWindow.document.close();
                });
            });
        
            iframe.contentWindow.document.open("text/html", "replace");
            iframe.contentWindow.document.write("");
            iframe.contentWindow.document.close();
        
            Pages.push("#school-schedule");
        } else {
            Pages.push("#school-schedules");
        }
    };

    /* ============================================================ */
    /* Search */
    /* ============================================================ */

    const searchBox = q("#search-box");
    searchBox.value = "";
    searchBox.oninput = function() {
        const searchQuery = searchBox.value.trim();

        qe(".list-column ul", column => {
            filterList(column, searchQuery);
        });
    };

    /* ============================================================ */
    /* Going Back */
    /* ============================================================ */

    if(window.history) {
        window.onpopstate = function(e) {
            if(Pages.back()) {
                return;
            }

            window.history.back();
            return;
        }
    }
};