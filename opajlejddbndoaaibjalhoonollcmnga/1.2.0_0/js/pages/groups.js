/*
 * This file is part of the BetterBlox distribution.
 * Copyright (c) 2023 cupiditys.
 */

"use strict"

pages.groups = async (groupId) => {

  if (!settings.getSetting("general", "lockedGroups")) return;

  async function getRepeat(url, current, max) {
    return new Promise(async (resolve, reject) => {
      fetch(url)
      .then(async (response) => {
        if (response.status === 200) {
          resolve(await response.json())
        } else {
          if (current < max) {
            setTimeout(() => {
              getRepeat(url, max, current + 1).then(resolve, reject)
            }, 150);
          }
        }
      })
      .catch(error=>getRepeat(url, max, current + 1).then(resolve, reject))
    })
  }
  
    let removeGames = false;

    let group = await getRepeat(`https://groups.roblox.com/v1/groups/${groupId}`, 0, 15)
    let funds = await util.getUrl(`https://economy.roblox.com/v1/groups/${groupId}/currency`, true)
    let roles = await getRepeat(`https://groups.roblox.com/v1/groups/${groupId}/roles`, 0, 15)
    let icon = await getRepeat(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=Png&isCircular=false`, 0, 15)
    let games = await getRepeat(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=Public&cursor=&limit=50&sortOrder=Desc`, 0, 15)
    let invt = setInterval(() => {
        if (document.querySelector("#group-container > div > div > div.group-details.col-xs-12.ng-scope.col-sm-9 > div > p") != null) {
            document.getElementsByClassName("group-details col-xs-12 ng-scope col-sm-9")[0].remove()
            clearInterval(invt)
            console.log(icon['data'][0]['imageUrl'])
            if (games.data.length <= 0) {
              removeGames = true;
            }
            create(group.name, group.description, icon['data'][0]['imageUrl'], group.memberCount, group.owner != null ? group.owner.displayName : "No One!", group.owner != null ? group.owner.userId : "", funds.errors == null ? funds.robux : -1)
            let ab = setInterval(() => {
              if (document.querySelector('#group-visits') != null) {
                alert("Using RoGold's view locked feature will cause issues, you should disable either BetterBlox's or RoGold's.")
                clearInterval(ab)
              }
            }, 1000);
        }
    }, 0);

    function abbreviate(a){let b=Math.floor(Math.log10(a)/3);return a>999?Math.floor(a/Math.pow(1e3,b))+["K+","M+","B+"][b-1]:a}

    function create(groupName, description, iconUrl, memberCount, displayName, userId, funds) {
        let elem = document.createElement('div')
        elem.innerHTML = `<div class="group-details col-xs-12 ng-scope col-sm-9" ng-if="layout.isMetadataLoaded" ng-class="{'col-sm-9' : isAuthenticatedUser &amp;&amp; !library.metadata.isPhone}">
        <div ng-if="!isLockedGroup() &amp;&amp; !isGroupRestrictedByPolicy() &amp;&amp; !layout.loadGroupMetadataError" class="ng-scope">
          <div class="section-content">
            <div class="hidden" id="page-top"></div>
            <div class="group-header">
              <div class="group-image">
                <thumbnail-2d thumbnail-type="thumbnailTypes.groupIcon" thumbnail-target-id="library.currentGroup.id" class="ng-isolate-scope">
                  <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="GroupIcon" thumbnail-target-id="6999435">
                    <img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" ng-src="https://tr.rbxcdn.com/999c1c277e472b0a850fec95c5500fb3/150/150/Image/Png" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${iconUrl}">
                  </span>
                </thumbnail-2d>
              </div>
              <div ng-if="!layout.loadGroupError" class="group-caption ng-scope">
                <div class="group-title shimmer-lines ng-hide" ng-show="layout.isLoadingGroup">
                  <h1 class="group-name shimmer-line placeholder"></h1>
                  <div class="group-owner text font-caption-body shimmer-line placeholder"></div>
                </div>
                <div class="group-title" ng-hide="layout.isLoadingGroup">
                  <h1 class="group-name text-overflow ng-binding" ng-bind="library.currentGroup.group.name">${groupName}</h1>
                  <div ng-if="doesGroupHaveOwner()" class="group-owner text font-caption-body ng-scope">
                    <span ng-bind="'Label.ByOwner' | translate" class="ng-binding">By</span>
                    <a ng-if="layout.isDisplayNamesEnabled" ng-href="https://www.roblox.com/users/${userId}/profile" class="text-link ng-binding ng-scope" ng-bind="library.currentGroup.group.owner.displayName" href="https://www.roblox.com/users/${userId}/profile">${displayName}</a>
                  </div>
                </div>
                <div class="group-info" ng-hide="layout.isLoadingGroup">
                  <ul class="group-stats">
                    <li class="group-members">
                      <span class="font-header-2 ng-binding" title="${memberCount.toLocaleString('en-us')}" ng-bind="library.currentGroup.group.memberCount | abbreviate">${parseInt(memberCount)>0 ? abbreviate(memberCount) : "69"}</span>
                      <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate">Members</div>
                    </li>
                    <li ng-if="canViewGroupRank()" class="group-rank text-overflow ng-scope">
                      <span class="text-overflow font-header-2 ng-binding" title="Member" ng-bind="library.currentGroup.role.name">?</span>
                      <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Rank' | translate">Rank</div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="group-menu">
                <button class="btn-generic-more-sm" popover-placement="bottom-right" popover-trigger="'outsideClick'" uib-popover-template="'group-menu-popover'" title="More">
                  <span class="icon-more"></span>
                </button>
              </div>
            </div>
          </div>
          <div class="rbx-tabs-horizontal">
            <ul id="horizontal-tabs" class="nav nav-tabs" role="tablist">
              <li id="about" class="rbx-tab group-tab ng-scope ng-isolate-scope active" ng-class="{'active': activeTab === tab }" ui-sref="about" ng-repeat="tab in groupDetailsConstants.tabs" active-tab="layout.activeTab" tab="tab" group-tab="" href="#!/about">
                <a class="rbx-tab-heading">
                  <span class="text-lead ng-binding" ng-bind="tab.translationKey | translate">About</span>
                </a>
              </li>
              <li id="store" class="rbx-tab group-tab ng-scope ng-isolate-scope" ng-class="{'active': activeTab === tab }" ui-sref="store" ng-repeat="tab in groupDetailsConstants.tabs" active-tab="layout.activeTab" tab="tab" group-tab="" href="#!/store">
                <a class="rbx-tab-heading">
                  <span class="text-lead ng-binding" ng-bind="tab.translationKey | translate">Store</span>
                </a>
              </li>
              <li id="affiliates" class="rbx-tab group-tab ng-scope ng-isolate-scope" ng-class="{'active': activeTab === tab }" ui-sref="affiliates" ng-repeat="tab in groupDetailsConstants.tabs" active-tab="layout.activeTab" tab="tab" group-tab="" href="#!/affiliates">
                <a class="rbx-tab-heading">
                  <span class="text-lead ng-binding" ng-bind="tab.translationKey | translate">Affiliates</span>
                </a>
              </li>
            </ul>
          </div>
          <div ng-if="layout.activeTab === groupDetailsConstants.tabs.about" group-about="" class="ng-scope">
            <div class="tab-content rbx-tab-content col-xs-12">
              <group-description group-id="library.currentGroup.id" description="library.currentGroup.group.description" funds="currencyInRobux" policies="policies" class="ng-isolate-scope">
                <div class="section">
                  <div class="container-header">
                    <h2 ng-bind="'Heading.Description' | translate" class="ng-binding">Description</h2>
                  </div>
                  <div class="section-content remove-panel">
                    <div class="group-description toggle-target ng-scope" ng-if="$ctrl.canViewDescription()">
                      <pre id="group-description-text" class="text group-description-text">
                          <span class="group-description-content-text ng-binding" ng-bind-html="$ctrl.description | linkify">${description}</span>
                        </pre>
                      <span class="toggle-content text-link cursor-pointer ng-binding" data-container-id="group-description-text" data-show-label="Read More" data-hide-label="Show Less" ng-bind=" 'Action.ReadMore' | translate " style="display: none;">Read More</span>
                    </div>
                    <ul ng-if="$ctrl.funds !== null" class="border-top group-detail-stats ng-scope">
                      <li class="group-detail-stat col-xs-6 col-md-2">
                        <p class="text-label font-caption-header ng-binding" ng-bind="'Label.Funds' | translate">Funds</p>
                        <p class="text-lead"></p>
                        <h2 title="R$ ${funds.toLocaleString('en-us')}" class="icon-text-wrapper">
                          <span class="icon-robux-28x28"></span>
                          <span class="text-robux-lg ng-binding" ng-bind="$ctrl.funds | abbreviate">${funds>0 ? abbreviate(funds) : "Unknown"}</span>
                        </h2>
                      </li>
                    </ul>
                  </div>
                  <div class="section-content remove-panel">
                    <div class="border-top group-description-footer">
                    </div>
                  </div>
                </div>
              </group-description>
              <group-games ng-if="library.currentGroup.areGroupGamesVisible" group-id="library.currentGroup.id" class="ng-scope ng-isolate-scope">
                <div class="section">
                  <div class="container-header">
                    <h2 ng-bind="'Heading.Games' | translate" class="ng-binding">Experiences</h2>
                    <div class="pager-holder" ng-show="games.length > 0" cursor-pagination="gamesPager">
                      <ul class="pager">
                        <li class="pager-prev">
                          <button class="btn-generic-left-sm" ng-click="cursorPaging.loadPreviousPage()" ng-disabled="!cursorPaging.canLoadPreviousPage()" disabled="disabled">
                            <span class="icon-left"></span>
                          </button>
                        </li>
                        <li>
                          <span ng-bind="'Label.CurrentPage' | translate:{ currentPage: cursorPaging.getCurrentPageNumber() }" class="ng-binding">Page 1</span>
                        </li>
                        <li class="pager-next">
                          <button class="btn-generic-right-sm" ng-click="cursorPaging.loadNextPage()" ng-disabled="!cursorPaging.canLoadNextPage()" disabled="disabled">
                            <span class="icon-right"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="group-games">
                    <div class="spinner spinner-default ng-hide" ng-show="gamesPager.isBusy()"></div>
                    <div class="section-content-off ng-binding ng-hide" ng-show="!gamesPager.isBusy() &amp;&amp; games.length == 0" ng-bind="$ctrl.layout.loadGamesError ? 'Message.LoadGroupGamesError' : 'Label.NoGames' | translate">No experiences are associated with this group.</div>
                    <ul class="hlist game-cards" ng-show="!gamesPager.isBusy() &amp;&amp; games.length > 0"></ul>
                  </div>
                </div>
              </group-games>
              <group-payouts ng-if="isAuthenticatedUser" group-id="library.currentGroup.id" class="ng-scope ng-isolate-scope">
              </group-payouts>
              <div class="clearfix"></div>
              <group-members-list ng-if="library.currentGroup.roles &amp;&amp; canViewMembers()" is-authenticated-user="isAuthenticatedUser" group-id="library.currentGroup.id" roles="library.currentGroup.roles" class="ng-scope ng-isolate-scope">
                <div class="section" ng-hide="$ctrl.group.memberCount == 0">
                  <div class="container-header group-members-list-container-header">
                    <h2 ng-bind="'Heading.Members' | translate" class="ng-binding">Members</h2>
                    <div ng-show="$ctrl.members.length > 0" class="pager-holder" cursor-pagination="membersPager">
                      <ul class="pager">
                        <li class="pagfer-prev">
                          <button class="btn-generic-left-sm" ng-click="cursorPaging.loadPreviousPage()" ng-disabled="!cursorPaging.canLoadPreviousPage()" disabled="disabled">
                            <span class="icon-left"></span>
                          </button>
                        </li>
                        <li>
                          <span ng-bind="'Label.CurrentPage' | translate:{ currentPage: cursorPaging.getCurrentPageNumber() }" class="ng-binding">Page 1</span>
                        </li>
                        <li class="pagfer-next1">
                          <button class="btn-generic-right-sm" ng-click="cursorPaging.loadNextPage()" ng-disabled="!cursorPaging.canLoadNextPage()" disabled="disabled">
                            <span class="icon-right"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div ng-if="$ctrl.roles.length > 0" class="input-group-btn group-dropdown ng-scope">
                      <button type="button" class="input-dropdown-btn" data-toggle="dropdown">
                        <span class="rbx-selection-label ng-binding" title="Member" ng-bind="$ctrl.data.currentRoleName">${roles.roles[1].name}</span>
                        <span class="icon-down-16x16"></span>
                      </button>
                      <ul data-toggle="dropdown-menu" class="dropdown-menu" role="menu"></ul>
                    </div>
                  </div>
                  <div class="spinner spinner-default ng-hide" ng-show="membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0"></div>
                  <div class="section-content-off ng-binding ng-hide" ng-show="!membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0" ng-bind="$ctrl.loadMembersError ? 'Message.BuildGroupRolesListError' : 'Label.NoMembersInRole' | translate">No group members are in this role.</div>
                  <div class="section-content group-members-list" ng-show="$ctrl.members.length > 0">
                    <ul id="thingtoappendmembers" class="hlist"></ul>
                  </div>
                </div>
              </group-members-list>
              <group-wall ng-if="canViewWall()" group-id="library.currentGroup.id" metadata="library.metadata" role="library.currentGroup.role" permissions="library.currentGroup.permissions" class="ng-scope ng-isolate-scope">
                <div class="section" infinite-scroll="groupWall.pager.loadNextPage()" infinite-scroll-disabled="isInfiniteScrollingDisabled()" infinite-scroll-distance="0.8">
                  <div class="container-header">
                    <h2 ng-bind="'Heading.Wall' | translate" class="ng-binding">Wall</h2>
                  </div>
                  <div class="section-content-off ng-binding" ng-show="!groupWall.pager.isBusy() &amp;&amp; !groupWall.loadFailure &amp;&amp; groupWall.posts.length == 0" ng-bind="'Label.NoWallPosts' | translate">Nobody has said anything yet...</div>
                  <div class="section-content-off ng-binding ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; groupWall.loadFailure" ng-bind="'Label.WallPostsUnavailable' | translate">Wall posts are temporarily unavailable, please check back later.</div>
                  <div class="loading ng-hide" ng-show="groupWall.pager.isBusy()">
                    <span class="spinner spinner-default" alt="Processing..."></span>
                  </div>
                </div>
              </group-wall>
            </div>
          </div>
        </div>
      </div>`
    document.getElementsByClassName("section ng-scope group-details-container-desktop-and-tablet")[0].appendChild(elem)
    
    function createGame(placeId, imageUrl, name, players, rating) {
      let li = document.createElement("li");
      li.innerHTML = `<li class="list-item ng-scope" ng-repeat="game in games">
        <group-games-item class="game-card game-tile ng-isolate-scope" game="game">
          <div class="game-card-container">
            <a ng-href="https://roblox.com/games/${placeId}/BetterBlox" ng-click="$ctrl.goToGameDetails()" class="game-card-link" href="https://roblox.com/games/${placeId}/BetterBlox">
              <thumbnail-2d thumbnail-type="$ctrl.thumbnailTypes.gameIcon" thumbnail-target-id="$ctrl.game.id" class="game-card-thumb-container ng-isolate-scope">
                <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="GameIcon" thumbnail-target-id="1598881770">
                  <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() -->
                  <img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" ng-src="${imageUrl}" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${imageUrl}">
                  <!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() -->
                  <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() -->
                </span>
              </thumbnail-2d>
              <div class="game-card-name game-name-title ng-binding" title="${name}" ng-bind="$ctrl.game.name">${name}</div>
              <div class="game-card-info">
                <span class="info-label icon-votes-gray"></span>
                <!-- ngIf: $ctrl.game.votes.votePercentage -->
                <span class="info-label vote-percentage-label ng-binding ng-scope" ng-if="$ctrl.game.votes.votePercentage" ng-bind="$ctrl.game.votes.votePercentage">${rating}</span>
                <!-- end ngIf: $ctrl.game.votes.votePercentage -->
                <!-- ngIf: !$ctrl.game.votes.votePercentage -->
                <span class="info-label icon-playing-counts-gray"></span>
                <span class="info-label playing-counts-label ng-binding" title="${players}" ng-bind="$ctrl.game.playing | abbreviate">${players}</span>
              </div>
            </a>
          </div>
        </group-games-item>
      </li>`
      document.getElementsByClassName("hlist game-cards")[0].appendChild(li)
    }

    function createMember(name,userid, imageurl) {
      let li = document.createElement("li");
      li.innerHTML = `<li id="${userid}" class="list-item member ng-scope" ng-repeat="member in $ctrl.members">
      <div class="avatar-container">
        <a ng-href="https://roblox.com/users/${userid}/profile" href="https://roblox.com/users/${userid}/profile">
          <span class="avatar-card-link-spanner"></span>
        </a>
        <div class="avatar avatar-card-fullbody">
          <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="$ctrl.thumbnailTypes.avatarHeadshot" thumbnail-target-id="member.userId">
            <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="2739790396">
              <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() -->
              <img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" ng-src="${imageurl}" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${imageurl}">
              <!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() -->
              <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() -->
            </span>
          </thumbnail-2d>
          <a class="avatar-status">
            <span ng-show="member.presence.locationType === 1" class="icon-online ng-hide"></span>
          </a>
          <a class="avatar-status">
            <span ng-show="member.presence.locationType === 2" class="icon-game ng-hide"></span>
          </a>
          <a class="avatar-status">
            <span ng-show="member.presence.locationType === 3" class="icon-studio ng-hide"></span>
          </a>
        </div>
        <!-- ngIf: $ctrl.isDisplayNamesEnabled -->
        <span ng-if="$ctrl.isDisplayNamesEnabled" class="text-overflow font-caption-header member-name ng-binding ng-scope" title="${name}" ng-bind="member.displayName">${name}</span>
        <!-- end ngIf: $ctrl.isDisplayNamesEnabled -->
        <!-- ngIf: !$ctrl.isDisplayNamesEnabled -->
      </div>
      </li>`
      document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-members-list > div > div.section-content.group-members-list > ul").appendChild(li)
    }

    function createRole(name, memberCount, id) {
      let li = document.createElement("li");
      li.innerHTML = `<li id="${id}" ng-repeat="role in $ctrl.roles" class="ng-scope">
      <a ng-click="$ctrl.updateRole(role)">
        <span class="text-overflow ng-binding" ng-bind="role.name">${name}</span>
        <!-- ngIf: role.memberCount -->
        <span class="role-member-count ng-binding ng-scope" ng-if="role.memberCount" ng-bind="role.memberCount | abbreviate">${memberCount>0 ? abbreviate(memberCount) : ""}</span>
        <!-- end ngIf: role.memberCount -->
      </a>
      </li>`
      document.getElementsByClassName("dropdown-menu")[2].appendChild(li)
      $.watch(`#${id}`, (element) => {
        element.click(() => {
          let userarr = [];
          let namearr = [];
          (async () => {
            document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-members-list > div > div.container-header.group-members-list-container-header > div.input-group-btn.group-dropdown.ng-scope > button > span.rbx-selection-label.ng-binding").innerText = name;
            let members = await getRepeat(`https://groups.roblox.com/v1/groups/${groupId}/roles/${id}/users?sortOrder=Asc&limit=10`, 0, 15)
            let elemlist = document.getElementById("thingtoappendmembers")
            while (elemlist.firstChild) {
              elemlist.removeChild(elemlist.firstChild);
            }
            for (let member in members.data) {
              if (member != 9) {
                userarr.push(members.data[member].userId)
                namearr.push(members.data[member].displayName)
              }
            }
            let thumbnails = await getRepeat(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userarr.toString()}&size=150x150&format=Png&isCircular=false`, 0, 15)
            for (let thumbnail in thumbnails.data) {
              createMember(namearr[thumbnail],thumbnails.data[thumbnail].targetId,thumbnails.data[thumbnail].imageUrl)
            }
          })();
        })
      })
    }

    function abbriviateRatings(a,b){return a>0||b>0?`${Math.floor(a/(a+b)*100)}%`:"--"}
    function abbriviatePlayers(num){return Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(num)}

    for (let role in roles.roles) {
      if (roles.roles[role].name != "Guest") {
        createRole(roles.roles[role].name, roles.roles[role].memberCount, roles.roles[role].id)
      }
      if (role == 1) {
        let userarr = [];
        let namearr = [];
        (async () => {
          let members = await getRepeat(`https://groups.roblox.com/v1/groups/${groupId}/roles/${roles.roles[1].id}/users?sortOrder=Asc&limit=10`, 0, 15)
          for (let member in members.data) {
            if (member != 9) {
              userarr.push(members.data[member].userId)
              namearr.push(members.data[member].displayName)
            }
          }
          let thumbnails = await getRepeat(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userarr.toString()}&size=150x150&format=Png&isCircular=false`, 0, 15)
          for (let thumbnail in thumbnails.data) {
            createMember(namearr[thumbnail],thumbnails.data[thumbnail].targetId,thumbnails.data[thumbnail].imageUrl)
          }
        })();
      }
    }

    if (!removeGames) {
      let gamesCount = 0;
      let set = false
      let gamesCount2 = 0
      let originalGamesCount = 0;

      let universearr = [];
      let placearr = [];
      let namesarr = [];

      let thumbarr = [];
      let playersarr = [];
      let votesarr = [];

      async function setArrays() {
        for (let game in games.data) {
          placearr.push(games.data[game].rootPlace.id);
          universearr.push(games.data[game].id)
          namesarr.push(games.data[game].name)
        }
      }

      (async() => {

        await setArrays();
        let thumbdata = await getRepeat(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placearr.toString()}&size=150x150&format=Png&isCircular=false`, 0, 15);
        for (let thumb in thumbdata.data) {
          thumbarr.push(thumbdata.data[thumb].imageUrl)
        }
        let playerdata = await getRepeat("https://games.roblox.com/v1/games?universeIds=" + universearr.toString(), 0, 15);
        for (let player in playerdata.data) {
          playersarr.push(playerdata.data[player].playing)
        }
        let votesdata = await getRepeat("https://games.roblox.com/v1/games/votes?universeIds=" + universearr.toString(), 0, 15);
        for (let vote in votesdata.data) {
          votesarr.push(votesdata.data[vote].upVotes + "-" + votesdata.data[vote].downVotes)
        }
        for (let i = 0; i < placearr.length; i++) {
          console.log(gamesCount)
          if (gamesCount < 6) {
            originalGamesCount++;
            gamesCount++;
            createGame(placearr[i], thumbarr[i], namesarr[i], abbriviatePlayers(playersarr[i]), abbriviateRatings(parseInt(votesarr[i].split('-')[0]), parseInt(votesarr[i].split('-')[1])))
          } else if (!set) {
            set = true
            document.getElementsByClassName("pager-next")[0]?.childNodes[1]?.removeAttribute('disabled')
            $.watch('.pager-next', (next) => {
              next.click(() => {
                if (document.getElementsByClassName("pager-next")[0]?.childNodes[1]?.getAttribute('disabled') != null) return;
                //document.getElementsByClassName("pager-next")[0]?.childNodes[1]?.setAttribute('disabled', 'disabled')
                document.getElementsByClassName("pager-prev")[0]?.childNodes[1]?.removeAttribute('disabled')
                document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-games > div > div.container-header > div > ul > li:nth-child(2) > span").innerText = `Page ${parseInt(document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-games > div > div.container-header > div > ul > li:nth-child(2) > span").innerText.split(" ")[1]) + 1}`
                let elemlist = document.querySelectorAll(`[ng-repeat="game in games"]`)
                for (let i = 0; i < 6; i++) {
                  elemlist[i].remove()
                }
                for (let i = gamesCount; i < gamesCount + 6; i++) {
                  if (placearr[i] == null) {

                    document.getElementsByClassName("pager-next")[0]?.childNodes[1]?.setAttribute('disabled', 'disabled')
                    return
                  }
                  gamesCount2++;
                  createGame(placearr[i], thumbarr[i], namesarr[i], abbriviatePlayers(playersarr[i]), abbriviateRatings(parseInt(votesarr[i].split('-')[0]), parseInt(votesarr[i].split('-')[1])))
                }
                gamesCount = gamesCount + gamesCount2;
                gamesCount2 = 0;
              })
            });
            $.watch('.pager-prev', (prev) => {
              prev.click(() => {
                if (document.getElementsByClassName("pager-prev")[0]?.childNodes[1]?.getAttribute('disabled') != null) return;
                //document.getElementsByClassName("pager-prev")[0]?.childNodes[1]?.setAttribute('disabled', 'disabled')
                document.getElementsByClassName("pager-next")[0]?.childNodes[1]?.removeAttribute('disabled')
                document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-games > div > div.container-header > div > ul > li:nth-child(2) > span").innerText = `Page ${parseInt(document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-games > div > div.container-header > div > ul > li:nth-child(2) > span").innerText.split(" ")[1]) - 1}`
                let elemlist = document.querySelectorAll(`[ng-repeat="game in games"]`)
                for (let i = 0; i < 6; i++) {
                  if (elemlist[i] != null) {
                    elemlist[i].remove()
                  }
                }
                let trueCount = 0;
                if (gamesCount-6 >= 0) {
                  trueCount = gamesCount - 6;
                } else {
                  trueCount = 0;
                }
                let trueGamesCount = 0
                if (gamesCount < 6) {
                  trueGamesCount = 6;
                } else {
                  trueGamesCount = gamesCount
                }
                for (let i = trueCount; i < trueGamesCount; i++) {
                  console.log("Currently at index", i)
                  if (placearr[i] == null) {
                    document.getElementsByClassName("pager-prev")[0]?.childNodes[1]?.setAttribute('disabled', 'disabled')
                  } else {
                    gamesCount2++;
                    createGame(placearr[i], thumbarr[i], namesarr[i], abbriviatePlayers(playersarr[i]), abbriviateRatings(parseInt(votesarr[i].split('-')[0]), parseInt(votesarr[i].split('-')[1])))
                  }
                }
                gamesCount = gamesCount - gamesCount2;
                gamesCount2 = 0;
                if (document.querySelector("#group-container > div > div > div:nth-child(6) > div > div > div.ng-scope > div > group-games > div > div.container-header > div > ul > li:nth-child(2) > span").innerText == "Page 1") {
                  document.getElementsByClassName("pager-prev")[0]?.childNodes[1]?.setAttribute('disabled', 'disabled')
                  gamesCount = originalGamesCount
                }
              })
            })
          }
        }
      })();
    } else {
      document.querySelector(`[ng-if="library.currentGroup.areGroupGamesVisible"`).remove()
    }
  }
}