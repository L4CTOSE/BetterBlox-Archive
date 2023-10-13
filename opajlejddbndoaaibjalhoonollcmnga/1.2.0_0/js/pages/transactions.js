/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2022 cupiditys.
 */

// todo: fix all time showing up under the 2nd "choice picker" aswell as the first


"use strict"

pages.transactions = async () => {
    let authUser = await util.getAuthUser();
    //let transactionTypes = await util.getUrl(`https://economy.roblox.com/v2/users/${authUser.userId}/transaction-types`, true)

    let currentIncomingAmount = 0;
    let currentOutgoingAmount = 0;
    let TotalIncomingAmount = 0;
    let TotalOutgoingAmount = 0;

    let finishedIncCount = 0;
    let finishedOutCount = 0;

    let array = [];

    let Total1Num = 0;
    let Total2Num = 0;
    let Total1Set = false;
    let Total2Set = false;
    let toDoIncoming = 0;
    let toDoOutgoing = 0;

    async function getAndSetAllTransactions() { //idk
        let bro = document.getElementsByClassName("amount icon-robux-container")
        for (let i = 0; i < bro.length; i++) {
            if (bro[i].className.includes("disabled")) {
                bro[i].childNodes[2].innerText = "N/A"
            } else {
                bro[i].childNodes[2].innerText = "Processing..."
            }
        }
        await index()
        getPremiumStipends()
    }

    async function index() {
        for (let entry in document.getElementsByClassName("summary-transaction-label")) {
            if (document.getElementsByClassName("summary-transaction-label")[entry].innerText == "Total" && !Total1Set) {
                Total1Num = entry
                Total1Set = true;
            } else if (document.getElementsByClassName("summary-transaction-label")[entry].innerText == "Total" && !Total2Set) {
                Total2Num = entry
                Total2Set = true;
            }
            array.push(document.getElementsByClassName("summary-transaction-label")[entry].innerText)
            if (!isNaN(entry)) {
                array.push(entry)
            }
        }
        return true
    }

    async function checkIfExists(type) {
        if (array.includes(type)) {
            for (let i = -1; i < array.length; i++) {
                if (array[i] == type) {
                    return array[i + 1]
                }
            }
        } else {
            return "a"
        }
    }

    async function process(type, indexNum, nextPageCursor, processedCount) {
        let req = await util.getUrl(`https://economy.roblox.com/v2/users/${authUser.userId}/transactions?transactionType=${type}&limit=100&cursor=${nextPageCursor}`, true)
        let cursor = ""
        let data = req["data"]
        processedCount = processedCount + 100;
        for (let entry in data) {
            if (type != "Purchase" && type != "DevEx" && type != "AdSpend") {
                currentIncomingAmount = currentIncomingAmount + data[entry]["currency"]["amount"]
                TotalIncomingAmount = TotalIncomingAmount + data[entry]["currency"]["amount"]
                document.getElementsByClassName("summary-transaction-label")[indexNum].parentNode.childNodes[1].childNodes[2].innerText = `${currentIncomingAmount.toLocaleString('en-US')} (Processed ${processedCount.toLocaleString('en-US')} transactions...)`
                document.getElementsByClassName("summary-transaction-label")[Total1Num].parentNode.childNodes[1].childNodes[2].innerText = `${TotalIncomingAmount.toLocaleString('en-US')} (Processing...)`
            } else {
                currentOutgoingAmount = currentOutgoingAmount - data[entry]["currency"]["amount"]
                TotalOutgoingAmount = TotalOutgoingAmount - data[entry]["currency"]["amount"]
                document.getElementsByClassName("summary-transaction-label")[indexNum].parentNode.childNodes[1].childNodes[2].innerText = `${currentOutgoingAmount.toLocaleString('en-US')} (Processed ${processedCount.toLocaleString('en-US')} transactions...)`
                document.getElementsByClassName("summary-transaction-label")[Total2Num].parentNode.childNodes[1].childNodes[2].innerText = `${currentOutgoingAmount.toLocaleString('en-US')} (Processing...)`
            }
        }
        if (req["nextPageCursor"] != null) {
            cursor = req["nextPageCursor"]
            process(type, indexNum, cursor, processedCount)
        } else {
            if (type != "Purchase" && type != "DevEx" && type != "AdSpend") {
                finishedIncCount += 1;
                document.getElementsByClassName("summary-transaction-label")[indexNum].parentNode.childNodes[1].childNodes[2].innerText = currentIncomingAmount.toLocaleString('en-US')
                if (finishedIncCount >= toDoIncoming) {
                    document.getElementsByClassName("summary-transaction-label")[Total1Num].parentNode.childNodes[1].childNodes[2].innerText = TotalIncomingAmount.toLocaleString('en-US')
                    TotalIncomingAmount = 0;
                }
                currentIncomingAmount = 0;
                return true
            } else {
                finishedOutCount += 1;
                if (finishedOutCount >= toDoOutgoing) {
                    document.getElementsByClassName("summary-transaction-label")[indexNum].parentNode.childNodes[1].childNodes[2].innerText = currentOutgoingAmount.toLocaleString('en-US')
                    document.getElementsByClassName("summary-transaction-label")[Total2Num].parentNode.childNodes[1].childNodes[2].innerText = currentOutgoingAmount.toLocaleString('en-US')
                    currentOutgoingAmount = 0;
                }
                return true
            }
        }
    }

    async function getPremiumStipends() {
        console.log(array)
        let check = await checkIfExists("Premium Stipends")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("PremiumStipend", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 1")
        }
        getCurrencyPurchases()
    }

    async function getCurrencyPurchases() {
        let check = await checkIfExists("Currency Purchases")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("CurrencyPurchase", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 2")
        }
        getSaleOfGoods()
    }

    async function getSaleOfGoods() {
        let check = await checkIfExists("Sales of Goods")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("Sale", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 3")
        }
        getPremiumPayouts()
    }

    async function getPremiumPayouts() {
        let check = await checkIfExists("Premium Payouts")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("EngagementPayout", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 4")
        }
        getGroupPayouts()
    }

    async function getGroupPayouts() {
        let check = await checkIfExists("Group Payouts")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("GroupPayout", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 5")
        }
        getGroupPremiumPayouts()
    }

    async function getGroupPremiumPayouts() {
        let check = await checkIfExists("Group Premium Payouts")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("GroupEngagementPayout", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 6")
        }
        getCommisions()
    }

    async function getCommisions() {
        let check = await checkIfExists("Commissions")
        if (check != "a") {
            document.getElementsByClassName("summary-transaction-label")[check].parentNode.childNodes[1].childNodes[2].innerText = "not currently supported :("
        } else {
            console.log("[debug]: skipped 7")
        }
        getTradeEarnings()
    }

    async function getTradeEarnings() {
        let check = await checkIfExists("Earnings from Trades")
        if (check != "a") {
            document.getElementsByClassName("summary-transaction-label")[check].parentNode.childNodes[1].childNodes[2].innerText = "not currently supported :("
        } else {
            console.log("[debug]: skipped 8")
        }
        getRobloxAdjustments()
    }

    async function getRobloxAdjustments() {
        let check = await checkIfExists("Roblox Adjustments")
        if (check != "a") {
            toDoIncoming += 1;
            if (process("CSAdjustment", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 9")
        }
        getDevEx()
    }

    async function getDevEx() {
        let check = await checkIfExists("Developer Exchange")
        if (check != "a") {
            toDoOutgoing += 1;
            if (process("DevEx", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 10")
        }
        getPurchases()
    }

    async function getPurchases() {
        let check = await checkIfExists("Purchases")
        if (check != "a") {
            toDoOutgoing += 1;
            if (process("Purchase", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 11")
        }
        getCostOfTrades()
    }

    async function getCostOfTrades() {
        let check = await checkIfExists("Cost Of Trades")
        if (check != "a") {
            document.getElementsByClassName("summary-transaction-label")[check].parentNode.childNodes[1].childNodes[2].innerText = "not currently supported :("
        } else {
            console.log("[debug]: skipped 12")
        }
        getAdSpend()
    }

    async function getAdSpend() {
        let check = await checkIfExists("Sponsored Ad Spend")
        if (check != "a") {
            toDoOutgoing += 1;
            if (process("AdSpend", check, "", 0)) {}
        } else {
            console.log("[debug]: skipped 13")
        }
        finish()
    }

    async function finish() {
        if (toDoIncoming == 0 && toDoOutgoing == 0) {
            for (let entry in document.getElementsByClassName("summary-transaction-label")) {
                document.getElementsByClassName("summary-transaction-label")[entry].parentNode.childNodes[1].childNodes[2].innerText = 0
            }
        }
        //document.getElementsByClassName("amount icon-robux-container")[5].childNodes[2].innerText = "N/A"
    }
    if (settings.getSetting("general", "allTimeTransactions")) {
        $.watch("#date-selection", (dateSelection) => {
            dateSelection.click(() => {
                $.watch(".dropdown-menu", (dropdown) => {
                    dropdown.removeClass('hidden')
                    if (!$('[bro="BetterBlox"]')
                        .length > 0) {
                        dropdown.append(`<li bro="BetterBlox" role="presentation" class=""><a role="menuitem" tabindex="-1" href="#">${chrome.i18n.getMessage("allTime")}</a></li>`)
                        $.watch('[bro="BetterBlox"]', (addition) => {
                            addition.click(() => {
                                dropdown.addClass('hidden')
                                let children = dropdown.children()
                                for (var i = 0; i < children.length; i++) {
                                    let currentChild = children.eq(i);
                                    if (!currentChild.attr('bro')) {
                                        currentChild.attr('class', '')
                                        $.watch(currentChild, (child) => {
                                            child.click(() => {
                                                addition.attr('class', '')
                                            })
                                        })
                                    }
                                }
                                addition.attr('class', 'active')
                                dateSelection.find('.rbx-selection-label')
                                    .text(`${chrome.i18n.getMessage("allTime")}`)
                                getAndSetAllTransactions()
                            })
                        })
                    }
                })
            })
        })
    }
}