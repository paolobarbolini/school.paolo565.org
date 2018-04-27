"use strict";

const corsProxies = [
    "https://cors-anywhere.herokuapp.com/",
    "https://crossorigin.me/",
];

var currentlyOpenPage = "#unsupported-device";

window.q = function(query) {
    return document.querySelector(query);
}

window.qe = function(query, func) {
    const elements = document.querySelectorAll(query);
    return elements.forEach(func);
}

window.qee = function(element, query, func) {
    const elements = element.querySelectorAll(query);
    return elements.forEach(func);
}

window.joinUrls = function(baseUrl, url) {
    return new URL(url, baseUrl).href;
}

window.urlPath = function(url) {
    return new URL(url).pathname;
}

window.parseHtml = function(html) {
    const newHTMLDocument = document.implementation.createHTMLDocument("preview");
    const element = newHTMLDocument.createElement("div");
    element.innerHTML = html;

    const scripts = element.getElementsByTagName("script");
    let i = scripts.length;
    while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }

    return element;
}

window.escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

window.fetchCors = async function(url) {
    let nextCorsProxy = 0;
    let fails = 0;

    while(true) {
        try {
            const response = await fetch(corsProxies[nextCorsProxy] + url);
            if(!response.ok) {
                nextCorsProxy--;
                throw new Error("Invalid response: " + response.status);
            }

            return response;
        } catch(err) {
            console.log(err);
            fails++;
            nextCorsProxy++;

            if(fails > 2 || nextCorsProxy >= corsProxies.length) {
                throw err;
            }
        };
    }
}

window.openPage = function(query) {
    q(query).classList.remove("hidden");
    q(currentlyOpenPage).classList.add("hidden");
    currentlyOpenPage = query;
}