/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */

"use strict"

async function wait(dur) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, dur);
    })
}

async function getUrlWithAntiFail(url) {
    return new Promise (async (resolve, reject) => {
        // for some reason, sending with authentication basicially completely removes the ratelimits
        let data = await util.getUrl(url, true)
        if (data.errors) {
            //if it fails, we retry with roproxy, (obviously no authentication though)
            data = await util.getUrl(url.replace("roblox", "roproxy"), false)
            if (data.errors || data == "The custom error module does not recognize this error.") {
                // try running function again after 3 seconds
                await wait(3000)
                data = await getUrlWithAntiFail(url)
            }
        }
        resolve(data)
    })
}

const AssetNameToInventoryName = {
    "Hat": "accessories/head",
    "FaceAccessory": "accessories/face",
    "NeckAccessory": "accessories/neck",
    "ShoulderAccessory": "accessories/shoulder",
    "FrontAccessory": "accessories/front",
    "BackAccessory": "accessories/back",
    "WaistAccessory": "accessories/waist",
    "Gear": "accessories/gear",

    "RunAnimation": "avatar_animations/run",
    "WalkAnimation": "avatar_animations/walk",
    "FallAnimation": "avatar_animations/fall",
    "JumpAnimation": "avatar_animations/jump",
    "IdleAnimation": "avatar_animations/idle",
    "SwimAnimation": "avatar_animations/swim",
    "ClimbAnimation": "avatar_animations/climb",
    "EmoteAnimation": "emote_animations",

    "Face": "faces",
    "HairAccessory": "hair_accessories",

    "TShirt": "classic_clothing/classic_t_shirts",
    "Shirt": "classic_clothing/classic_shirts",
    "Pants": "classic_clothing/classic_pants",

    "Head": "classic_heads",
    "DynamicHead": "heads",

    "TShirtAccessory": "tops/t_shirts",
    "ShirtAccessory": "tops/shirts",
    "PantsAccessory": "bottoms/pants",
    "JacketAccessory": "tops/jackets",
    "SweaterAccessory": "tops/sweaters",
    "ShortsAccessory": "bottoms/shorts",
    "LeftShoeAccessory": "shoes/left_shoe",
    "RightShoeAccessory": "shoes/right_shoe",
    "DressSkirtAccessory": "bottoms/skirts",

    "Bundle": "bundles",

    "EyebrowAccessory": "misc",
    "EyelashAccessory": "misc",
    "MoodAnimation": "misc",
    "RightLeg": "misc",
    "LeftLeg": "misc",
    "RightArm": "misc",
    "LeftArm": "misc",
    "Torso": "misc",
}

const InventoryNameToAssetType = {
    "classic_clothing/classic_t_shirts": "2",
    "classic_clothing/classic_shirts": "11",
    "classic_clothing/classic_pants": "12",
    "hair_accessories": "41",
    "accessories/head": "8",
    "accessories/face": "42",
    "accessories/neck": "43",
    "accessories/shoulder": "44",
    "accessories/front": "45",
    "accessories/back": "46",
    "accessories/waist": "47",
    "accessories/gear": "19",
    "faces": "18",
    "classic_heads": "17",
    "game_passes": "34",
    "heads": "4",
    "bundles": "1",
    "animations": "24",
    "audio": "3",
    "decals": "13",
    "meshparts": "40",
    "models": "10",
    "plugins": "38",
    "emote_animations": "61",
    "tops/t_shirts": "64",
    "tops/shirts": "65",
    "tops/sweaters": "68",
    "tops/jackets": "67",
    "bottoms/pants": "66",
    "bottoms/shorts": "69",
    "bottoms/skirts": "72",
    "shoes/left_shoe": "70",
    "shoes/right_shoe": "71",
    "avatar_animations/run": "53",
    "avatar_animations/walk": "55",
    "avatar_animations/fall": "50",
    "avatar_animations/jump": "52",
    "avatar_animations/idle": "51",
    "avatar_animations/swim": "54",
    "avatar_animations/climb": "48",
}

