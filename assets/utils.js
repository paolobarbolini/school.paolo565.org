window.q = function(query) {
    return document.querySelector(query);
}

window.qe = function(query, func) {
    var elements = document.querySelectorAll(query);
    elements.forEach(func);
}

window.qee = function(element, query, func) {
    var elements = element.querySelectorAll(query);
    elements.forEach(func);
}

window.joinUrl = function(baseUrl, url) {
    return new URL(url, baseUrl).href;
}

window.urlPath = function(url) {
    return new URL(url).pathname;
}