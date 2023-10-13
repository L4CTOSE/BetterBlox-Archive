/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */

"use strict"

//idea:group wall anti-spam

pages.vanity = async () => {
    if (location.pathname.split("/")[2] === "friends") return;// ignore the /users/friends url
    if (settings.getSetting("general", "vanityUrls")) {
        let user = location.pathname.split("/")[2]
        location.href = `https://www.roblox.com/users/profile?username=${user}`
    }
}