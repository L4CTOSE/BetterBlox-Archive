"use strict"

const pageInfo = {
    assets: {
        hasIds: true,
        paths: ["catalog", "bundles", "library", "game-pass", "badges"]
    },

    avatar: {
        paths: ["my"],
        subPaths: ["avatar"]
    },

    discover: {
        paths: ["discover"]
    },

    games: {
        hasIds: true,
        paths: ["games"]
    },

    home: {
        paths: ["home"]
    },

    profile: {
        hasIds: true,
        paths: ["users"],
        css: ["css/pages/profile.css"]
    },

    inventory: {
        hasIds: true,
        paths: ["users"]
    },

    settings: {
        paths: ["BetterBlox"],
        subPaths: ["settings"]
    },

    vanity: {
        paths: ["users"]
    },

    transactions: {
        paths: ["transactions"]
    },

    develop: {
        paths: ["develop"],
        css: ["css/pages/develop.css"]
    },
    
    groups: {
        hasIds: true,
        paths: ["groups"],
    }
}

const pages = {};

const currentUrl = location.href;

const currentUrlPaths = currentUrl.split("/");

const urlDetails = {
    pathDetails: currentUrlPaths[3],
    uniqueId: currentUrlPaths[4],
}

const currentPageInfo = {
    path: urlDetails.pathDetails.split("?")[0].split("#")[0],
    args: {}
}

async function injectPage(page, id) {
    pages[page](id);
}

function checkPath(page) {
    if (page) {
        for (let path in page.paths) {
            if (page.paths[path] == currentPageInfo.path) {
                if (!page.subPaths) {
                    return true;
                } else {
                    for (let subPath in page.subPaths) {
                        if (page.subPaths[subPath] == urlDetails.uniqueId) {
                            urlDetails.uniqueId = currentUrlPaths[5];
                            return true;
                        }
                    }
                }
            }
        }
    }
}

function injectPages() {
    for (let name in pages) {
        let page = pageInfo[name];

        if (checkPath(page)) {
            if (page.hasIds && Number(urlDetails.uniqueId)) {
                injectPage(name, Number(urlDetails.uniqueId));
            } else if (!page.hasIds && !Number(urlDetails.uniqueId)) {
                injectPage(name);
            }
        }
    }
}

function injectCSSPages() {
    for (let name in pageInfo) {
        let page = pageInfo[name];

        if (page.hasOwnProperty("css") && checkPath(page)) {
            for (let path in page.css) {
                injectCSS(page.css[path]);
            }
        }
    }
}

function injectCSS(css) {
    $("head").append(`<link rel="stylesheet" href="${chrome.runtime.getURL(css)}">`);
}

let generateArgs = () => {
    if (typeof(currentUrlPaths[currentUrlPaths.length - 1]) == "string") {
        let rawArgs = currentUrlPaths[currentUrlPaths.length - 1].split("?");
        
        if (rawArgs[1]) {rawArgs = rawArgs[1].split("&")};

        for (let index in rawArgs) {
            let args = rawArgs[index].split("=");
            
            currentPageInfo.args[args[0]] = (args[1] || args[0]);
        }
    }
}

generateArgs();