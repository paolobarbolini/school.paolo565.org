"use strict";

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

const setLoadingStatus = function(text) {
    const loadingStatus = q("#loading-status");
    loadingStatus.innerText = text;
}

const filterColumns = function() {
    const searchBox = q("#search-box");
    const searchQuery = searchBox.value.trim();

    qe(".list-column ul", column => {
        const escapedQuery = escapeRegExp(searchQuery);
        const regEx = new RegExp(escapedQuery, "ig");
        let visibleCount = 0;
    
        qee(column, ".schedule-list-item", entry => {
            const text = entry.dataset.originalText;
    
            if(searchQuery == "") {
                visibleCount++;
                entry.classList.remove("hidden");
                entry.querySelector("a").innerHTML = text;
                return;
            }
    
            if(text.search(new RegExp(escapedQuery, "i")) == -1) {
                entry.classList.add("hidden");
                return;
            }
    
            const i = text.toLowerCase().indexOf(searchQuery.toLowerCase());
            const queryReplacement = text.substring(i, i + searchQuery.length);
            const newText = text.replace(regEx, '<b>' + queryReplacement + "</b>");
    
            visibleCount++;
            entry.classList.remove("hidden");
            entry.querySelector("a").innerHTML = newText;
        });
    
        if(visibleCount > 0) {
            column.parentElement.classList.remove("hidden");
        } else {
            column.parentElement.classList.add("hidden");
        }
    });
}

const loadFromHash = async function() {
    const hash = window.location.hash.substring(1);

    if(hash.startsWith("/classi/") || hash.startsWith("/docenti/") || hash.startsWith("/aule/")) {
        // Show a schedule
        const splitted = hash.split("/");
        const name = decodeURIComponent(splitted[splitted.length - 1]);
        const type = splitted[1];

        displayScheduleItem(name, type);
    } else if(hash.startsWith("/about")) {
        openPage("#about");
    } else {
        openPage("#school-schedules");
    }
}

const loadSchedules = async function(firstLoad = false) {
    const articlePageLink = await getArticlePageLink(firstLoad);
    if(!articlePageLink) {
        throw new Error("Failed to get the url of the article pointing to the orario facile page");
    }
    setLoadingStatus("Ci siamo quasi...");

    const schedulePageLink = await getSchedulePageLink(articlePageLink, firstLoad);
    if(!schedulePageLink) {
        throw new Error("Failed to get the url of the orario facile page");
    }
    setLoadingStatus("Ancora qualche secondo...");

    const scheduleItems = await getScheduleItems(schedulePageLink, firstLoad);

    if(!firstLoad) {
        qe(".list-column li", item => {
            item.parentElement.removeChild(item);
        });
    }

    await scheduleItems.forEach(item => {
        generateScheduleItem(item);
    });

    if(firstLoad) {
        loadFromHash();
    } else {
        filterColumns();
    }

    if(firstLoad) {
        try {
            loadSchedules(false);
        } catch(err) {
            console.log(err);
        }
    }
}

window.onload = function() {

    /* ============================================================ */
    /* Check browser compatibility */
    /* ============================================================ */

    if(!window.fetch) {
        return;
    }

    /* ============================================================ */
    /* Iframe resizer */
    /* ============================================================ */

    // TODO: Remove this hack

    const embeddedSchedule = document.getElementById("embedded-schedule");
    embeddedSchedule.onload = function() {
        embeddedSchedule.style.height = embeddedSchedule.contentWindow.document.body.offsetHeight + 20 + "px";
    };

    /* ============================================================ */
    /* Page changer */
    /* ============================================================ */

    window.onhashchange = loadFromHash;

    /* ============================================================ */
    /* Search */
    /* ============================================================ */

    const searchBox = q("#search-box");
    searchBox.value = "";
    searchBox.oninput = filterColumns;

    /* ============================================================ */
    /* Service Worker */
    /* ============================================================ */

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }

    /* ============================================================ */
    /* Load schedules */
    /* ============================================================ */

    setLoadingStatus("Caricamento in corso...");

    openPage("#loading");

    try {
        loadSchedules(true);
    } catch(err) {
        setLoadingStatus("Impossibile caricare la lista degli orari.");
        console.log(err);
    }
};