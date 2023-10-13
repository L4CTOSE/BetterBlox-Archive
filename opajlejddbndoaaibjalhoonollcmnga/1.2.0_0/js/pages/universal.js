"use strict"

pages.universal = async () => {
    if (settings.getSetting("general", "appearOffline")) {
        let message = {appearOffline: "enable"};
        runtime.sendMessage(message)
    } else {
        let message = {appearOffline: "disable"};
        runtime.sendMessage(message)
    }
    $.watch("body", (body) => {
        body.addClass('BetterBlox');
    })

    $.watch("#settings-icon", (settingsIcon) => {
        settingsIcon.click(() => {
            $.watch("#settings-popover-menu", (popover) => {
                if (!$(".BetterBlox-rbx-menu-item").length > 0) {
                    popover.prepend(`<li><a class="rbx-menu-item BetterBlox-rbx-menu-item" href="https://${currentUrlPaths[2]}/BetterBlox/settings">BetterBlox</a></li>`)
                }
            })
        })
    })
}