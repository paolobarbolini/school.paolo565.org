const schoolUrl = "http://www.istitutogobetti.it";

var getArticlePageLink = async function(allowCache = true) {
    if(allowCache) {
        var articlePageLink = localStorage.getItem("articlepage-url");
        if(articlePageLink) {
            return articlePageLink;
        }
    }

    // Request the home page
    const homePageResponse = await fetchCors(schoolUrl);
    const homePageText = await homePageResponse.text();
    const homeBody = parseHtml(homePageText);

    await qee(homeBody, "#jsn-pleft a", homePageLink => {
        const linkText = homePageLink.innerHTML;

        if(linkText.indexOf("Orario") == -1 || linkText.indexOf("lezioni") == -1) {
            return;
        }

        partialArticlePageLink = homePageLink.getAttribute("href");
    });

    if(!partialArticlePageLink) {
        return;
    }

    // Request the schedule article
    articlePageLink = joinUrls(schoolUrl, partialArticlePageLink);
    localStorage.setItem("articlepage-url", articlePageLink);
    return articlePageLink;
}

var getSchedulePageLink = async function(articlePageLink, allowCache = true) {
    if(allowCache) {
        var schedulePageLink = localStorage.getItem("schedulepage-url");
        if(schedulePageLink) {
            return schedulePageLink;
        }
    }

    const articlePageResponse = await fetchCors(articlePageLink);
    const articlePageText = await articlePageResponse.text();
    const articlePageBody = parseHtml(articlePageText);

    await qee(articlePageBody, "#jsn-mainbody a", articleLink => {
        const articleHref = articleLink.getAttribute("href");
        const articleAbsUrl = joinUrls(articlePageLink, articleHref);
        const cleanUrl = urlPath(articleAbsUrl).toLowerCase();

        if(!cleanUrl.startsWith("/web_orario") && !cleanUrl.startsWith("/weborario")) {
            return;
        }

        schedulePageLink = articleAbsUrl;
    });

    if(!schedulePageLink) {
        throw new Error("Failed to get the url pointing to the orario facile page");
    }

    localStorage.setItem("schedulepage-url", schedulePageLink);
    return schedulePageLink;
}

var getScheduleItems = async function(schedulePageLink, allowCache = true) {
    // Try loading the schedule list from the cache
    if(allowCache) {
        const cachedScheduleItems = localStorage.getItem("schedule-items");
        if(cachedScheduleItems) {
            const scheduleItems = JSON.parse(cachedScheduleItems);
            return scheduleItems;
        }
    }

    // Request the schedule list
    const schedulePageResponse = await fetchCors(schedulePageLink);
    const schedulePageText = await schedulePageResponse.text();
    const schedulePageBody = parseHtml(schedulePageText);

    const scheduleItems = [];

    await qee(schedulePageBody, "a", (schedulePage, index, array) => {
        const schedulePageHref = schedulePage.getAttribute("href");  
        const schedulePageAbsUrl = joinUrls(schedulePageLink, schedulePageHref);

        if(schedulePageAbsUrl.indexOf("Classi/") != -1) {
            list = "#classes";
            type = "classi";
        } else if(schedulePageAbsUrl.indexOf("Docenti/") != -1) {
            list = "#teachers";
            type = "docenti";
        } else if(schedulePageAbsUrl.indexOf("Aule/") != -1) {
            list = "#classrooms";
            type = "aule";
        } else {
            return;
        }

        scheduleItems.push({
            'list': list,
            'type': type,
            'name': schedulePage.innerText,
            'url': schedulePageAbsUrl,
        });
    });

    localStorage.setItem("schedule-items", JSON.stringify(scheduleItems));
    return scheduleItems;
}

var generateScheduleItem = function(item) {
    const liElement = document.createElement("li");
    liElement.classList.add("schedule-list-item");
    liElement.dataset.originalText = item["name"];
    liElement.dataset.url = item["url"];

    const aElement = document.createElement("a");
    aElement.href = "#/" + item["type"] + "/" + encodeURIComponent(item["name"]);
    aElement.innerText = liElement.dataset.originalText;

    liElement.dataset.type = item["type"];
    liElement.appendChild(aElement);
    q(item["list"]).appendChild(liElement);
}

var partiallyGenerateScheduleItem = function(html) {
    const body = parseHtml(html);
    body.querySelector("style").innerHTML = scheduleCss;

    var div = document.createElement("div");
    div.appendChild(body.cloneNode(true));

    const iframe = document.querySelector("#embedded-schedule");
    iframe.contentWindow.document.open("text/html", "replace");
    iframe.contentWindow.document.write(div.innerHTML);
    iframe.contentWindow.document.close();
}

var displayScheduleItem = async function(name, type) {
    const selectedScheduleInfo = q("li[data-original-text=\"" + name + "\"][data-type=\"" + type + "\"]");
    if(selectedScheduleInfo == null) {
        window.location.hash = "/";
        Pages.push("#school-schedules");
        return;
    }

    const iframe = document.querySelector("#embedded-schedule");
    iframe.contentWindow.document.open("text/html", "replace");
    iframe.contentWindow.document.write("");
    iframe.contentWindow.document.close();

    Pages.push("#school-schedule");

    // Load the table from the cache
    var text = localStorage.getItem("scheduleitem-" + name + "-" + type);
    if(text) {
        partiallyGenerateScheduleItem(text);
    }

    // Load from the network and update the existing table if it's already there.
    const response = await fetchCors(selectedScheduleInfo.dataset.url);
    text = await response.text();
    localStorage.setItem("scheduleitem-" + name + "-" + type, text);
    partiallyGenerateScheduleItem(text);
}