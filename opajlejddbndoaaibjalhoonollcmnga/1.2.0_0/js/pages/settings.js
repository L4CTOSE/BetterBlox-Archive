/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */

"use strict"

let updateText;

let categories = [
    {
        name: "Information",
        content: [
            {
                header: `Update Log`,
                preText: 'updateLog',
            },
            {
                header: `${chrome.i18n.getMessage("multipleExtensionsName")}`,
                text: `${chrome.i18n.getMessage("multipleExtensionsText")}`
            },
            {
                header: `${chrome.i18n.getMessage("donateName")}`,
                text: `${chrome.i18n.getMessage("donateText")}`
            },
            {
                header: `${chrome.i18n.getMessage("contactName")}`,
                text: `${chrome.i18n.getMessage("contactText")}`
            }
        ]
    },
    {
        name: `${chrome.i18n.getMessage("generalName")}`,
        content: [
            {
                header: `${chrome.i18n.getMessage("utilityName")}`,
                options: [
                    {
                        header: `${chrome.i18n.getMessage("appearOfflineName")}`,
                        text: `${chrome.i18n.getMessage("appearOfflineText")}`,

                        toggleable: true,
                        disabled: false,
                        setting: "general.appearOffline"
                    }
                ]
            },
            {
                header: "",
                options: [
                    {
                        header: `${chrome.i18n.getMessage("allTimeName")}`,
                        text: `${chrome.i18n.getMessage("allTimeText")}`,
    
                        toggleable: true,
                        disabled: false,
                        setting: "general.allTimeTransactions"
                    }
                ]
            },
            {
                header: "",
                options: [
                    {
                        header: `${chrome.i18n.getMessage("vanityName")}`,
                        text: `${chrome.i18n.getMessage("vanityText")}`,

                        toggleable: true,
                        disabled: false,
                        setting: "general.vanityUrls"
                    }
                ]
            },
            {
                header: "",
                options: [
                    {
                        header: `${chrome.i18n.getMessage("continueName")}`,
                        text: `${chrome.i18n.getMessage("continueText")}`,

                        toggleable: true,
                        disabled: false,
                        setting: "general.improvedContinue"
                    }
                ]
            },
            {
                header: "",
                options: [
                    {
                        header: `${chrome.i18n.getMessage("privateServersName")}`,
                        text: `${chrome.i18n.getMessage("privateServersText")}`,

                        toggleable: true,
                        disabled: false,
                        setting: "general.betterVIP"
                    }
                ]
            },
            {
                header: "",
                options: [
                    {
                        header: `${chrome.i18n.getMessage("lockedGroupsName")}`,
                        text: `${chrome.i18n.getMessage("lockedGroupsText")}`,

                        toggleable: true,
                        disabled: false,
                        setting: "general.lockedGroups"
                    }
                ]
            },
            {
                header: "",
                options: [
                    {
                        header: `${chrome.i18n.getMessage("privateInventoriesName")}`,
                        text: `${chrome.i18n.getMessage("privateInventoriesText")}`,

                        toggleable: true,
                        disabled: false,
                        setting: "general.privateInventories"
                    }
                ]
            }

            // {
            //     header: "",
            //     options: [
            //         {
            //             header: `${chrome.i18n.getMessage("liveStatsName")}`,
            //             text: `${chrome.i18n.getMessage("liveStatsText")}`,

            //             toggleable: true,
            //             disabled: false,
            //             setting: "general.liveStats"
            //         }
            //     ]
            // },
        ]
    }
]