const AnimationNameToIds = {
    "Rthro Animation Package": 356,
    "Oldschool Animation Pack": 667,
    "Toy Animation Pack": 43,
    "Stylish Animation Pack": 83,
    "Robot Animation Pack": 82,
    "Zombie Animation Pack": 80,
    "Bubbly Animation Package": 39,
    "Cartoony Animation Package": 56,
    "Mage Animation Package": 63,
    "Ninja Animation Package": 75,
    "Superhero Animation Pack": 81,
    "Vampire Animation Pack": 33,
    "Elder Animation Package": 48,
    "Levitation Animation Pack": 79,
    "Werewolf Animation Pack": 32,
    "Astronaut Animation Pack": 34,
    "Knight Animation Package": 68,
    "Pirate Animation Package": 55
}

let allLimitedIds = []

let currentPage = 1;
let currentMaxPage = 1

async function generateAssetPage(inventory, currentCategory, currentSubCategory, currentPage) {

    //create new assetItems
    let ul = document.createElement("ul")
    ul.id = "assetsItems"
    ul.className = "hlist item-cards item-cards-embed ng-scope"

    //we need to copy .pager-holder from the original page and delete it so it shows up below the items
    let pagerHolder = document.querySelector(".pager-holder").cloneNode(true)
    document.querySelector(".pager-holder").remove()
    document.querySelector(".current-items").appendChild(ul)
    document.querySelector(".current-items").appendChild(pagerHolder)
    // listen for click on .btn-generic-right-sm and .btn-generic-left-sm
    $(".btn-generic-right-sm").click(async () => {
        //check if its not disabled
        if (!$(".btn-generic-right-sm").hasClass("disabled")) {
            currentPage++;
            document.querySelector("#inventory-container > inventory > div > assets-explorer > div > div > div.tab-content.rbx-tab-content > div > div.pager-holder > ul > li:nth-child(2) > span").innerText = `Page ${currentPage}`
            await refreshPage(inventory, currentCategory, currentSubCategory, currentPage);
        }
    });
    $(".btn-generic-left-sm").click(async () => {
        //check if its not disabled
        if (!$(".btn-generic-left-sm").hasClass("disabled")) {
            currentPage--;
            document.querySelector("#inventory-container > inventory > div > assets-explorer > div > div > div.tab-content.rbx-tab-content > div > div.pager-holder > ul > li:nth-child(2) > span").innerText = `Page ${currentPage}`
            await refreshPage(inventory, currentCategory, currentSubCategory, currentPage);
        }
    });
    //check if the current category has more than 30 items
    // need to account for subcategories and pages. If the current page is 1, we need to get the first 30 items, if it's 2, we need to get the next 30 items, etc
    if (Array.isArray(inventory[currentCategory])) {
        currentMaxPage = Math.ceil(inventory[currentCategory].length / 30)
    } else {
        currentMaxPage = Math.ceil(inventory[currentCategory][currentSubCategory].length / 30)
    }
    if (currentPage > 1) {
        document.querySelector(".btn-generic-left-sm").disabled = false
    } else {
        document.querySelector(".btn-generic-left-sm").disabled = true
    }
    if (currentPage < currentMaxPage) {
        document.querySelector(".btn-generic-right-sm").disabled = false
    } else {
        document.querySelector(".btn-generic-right-sm").disabled = true
    }
    //copy the inventory so we can modify it without modifying the original inventory
    let inventoryCopy = JSON.parse(JSON.stringify(inventory))
    if (currentMaxPage > 1) {
        //only get the items for the current page (1-30 for page 1, 31-60 for page 2, etc).
        if (Array.isArray(inventory[currentCategory])) {
            inventoryCopy[currentCategory] = inventory[currentCategory].slice((currentPage - 1) * 30, currentPage * 30)
        } else {
            inventoryCopy[currentCategory][currentSubCategory] = inventory[currentCategory][currentSubCategory].slice((currentPage - 1) * 30, currentPage * 30)
        }
    }

    let assetIds = {items:[]}
    if (Array.isArray(inventoryCopy[currentCategory])) {
        for (let asset of inventoryCopy[currentCategory]) {
            if (currentCategory != "bundles") {
                assetIds.items.push({
                    id: asset,
                    itemType: "Asset"
                })
            } else {
                assetIds.items.push({
                    id: asset,
                    itemType: 2
                })
            }
        }
    } else {
        for (let asset of inventoryCopy[currentCategory][currentSubCategory]) {
            assetIds.items.push({
                id: asset,
                itemType: "Asset"
            })
        }
    }
    for (let asset of assetIds.items) {
        let li = document.createElement("li")
        li.className = "list-item item-card ng-scope"
        li.innerHTML = `
        <div class="item-card-container" list-target-id=${asset.id}>
            <a ng-href="" class="item-card-link">
            <div class="item-card-thumb-container">
                <thumbnail-2d class="item-card-thumb ng-isolate-scope" thumbnail-type="item.itemV2.thumbnail.type" thumbnail-target-id="item.itemV2.id">
                    <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container icon-broken" thumbnail-type="" thumbnail-target-id=""></span>
                </thumbnail-2d>
                <span ng-show="item.itemRestrictionIcon" class="restriction-icon ng-hide" ng-class="item.itemRestrictionIcon"></span>
                <span ng-show="item.AssetRestrictionIcon" ng-class="'icon-' + item.AssetRestrictionIcon.CssTag + '-label'" class="ng-hide icon--label"></span>
            </div>
            <div class="item-card-name" title="">
                <span ng-bind="item.Item.Name" class="ng-binding"></span>
            </div>
            </a>
            <ul class="item-card-caption-progressive-loading shimmer-lines ng-scope" ng-if="item.itemDetailsLoading">
                <li class="placeholder shimmer-line"></li>
                <li class="placeholder shimmer-line"></li>
                <li class="placeholder shimmer-line"></li>
            </ul>
            <span class="checkbox btr-it-checkbox ng-hide" ng-show="$ctrl.staticData.isOwnPage &amp;&amp; ($ctrl.currentData.AssetTypeId === 10 || $ctrl.currentData.AssetTypeId === 13 || $ctrl.currentData.AssetTypeId === 40 || $ctrl.currentData.AssetTypeId === 3 || $ctrl.currentData.AssetTypeId === 24 || $ctrl.currentData.AssetTypeId === 2 || $ctrl.currentData.AssetTypeId === 11 || $ctrl.currentData.AssetTypeId === 12 || $ctrl.currentData.AssetTypeId === 21)">
                <input type="checkbox" id="btr-it-box0" class="btr-it-box" data-index="0">
                <label for="btr-it-box0" style="position:absolute;left:6px;top:6px;width:auto;"></label>
            </span>
        </div>`
        document.querySelector("#assetsItems").appendChild(li)
    }

    // batch get asset info by POSTing to https://catalog.roblox.com/v1/catalog/items/details with the assetIds and assetTypes
    let assetInfo = await util.postUrl("https://catalog.roblox.com/v1/catalog/items/details", assetIds, true)
    if (assetInfo.errors) return;
    assetInfo = assetInfo.data
    let batchGetThumbnails = []
    for (let asset of assetInfo) {
        let li = document.querySelector(`[list-target-id="${asset.id}"]`)
        li.innerHTML = `<div class="item-card-container"> <a ng-href='${currentCategory == "bundles" ? "https://www.roblox.com/bundles/"+asset.id+"/betterblox" : "https://www.roblox.com/catalog/"+asset.id+"/betterblox"}' class="item-card-link" href='${currentCategory == "bundles" ? "https://www.roblox.com/bundles/"+asset.id+"/betterblox" : "https://www.roblox.com/catalog/"+asset.id+"/betterblox"}'> <div class="item-card-thumb-container">  <thumbnail-2d class="item-card-thumb ng-isolate-scope" thumbnail-type="item.itemV2.thumbnail.type" thumbnail-target-id="item.itemV2.id"><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container shimmer" thumbnail-type="Asset" thumbnail-target-id="${asset.id}"> </span> </thumbnail-2d> <span ng-show="item.itemRestrictionIcon" class="restriction-icon ng-hide" ng-class="item.itemRestrictionIcon"></span> <span ng-show="item.AssetRestrictionIcon" ng-class="'icon-' + item.AssetRestrictionIcon.CssTag + '-label'" class="icon--label"> </span> </div> <div class="item-card-name" title="${asset.name}"> <span ng-bind="item.Item.Name" class="ng-binding">${asset.name}</span> </div> </a>  <div ng-if="$ctrl.showCreatorName &amp;&amp; !item.itemDetailsLoading" class="text-overflow item-card-label ng-scope"> <span ng-bind="'Label.OwnershipPreposition' | translate" class="ng-binding">By</span> <a class="creator-name text-overflow text-link ng-binding" ng-href='${asset.creatorType == "User" ? "https://www.roblox.com/users/"+asset.creatorTargetId+"/profile" : "https://www.roblox.com/groups/"+asset.creatorTargetId}' ng-hide="$ctrl.currentData.isPrivateServerCategoryType" ng-bind="item.Creator.nameForDisplay" href='${asset.creatorType == "User" ? "https://www.roblox.com/users/"+asset.creatorTargetId+"/profile" : "https://www.roblox.com/groups/"+asset.creatorTargetId}'>${asset.creatorName}</a> <a class="creator-name text-overflow text-link ng-binding ng-hide" ng-href="" ng-show="$ctrl.currentData.isPrivateServerCategoryType" ng-bind="item.PrivateServer.nameForDisplay"></a> </div> <div price-target-id=${asset.id} class="text-overflow item-card-price ng-scope" ng-if="!item.itemDetailsLoading"> <span class="icon-robux-16x16 ng-scope" ng-if="$ctrl.doesItemHavePrice(item)"></span> <span class="text-robux-tile ng-binding" ng-show="$ctrl.doesItemHavePrice(item)" ng-bind="$ctrl.getDisplayPrice(item) | abbreviate : 0">${util.abbreviateCost(asset.price)}</span> <span class="text-label ng-hide" ng-hide="$ctrl.doesItemHavePrice(item)"></span> </div>  </div>`
        if (asset.price == undefined) {
            document.querySelector('[price-target-id="'+asset.id+'"]').innerHTML = `
            <div class="text-overflow item-card-price ng-scope" ng-if="!item.itemDetailsLoading">
                <span class="text-robux-tile ng-binding ng-hide" ng-show="$ctrl.doesItemHavePrice(item)" ng-bind="$ctrl.getDisplayPrice(item) | abbreviate : 0"></span>
                <span class="text-label" ng-hide="$ctrl.doesItemHavePrice(item)">
                <span class="text-overflow font-caption-body ng-binding ng-scope" ng-if="item.priceStatus" ng-class="{'text-robux-tile': item.Product.IsFree}" ng-bind="item.priceStatus">Off Sale</span>
                </span>
            </div>`
        } else if (asset.price == 0) {
            document.querySelector('[price-target-id="'+asset.id+'"]').innerHTML = `
            <div class="text-overflow item-card-price ng-scope" ng-if="!item.itemDetailsLoading">
                <span class="text-robux-tile ng-binding ng-hide" ng-show="$ctrl.doesItemHavePrice(item)" ng-bind="$ctrl.getDisplayPrice(item) | abbreviate : 0"></span>
                <span class="text-label" ng-hide="$ctrl.doesItemHavePrice(item)">
                <span class="text-overflow font-caption-body ng-binding ng-scope" ng-if="item.priceStatus" ng-class="{'text-robux-tile': item.Product.IsFree}" ng-bind="item.priceStatus">Free</span>
                </span>
            </div>`
        }
        //document.querySelector("#assetsItems").appendChild(li)
        if (currentCategory != "bundles") {
            batchGetThumbnails.push({
                format: null,
                requestId: `${asset.id}:undefined:Asset:150x150:null:regular`,
                size: "150x150",
                targetId: asset.id,
                type: "Asset"
            })
        } else {
            batchGetThumbnails.push({
                format: null,
                requestId: `${asset.id}:undefined:BundleThumbnail:150x150:null:regular`,
                size: "150x150",
                targetId: asset.id,
                type: "BundleThumbnail"
            })
        }
    }
    let thumbnails = await util.postUrl("https://thumbnails.roblox.com/v1/batch", batchGetThumbnails, true)
    thumbnails = thumbnails.data
    for (let thumbnail of thumbnails) {
        if (thumbnail.state == "Completed") {
            let img = document.createElement("img")
            img.src = thumbnail.imageUrl
            img.className = "ng-scope ng-isolate-scope"
            document.querySelector(`[thumbnail-target-id="${thumbnail.targetId}"]`).appendChild(img)
            //remove the shimmer part of thumbnail-2d-container
            document.querySelector(`[thumbnail-target-id="${thumbnail.targetId}"]`).className = "thumbnail-2d-container"
        } else {
            document.querySelector(`[thumbnail-target-id="${thumbnail.targetId}"]`).className = "thumbnail-2d-container icon-broken"
        }
    }
}

