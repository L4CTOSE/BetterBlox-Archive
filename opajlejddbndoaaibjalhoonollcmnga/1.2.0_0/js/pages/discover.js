/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */

"use strict"

pages.discover = async () => {
    let authUser = await util.getAuthUser();
    if (authUser.userId == 0) return;
    let storage = chrome.storage.sync
    let trying = false
    let count2do = 0;
    let countQueued = 0;
    let arr = []

    
    function abbriviateRatings(a,b){return a>0||b>0?`${Math.floor(a/(a+b)*100)}%`:"--"}
    function abbriviatePlayers(num){return Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(num)}

    function getStats(id, count, value) {
        if (count2do > 0 && countQueued >= count2do || count2do > 0 && countQueued >= 99 || count2do > 0 && id == -1) {
            //alert("ight")
            if (value == false) {
                fetch("https://games.roblox.com/v1/games?universeIds=" + arr.toString())
                .then(response => response.json())
                .then(data => {
                    for (let entry in data['data']) {
                        document.getElementById(data['data'][entry]['id']).childNodes[2].childNodes[3].innerText = abbriviatePlayers(parseInt(data['data'][entry]['playing']))
                    }
                })
                .catch(error => {
                    console.log(error)
                    if (count <= 15) {
                        getStats(-1, count + 1, false)
                    }
                })
            }
            fetch("https://games.roblox.com/v1/games/votes?universeIds=" + arr.toString())
            .then(response => response.json())
            .then(data => {
                for (let entry in data['data']) {
                    document.getElementById(data['data'][entry]['id']).childNodes[2].childNodes[1].innerText = abbriviateRatings(data['data'][entry]['upVotes'], data['data'][entry]['downVotes'])
                }
            })
        } else {
            arr.push(id)
            countQueued += 1;
            if (countQueued >= count2do || countQueued >= 99) {
                getStats(-1, 0, false)
            }
        }
    }

    function create(arr, i) {
        if (trying == true) {
            setTimeout(() => {
                create(arr, i)
            }, 50);
        } else {
            trying = true
            fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${arr[i]}&size=512x512&format=Png&isCircular=false`)
            .then(response => response.json())
            .then(data => {
                let title = arr[i+2]
                let elem = document.createElement('div')
                elem.innerHTML = `<div class="grid-item-container game-card-container" data-testid="game-tile"><a class="game-card-link" href="https://www.roblox.com/games/${arr[i+1]}/BetterBlox" id="${arr[i]}"><span class="thumbnail-2d-container game-card-thumb-container"><img class="" src="${data['data'][0].imageUrl}" alt="${title}" title="${title}"></span><div class="game-card-name game-name-title" title="${title}">${title}</div><div class="game-card-info" data-testid="game-tile-stats"><span class="info-label icon-votes-gray"></span><span class="info-label vote-percentage-label">--</span><span class="info-label icon-playing-counts-gray"></span><span class="info-label playing-counts-label">?</span></div></a></div>`

                document.querySelector("#games-carousel-page > div > div").appendChild(elem)
                setTimeout(() => {
                    getStats(arr[i], 0, false)
                }, 50);
                setTimeout(() => {
                    trying = false
                }, 100);
                return true
            })
        }
    }

    function cont() {
        storage.get(authUser.userId.toString(), function(result) {
            if (result[authUser.userId.toString()] != null) {
                let arr = result[authUser.userId.toString()]
                for (let i = 0; i < arr.length; i+=3) {
                    if (arr[i] != null && document.getElementById(arr[i]) == null) {
                        count2do += 1;
                        setTimeout(() => {
                            create(arr, i)
                        }, i*2);
                    }
                }
            }
        })
    }
    if (location.href.includes(".roblox.com/discover#/sortName/v2/Continue")) {
        if (settings.getSetting("general", "improvedContinue")) {
            let a = setInterval(() => {
                if (document.querySelector('.grid-item-container') != null) {
                    clearInterval(a)
                    cont()
                }
            }, 50);
        }
    }
}