pages.settings = async () => {
    let a = setInterval(() => {
        if (document.querySelector("#container-main > div.content > div") != null) {
            document.querySelector("#container-main > div.content > div").remove()
        }
    }, 0);
    var settingsCooldown = false;
    var selectedCategory = "";

    function getCategory(name) {
        for (let index in categories) {
            let category = categories[index];

            if (String(category.name).toLowerCase() == String(name).toLowerCase()) {
                return category;
            }
        }
        throw new Error(`Could not find category under the name ${name}`);
    }

    function getSetting(setting) {
        let settingCategories = setting.split(".");

        return [settings.getSetting(settingCategories[0], settingCategories[1]), settingCategories];
    }

    function loadCategory(name) {
        if (!settingsCooldown && name != selectedCategory) {
            settingsCooldown = true;

            let category = getCategory(name);

            let previousCategoryElement = $(`.category-${String(selectedCategory).toLowerCase()}`);
            let categoryElement = $(`.category-${String(category.name).toLowerCase()}`);

            previousCategoryElement.removeClass("active");
            categoryElement.addClass("active");

            $(".BetterBlox-settings-content").empty();

            category.content.forEach((categoryContent) => {
                console.log(categoryContent)
                let section = $(`<div class="section"></div>`).appendTo(".BetterBlox-settings-content");

                if (categoryContent.header) {
                    section.append(`<div class="container-header"><h3>${categoryContent.header}</h3></div>`);
                }

                if (categoryContent.preText) {
                    if (categoryContent.preText == 'updateLog') {
                        if (location.href.includes("BetterBlox")) {
                            fetch(`https://res.cloudinary.com/cupiditys/raw/upload/v${Math.floor(Math.random() * 999)}/updateLog4.txt`)
                            .then(response => response.text())
                            .then(data => {
                                section.append(`</div><div class="section-content"><pre class="text-description">${data}</pre>`);
                            })
                            .catch(error => {
                                section.append(`</div><div class="section-content"><pre class="text-description">## This extension was just released - Expect bugs, features not thoroughly tested.&#10;&#10;July 25 2023 - Version 1.1.0&#10;&#10;# Improved and optimized few features&#10;# Added View Private Inventories feature</pre>`);
                            })
                        }
                    } else {
                        section.append(`</div><div class="section-content"><pre class="text-description">${categoryContent.preText}</pre>`);
                    }
                }

                if (categoryContent.text) {
                    section.append(`</div><div class="section-content"><span class="text-description">${categoryContent.text}</span>`);
                }

                if (categoryContent.options) {
                    let sectionContent = $(`</div><div class="section-content"></div>`).appendTo(section);

                    categoryContent.options.forEach((option, index) => {
                        if (option.header && option.text) {
                            sectionContent.append(`<span class="text-lead">${option.header}</span>`);
                            sectionContent.append(`<div class="rbx-divider"></div>`);
                            sectionContent.append(`<span class="text-description">${option.text}</span>`);
                        } else {
                            if (options.length < index) {
                                sectionContent.append(`<div class="rbx-divider"></div>`);
                            }

                            if (option.header) {
                                sectionContent.append(`<span class="text-lead">${option.header}</span>`);
                            }

                            if (option.text) {
                                sectionContent.append(`<span class="text-description">${option.text}</span>`);
                            }
                        }

                        if (option.toggleable) {
                            let getSettingOptions = getSetting(option.setting);
                            let setting = getSettingOptions[0];

                            let toggle = $(`<button id="btn-toggle" class="btn-toggle ${option.disabled ? "disabled" : setting ? "on" : ""}"><span class="toggle-flip"></span><span id="toggle-on" class="toggle-on"></span><span id="toggle-off" class="toggle-off"></span></button>`).prependTo(sectionContent);

                            let toggleCoolDown = false;

                            toggle.click(() => {
                                let getSettingOptions = getSetting(option.setting);
                                let setting = getSettingOptions[0];
                                let categories = getSettingOptions[1];

                                if (!toggleCoolDown) {
                                    toggleCoolDown = true;

                                    if (!option.disabled) {
                                        if (setting) {
                                            settings.setSetting(categories[0], categories[1], false);
                                            toggle.removeClass("on");
                                        } else {
                                            settings.setSetting(categories[0], categories[1], true);
                                            toggle.addClass("on");
                                        }
                                    }

                                    toggleCoolDown = false;
                                }
                            })
                        }
                    })
                }

                if (categoryContent.sectionHtml) {
                    section.append(categoryContent.sectionHtml);
                }
            })

            selectedCategory = name;
            settingsCooldown = false;
        }
    }

    async function lol() {
        $.watch("head", () => {
            injectCSS("css/pages/settings.css");
        })

        $.watch(".content", (content) => {
            content.empty();

            $("title")[0].text = "Settings - BetterBlox";

            content.append(`
            <div id="BetterBlox-settings">
                <h1>BetterBlox Beta Settings</h1>
                
                <div class="menu-vertical-container">
                    <ul id="vertical-menu" class="menu-vertical submenus">

                    </ul>
                </div>

            <div class="BetterBlox-settings-content">

            </div>

            </div>`);
            clearInterval(a)
            categories.forEach((category) => {
                $("#vertical-menu.menu-vertical.submenus").append(`
                <li class="menu-option category-${String(category.name).toLowerCase()}">
                    <a class="menu-option-content">
                        <span class="menu-text">${category.name}</span>
                    </a>
                </li>`);
                
                $(`.category-${String(category.name).toLowerCase()}`).click(()=> {
                    loadCategory(category.name);
                });
            })
            loadCategory("Information");
        })
    }
    await lol()
    setInterval(() => {
        if (document.getElementsByClassName("default-error-page").length > 0) {
            document.getElementsByClassName("default-error-page")[0].remove()
        }
    }, 100);
}