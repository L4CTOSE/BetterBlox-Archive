"use strict"

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let determinEndDate = (date) => {
    if (date > 3 && date < 21) {
        return "th";
    }

    switch (date % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

const util = {
    getUrl: (url, needsAuth) => {
        return new Promise (async (resolve, reject) => {
            let data = await fetch(url, {
                method: "GET",
                credentials: needsAuth ? "include" : "omit",
            });
            resolve(data.json());
        })
    },
    postUrl: (url, body, needsAuth) => {
        return new Promise (async (resolve, reject) => {
            let data = await fetch(url, {
                method: "POST",
                credentials: needsAuth ? "include" : "omit",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": await util.getXSRF(),
                }
            });
            //check if request failed with the "message" being Token Validation Failed
            if (data.status == 403) {
                //if it did then try again but with the fast method disabled
                data = await fetch(url, {
                    method: "POST",
                    credentials: needsAuth ? "include" : "omit",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": await util.getXSRF(true),
                    }
                });
                resolve(data.json());
            } else {
                resolve(data.json());
            }
        })
    },
    getAuthUser: () => {
        return new Promise (async (resolve, reject) => {
            let auth = await util.getUrl(`https://users.roblox.com/v1/users/authenticated`, true);
            if (auth) {
                resolve({
                    username: auth.name,
                    displayName: auth.displayName,
                    userId: auth.id
                })
            } else {
                resolve({
                    username: "",
                    displayName: "",
                    userId: 0
                })
            }
            reject({
                message: "Failed to get authenticated user."
            })
        })
    },
    getXSRF: (disablefast) => {
        return new Promise (async (resolve, reject) => {
            //find the <meta name="csrf-token" data-token="..."> tag
            let token = document.querySelector("meta[name='csrf-token']")
            if (token != null) token = token.getAttribute("data-token");
            //if the token is found then just resolve it
            if (token != null && !disablefast) {
                resolve(token);
            } else {  
                fetch("https://auth.roblox.com/v2/logout", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                    },
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                })
                .then(response => {
                    resolve(response.headers.get("x-csrf-token"));
                })
                .catch(error => {
                    reject("unknown");
                })
            }
        })
    },
    timeFormat: (date) => {
        date = new Date(date);

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let zone = hours >= 12 ? 'PM' : 'AM';
    
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes: minutes;

        if (settings.getSetting("general", "simpleTimeFormat")) {
            return `${months[date.getMonth()]} ${date.getDate()}${determinEndDate(date.getDate())}, ${date.getFullYear()} @ ${hours}:${minutes} ${zone}`;
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} @ ${hours}:${minutes} ${zone}`;
        }
    },
    abbreviateCost: (num) => {
        if (num < 1000) {
          return num.toString();
        }
        const roundedNum = Math.floor(num / 1000) * 1000;
        return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(roundedNum) + "+";
    }
}

Object.assign($, {
    watch(selector, callback) {
        if (typeof callback !== "function") {
            throw Error("Watch requires a function.");
        }
    
        if ($(selector).length >= 1) {
            callback($(selector));
        } else {
            setTimeout(() => {
                $.watch(selector, callback);
            })
        }
    }
})

if (currentPageInfo.path != "user-sponsorship" && currentPageInfo.path != "userads") {
    let init = () => {
        if (settings.loadedSettings instanceof Object) {
            injectPages();
            injectPage("universal");
        
            $.watch("head", () => {
                injectCSS("css/universal.css");
                injectCSSPages();
            })
        } else {
            setTimeout(init, 0);
        }
    }

    init();
}