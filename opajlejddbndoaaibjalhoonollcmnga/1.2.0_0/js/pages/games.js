/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */

"use strict"

pages.games = async (gameId) => {

    let authUser = await util.getAuthUser();
    let storage = chrome.storage.sync
    let vips = await util.getUrl(`https://games.roblox.com/v1/games/${gameId}/servers/VIP?cursor=`, true)

    let xcsrf = await util.getXSRF();

    async function getContinue() {
        fetch("https://apis.roblox.com/discovery-api/omni-recommendation", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json;charset=UTF-8",
                "x-csrf-token": xcsrf
            },
            "referrer": "https://www.roblox.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "{\"pageType\":\"Home\",\"sessionId\":\"lol\"}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        })
        .then(response => response.json())
        .then(data => {
            let arr = []
            let recommendations = data['sorts'][0]['recommendationList']
            for (let entry in recommendations) {
                arr.push(recommendations[entry]['contentId'])
            }
            fetch("https://apis.roblox.com/discovery-api/omni-recommendation-metadata", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json;charset=UTF-8",
                    "x-csrf-token": xcsrf
                },
                "referrer": "https://www.roblox.com/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `{\"contents\":${JSON.stringify(data['sorts'][0]['recommendationList'])},\"sessionId\":\"lol\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })
            .then(response => response.json())
            .then(data2 => {
                //javascript is the best language (im lying) (why is it in the wrong order)
                let arr2 = []
                let wrongorder = data2['contentMetadata']['Game']
                for (let entry3 in arr) {
                    for (let entry2 in wrongorder) {
                        if (arr[entry3] == wrongorder[entry2]['universeId']) {
                            arr2.push(arr[entry3])
                            arr2.push(wrongorder[entry2]['rootPlaceId'])
                            arr2.push(wrongorder[entry2]['name'])
                        }
                    }
                }
                //console.log(arr2)
                let arr3 = []
                storage.get(authUser.userId.toString(), function(result) {
                    if (result[authUser.userId.toString()] == undefined) {
                        console.log("Performing first setup")
                        chrome.storage.sync.set({[authUser.userId.toString()]: arr2})
                    } else {
                        arr3 = result[authUser.userId.toString()]
                        for (let i = 0; i < arr2.length; i+=3) {
                            if (!result[authUser.userId.toString()].includes(arr2[i])) {
                                console.log("[debug]: new game added")
                                arr3.unshift(arr2[i+2])
                                arr3.unshift(arr2[i+1])
                                arr3.unshift(arr2[i])
                            }
                        }
                        //console.log("[debug]: new array", arr3)
                        chrome.storage.sync.set({[authUser.userId.toString()]: arr3})
                    }
                })
            })
        })
    }
    async function create() {
        let blockedarr = [];
        console.log(vips.data)
        for (let i = 0; i < vips.data.length; i++) { //this isnt the best way to do it but trust me i couldnt care less
            let vipId = vips.data[i].vipServerId
            let element = document.createElement('span')
            let element2 = document.getElementsByClassName("section-header")[i]
            element.innerHTML = `<span id="${vipId}" cool="BetterBlox${i}" class="icon-turn-off"></span>`
            element2.appendChild(element)
            // its for the aesthetic bro
            element2.childNodes[0].innerText = element2.childNodes[0].innerText + " "
            $.watch(`[cool="BetterBlox${i}"]`, (addition) => {
                addition.click(() => {
                    storage.get(['blocked'], function(result) {
                        if (result['blocked'] != undefined) {
                            blockedarr = result['blocked']
                        }
                    })
                    let background = document.createElement("div")
                    background.innerHTML = `<div id="simplemodal-overlay" class="simplemodal-overlay" style="background-color: rgb(0, 0, 0); opacity: 0.8; height: ${window.innerHeight}px; width: ${window.innerWidth}px; position: fixed; left: 0px; top: 0px; z-index: 1041;"></div>`
                    document.getElementById('rbx-body').appendChild(background)
                    let main = document.createElement('div')
                    main.innerHTML = `<div id="simplemodal-container" class="simplemodal-container" style="position: fixed; z-index: 1042; height: 171px; width: 400px; left: ${window.innerWidth/2.5}px; top: ${window.innerHeight/2.5}px;"><a class="modalCloseImg simplemodal-close" title="Close"></a><div tabindex="-1" class="simplemodal-wrap" style="height: 100%; outline: 0px; width: 100%; overflow: visible;"><div id="modal-confirmation" class="modal-confirmation noImage simplemodal-data" data-modal-type="confirmation" style="display: block;">
                        <div id="modal-dialog" class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" style="display: none;">
                                        <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span>
                                    </button>
                                    <h5 class="modal-title">Remove Private Server</h5>
                                </div>
                    
                                <div class="modal-body">
                                    <div class="modal-top-body">
                                        <div class="modal-message">Are you sure you want to remove the "${element2.childNodes[0].innerText.replaceAll("<script", "").replaceAll("<img", "").slice(0,-1)}" private server by "${document.getElementsByClassName("text-name text-overflow")[0].innerText}"?</div>
                                        <div class="modal-checkbox checkbox" style="display: none;">
                                            <input id="modal-checkbox-input" type="checkbox">
                                            <label for="modal-checkbox-input"></label>
                                        </div>
                                    </div>
                                    <div class="modal-btns">
                                        <a cool="ConfirmA" id="confirm-btn" class="btn-secondary-md">Yes</a>
                                        <a cool="ConfirmB" id="decline-btn" class="btn-control-md">No</a>
                                    </div>
                                </div>
                                <div class="modal-footer text-footer" style="display: none;"></div>
                            </div>
                        </div>
                    </div></div></div>`
                    document.getElementById('rbx-body').appendChild(main)
                    $.watch('[cool="ConfirmA"]', (bruh) => {
                        bruh.click(() => {
                            console.log(vipId + " removed")
                            blockedarr.push(vipId)
                            chrome.storage.sync.set({'blocked': blockedarr})
                            setTimeout(() => { //felt better with a timeout for some reason bruh, just feels more like roblox
                                main.remove()
                                background.remove()
                                setTimeout(() => {
                                    document.getElementsByClassName("rbx-private-game-server-item")[i].childNodes[0].remove()
                                    document.getElementsByClassName("alert alert-success")[0].innerText = "Removed Private Server"
                                    document.getElementsByClassName("alert alert-success")[0].className = "alert alert-success on"
                                    setTimeout(() => {
                                        document.getElementsByClassName("alert alert-success")[0].className = "alert alert-success"
                                    }, 3000);
                                }, 200);
                            }, 100);
                        })
                    })
                    $.watch('[cool="ConfirmB"]', (ok) => {
                        ok.click(() => {
                            setTimeout(() => {
                                main.remove()
                                background.remove()
                            }, 100);
                        })
                    })
                })
            })
        }
    }
    $.watch("#game-details-play-button-container", (playGame) => {
        playGame.click(() => {
            if (authUser.userId != 0 && xcsrf != "unknown") {
                getContinue()
            }
        })
    })
    if (!settings.getSetting("general", "betterVIP")) return;
    let blockedarr = [];
    storage.get(['blocked'], function(result) {
        if (result['blocked'] != undefined) {
            blockedarr = result['blocked']
        }
    })
    let intv = setInterval(() => {
        if(document.getElementsByClassName('section-header').length > 0) {
            create()
            clearInterval(intv)
        }
    }, 25);
    let intv2 = setInterval(() => {
        if (blockedarr.length > 0) {
            for(let entry in blockedarr) {
                if(document.getElementById(blockedarr[entry]) != null) {
                    document.getElementById(blockedarr[entry]).parentNode.parentNode.parentNode.parentNode.remove()
                    blockedarr.splice(entry, 1)
                }
            }
        } else {
            clearInterval(intv2)
        }
    }, 50);
}