async function refreshPage(inventory, currentCategory, currentSubCategory, currentPage) {
    document.querySelector('[ng-if="!$ctrl.staticData.canViewInventory"]').hidden = true
    //check if .current-items.hide-items exists, if it does, set the classname to .current-items
    if (document.querySelector(".current-items.hide-items")) {
        document.querySelector(".current-items.hide-items").className = "current-items"
    }
    //clear all children of .section-content-off
    let sectionContentOff = document.querySelector(".section-content-off")
    if (sectionContentOff) {
        sectionContentOff.innerHTML = ""
    }

    //check if assetItems already exists, if so, remove it
    if (document.querySelector("#assetsItems")) document.querySelector("#assetsItems").remove()

    if (currentCategory == undefined) currentCategory = "accessories" //weird bug after clicking "Inventory" button on profile page

    if (Array.isArray(inventory[currentCategory])) {
        if (inventory[currentCategory].length == 0) {
            sectionContentOff.innerHTML = `
            <span ng-bind="$ctrl.getInventoryEmptyMessage($ctrl.staticData.isOwnPage, $ctrl.pageType)" class="ng-binding">This user doesn't have items in this category.</span>
            <span ng-show="$ctrl.showMessageToFindNewItems($ctrl.pageType, $ctrl.currentData.category, $ctrl.currentData.subcategory)">
            <span ng-bind-html="$ctrl.getInventoryNewItemsMessage($ctrl.staticData.isLibraryLinkEnabled, $ctrl.currentData.itemSection, '
                <a class=&quot;text-link&quot;' +  'href=&quot;' + $ctrl.currentData.assetTypeUrl + '&quot;>', '</a>')" class="ng-binding">Try using the <a class="text-link" href="https://www.roblox.com/catalog/?Category=11&amp;Subcategory=54">marketplace</a> to find new items. </span>
            </span>`
            document.querySelector('[ng-if="!$ctrl.staticData.canViewInventory"]').hidden = false
            return
        }
        generateAssetPage(inventory, currentCategory, currentSubCategory, currentPage)
    } else {
        // if currentSubCategory is undefined, then it should be the first category under the currentCategory
        //i know theres better ways to do it, but when the inventory is saved to local storage the key order is messed up
        if (currentSubCategory == undefined) {
            if (currentCategory == "accessories") currentSubCategory = "head"
            if (currentCategory == "avatar_animations") currentSubCategory = "run"
            if (currentCategory == "bottoms") currentSubCategory = "pants"
            if (currentCategory == "classic_clothing") currentSubCategory = "classic_t_shirts"
            if (currentCategory == "shoes") currentSubCategory = "left_shoe"
            if (currentCategory == "tops") currentSubCategory = "t_shirt"
        }
        if (inventory[currentCategory][currentSubCategory].length == 0) {
            sectionContentOff.innerHTML = `
            <span ng-bind="$ctrl.getInventoryEmptyMessage($ctrl.staticData.isOwnPage, $ctrl.pageType)" class="ng-binding">This user doesn't have items in this category.</span>
            <span ng-show="$ctrl.showMessageToFindNewItems($ctrl.pageType, $ctrl.currentData.category, $ctrl.currentData.subcategory)">
            <span ng-bind-html="$ctrl.getInventoryNewItemsMessage($ctrl.staticData.isLibraryLinkEnabled, $ctrl.currentData.itemSection, '
                <a class=&quot;text-link&quot;' +  'href=&quot;' + $ctrl.currentData.assetTypeUrl + '&quot;>', '</a>')" class="ng-binding">Try using the <a class="text-link" href="https://www.roblox.com/catalog/?Category=11&amp;Subcategory=54">marketplace</a> to find new items. </span>
            </span>`
            document.querySelector('[ng-if="!$ctrl.staticData.canViewInventory"]').hidden = false
            return
        }
        generateAssetPage(inventory, currentCategory, currentSubCategory, currentPage)
    }
}

function spinningLoader(firstSetup) {
    if (document.querySelector(".current-items.hide-items")) {
        document.querySelector(".current-items.hide-items").className = "current-items"
    }
    //find .section-content-off and append the loading spinner animation
    if (document.querySelector(".section-content-off")) {
        if (firstSetup) {
            document.querySelector(".section-content-off").innerHTML = `<span class="spinner spinner-default"></span><i>please wait, may take some time</i>`;
            return
        }
        document.querySelector(".section-content-off").innerHTML = `<span class="spinner spinner-default"></span>`;
    }
}

pages.inventory = async (userId) => {
    if (location.href.includes("profile")) return;
    if (!settings.getSetting("general", "privateInventories")) return;

    let isOwnInventory = undefined;
    let isInventoryPrivate = undefined;

    var existCondition = setInterval(function() {
        if (document.querySelector('[ng-if="$ctrl.isOwnInventory"]')) {
            isOwnInventory = true;
        } else if (document.querySelector('[ng-if="!$ctrl.isOwnInventory"]')) {
            isOwnInventory = false;
        }
        if (document.querySelector('[ng-if="!$ctrl.staticData.canViewInventory"]')) {
            isInventoryPrivate = true;
        } else if (document.querySelector('[ng-if="$ctrl.staticData.canViewInventory"]')) {
            isInventoryPrivate = false;
        }
        if (isOwnInventory != undefined && isInventoryPrivate != undefined) {
            clearInterval(existCondition);
        }
    }, 100);

    while (isOwnInventory == undefined || isInventoryPrivate == undefined) await wait(50);
    if (isOwnInventory) return;

    let inventory = {
        accessories: {
            head: [],
            face: [],
            neck: [],
            shoulder: [],
            front: [],
            back: [],
            waist: [],
            gear: []
        },
        animations: [],
        audio: [],
        avatar_animations: {
            run: [],
            walk: [],
            fall: [],
            jump: [],
            idle: [],
            swim: [],
            climb: []
        },
        badges: [],
        bottoms: {
            pants: [],
            shorts: [],
            skirts: []
        },
        bundles: [],
        classic_clothing: {
            classic_t_shirts: [],
            classic_shirts: [],
            classic_pants: [],
        },
        classic_heads: [],
        decals: [],
        emote_animations: [],
        faces: [],
        hair_accessories: [],
        heads: [],
        meshparts: [],
        models: [],
        game_passes: [],
        places: [],
        plugins: [],
        shoes: {
            left_shoe: [],
            right_shoe: []
        },
        tops: {
            t_shirts: [],
            shirts: [],
            sweaters: [],
            jackets: []
        },
        video: [],
        savedAt: 0,
        processedOutfits: []
    }

    function addIdToInventory2(id, inventoryName) {
        //if the inventory name has a slash, it's a subcategory
        if (inventoryName.includes("/")) {
            let split = inventoryName.split("/");
            //check if weve already added the id to this subcategory
            if (inventory[split[0]][split[1]].includes(id)) return;
            inventory[split[0]][split[1]].push(id);
        } else {
            //we arent gonna add to the misc category since its useless
            if (inventoryName == "misc") return;
            //check if weve already added the id to this category
            if (inventory[inventoryName].includes(id)) return;
            inventory[inventoryName].push(id);
        }
    }
    //thank cors for this stupid workaround
    let start = "www"
    if (location.host.startsWith("web")) start = "web"
    if (!isInventoryPrivate) {
        //first check chrome local storage to see last time we saved the inventory
        chrome.storage.local.get(`inventory_${userId}`, async function(result) {
            let refresh = false;
            if (result[`inventory_${userId}`] != undefined) {
                //if older than an hour
                if (Date.now() - result[`inventory_${userId}`].savedAt > 3600000) {
                    refresh = true;
                }
            } else {
                refresh = true;
            }
            if (refresh) {
                //first, need to grab all the assets from the inventory by looping over InventoryNameToAssetType and making a request to https://www.roblox.com/users/inventory/list-json?assetTypeId=8&cursor=&itemsPerPage=1000&pageNumber=1&userId=1348679553
                let promises = [];
                for (let id of Object.keys(InventoryNameToAssetType)) {
                    let assetType = InventoryNameToAssetType[id];
                    let promise = getUrlWithAntiFail(`https://www.roblox.com/users/inventory/list-json?assetTypeId=${assetType}&cursor=&itemsPerPage=100&pageNumber=1&userId=${userId}`)
                    .then(response => {
                      if (response == undefined || typeof response == "string") return;
                      if (response.Data.Items == undefined || response.Data.Items.length == 0) return;
                      for (let asset of response.Data.Items) {
                        addIdToInventory2(asset.Item.AssetId, id);
                      }
                    });
                    promises.push(promise);
                }
                await Promise.all(promises);
                //now we have all the ids in the inventory object
                //lets post to the remote server
                inventory.savedAt = Date.now();
                // save inventory to local storage, with the key being the userId
                await util.postUrl(`https://api2.cupiditys.lol/betterblox/${start}/privateinv/submit`, { userId: userId.toString(), inventory: inventory }, false);
                chrome.storage.local.set({ [`inventory_${userId}`]: inventory });
            }
        });
    } else {
        //find ng-if="!$ctrl.isOwnInventory" and append to innerText "(Private)"
        if (document.querySelector('[ng-if="!$ctrl.isOwnInventory"]')) {
            document.querySelector('[ng-if="!$ctrl.isOwnInventory"]').innerText += " (Private)"
        }

        let url = location.href;
        let currentCategory = currentUrlPaths[7];
        let currentSubCategory = currentUrlPaths[8];
        let urlRefreshInterval = setInterval(async () => {
            if (url != location.href) {
                url = location.href;
                currentPage = 1;
                document.querySelector("#inventory-container > inventory > div > assets-explorer > div > div > div.tab-content.rbx-tab-content > div > div.pager-holder > ul > li:nth-child(2) > span").innerText = `Page 1`
                let split = location.href.split("/");
                if (split[5] == "inventory#!") {//weird btroblox bug
                    currentCategory = split[6];
                    currentSubCategory = split[7];
                } else {
                    currentCategory = split[7];
                    currentSubCategory = split[8];
                }
                if (currentCategory) currentCategory = currentCategory.replaceAll("-", "_");
                if (currentSubCategory) currentSubCategory = currentSubCategory.replaceAll("-", "_");
                await refreshPage(inventory, currentCategory, currentSubCategory, currentPage);
            }
        }, 100);

        function addIdToInventory(id, type) {
            let inventoryName = AssetNameToInventoryName[type];
            if (inventoryName == undefined) {
                console.log("COULD NOT FIND INVENTORY NAME FOR " + type);
                return;
            }
            //if the inventory name has a slash, it's a subcategory
            if (inventoryName.includes("/")) {
                let split = inventoryName.split("/");
                //check if weve already added the id to this subcategory
                if (inventory[split[0]][split[1]].includes(id)) return;
                inventory[split[0]][split[1]].push(id);
            } else {
                //we arent gonna add to the misc category since its useless
                if (inventoryName == "misc") return;
                //check if weve already added the id to this category
                if (inventory[inventoryName].includes(id)) return;
                inventory[inventoryName].push(id);
            }
        }

        async function getAssetsAndSave(prevInv) {
            // get assets from currently wearing items
            let wearing = await getUrlWithAntiFail(`https://avatar.roblox.com/v1/users/${userId}/avatar`, false);
            for (let asset of wearing.assets) {
                addIdToInventory(asset.id, asset.assetType.name);
            }
            for (let emote of wearing.emotes) {
                addIdToInventory(emote.assetId, "EmoteAnimation");
            }

            // get assets from their outfits
            let outfits = await getUrlWithAntiFail(`https://avatar.roblox.com/v1/users/${userId}/outfits?itemsPerPage=100&page=1`, false);
            for (let outfit of outfits.data) {
                if (prevInv) {
                    if (prevInv.processedOutfits.includes(outfit.id)) continue;
                }
                let outfitData = await getUrlWithAntiFail(`https://avatar.roblox.com/v1/outfits/${outfit.id}/details`);
                inventory.processedOutfits.push(outfit.id);
                for (let asset of outfitData.assets) {
                    if (asset.assetType.name.includes("Animation")) continue; //ignore animations since we get them from the other outfits endpoint
                    addIdToInventory(asset.id, asset.assetType.name);
                }
            }

            // get assets from bundles and animation packages
            let packages = await getUrlWithAntiFail(`https://avatar.roblox.com/v1/users/${userId}/outfits?isEditable=false&itemsPerPage=50&outfitType=Avatar&page=1`)
            for (let packagee of packages.data) {//why are you not allowed to use "package" as a variable name hmm
                if (prevInv) {
                    if (prevInv.processedOutfits.includes(packagee.id)) continue;
                }
                inventory.processedOutfits.push(packagee.id);
                let outfitData = await getUrlWithAntiFail(`https://avatar.roblox.com/v1/outfits/${packagee.id}/details`);
                //use the catalog.roblox.com/v1/assets/{assetId}/bundles endpoint on only the first asset in the outfit
                let bundleData = await getUrlWithAntiFail(`https://catalog.roblox.com/v1/assets/${outfitData.assets[0].id}/bundles`);
                if (bundleData.data.length > 0) {
                    for (let bundle of bundleData.data) {
                        addIdToInventory(bundle.id, "Bundle");
                    }
                }
                for (let asset of outfitData.assets) {
                    addIdToInventory(asset.id, asset.assetType.name);
                }
            }
            inventory.savedAt = Date.now();
            // save inventory to local storage, with the key being the userId
            await util.postUrl(`https://api2.cupiditys.lol/betterblox/${start}/privateinv/submit`, { userId: userId.toString(), inventory: inventory }, false);
            if (!location.href.includes("#!")) return;
            if (prevInv) return;
            refreshPage(inventory, currentCategory, currentSubCategory, currentPage);
        }

        //first, lets check if the user's inventory has already been saved to remote server
        let result = await util.getUrl(`https://api2.cupiditys.lol/betterblox/${start}/privateinv/get?userId=${userId.toString()}`, false)
        // if the inventory has been saved to local storage, use that
        if (result != null && result.success == true) {
            inventory = result.inventory
            if (!location.href.includes("#!")) return;
            spinningLoader(false);
            refreshPage(inventory, currentCategory, currentSubCategory, currentPage);
            getAssetsAndSave(inventory);
        } else {
            spinningLoader(true);
            getAssetsAndSave(null);
        }
    }
}