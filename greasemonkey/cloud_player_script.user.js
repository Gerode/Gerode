// ==UserScript==
// @name Cloud Player Script
// @namespace https://github.com/Gerode
// @require https://images-na.ssl-images-amazon.com/images/G/01/browser-scripts/dmusic_3rdparty/dmusic_3rdparty-gmin-3424829030._V1_.js
// @require cloud_player_playlist.js
// @include https://www.amazon.com/gp/dmusic/*
// @grant       none
// ==/UserScript==

/**
 * Loads an M3U playlist from a @required file, then creates an Amazon Cloud Player playlist, GUI robot-style
 */
var songlist = [];
var playlistName = "Shuffle";

// Parse M3U into array
for (key in playlist) {
    if (playlist[key].substring(0, 7) == '#EXTINF') {
        songlist.push(playlist[key].split(',').slice(1).join(","));
    }
}

// Wait for initial titleList to load
setTimeout(function() {scrollThrough(-1)}, 10000);


function scrollThrough(lastScrollTop) {
        
        addToPlaylist();
        
        scrollToNextPage(lastScrollTop);
}

function scrollToNextPage(lastScrollTop) {
    if (lastScrollTop != jQuery('.bodyContainer').scrollTop()) {
        lastScrollTop = jQuery('.bodyContainer').scrollTop();
        
        checkSongs();
        
        jQuery('.bodyContainer').scrollTop(lastScrollTop + 1400);
        setTimeout(function(){scrollThrough(lastScrollTop);}, 3000);
    }
    else {
        addToPlaylist();
        alert("Missing songs: " + songlist.slice(0,20));
    }
}

function checkSongs() {
    for (key in songlist) {
        try {
            var songTokens = songlist[key].split(" - ");
            var artist = songTokens[0];
            var title = songTokens.slice(1).join(" - ");
            var song = jQuery('[itemtype="song"]').has('.artistCell[title="'+artist+'"]').has('.titleCell[title^="'+title+'"]');
            if (song.length > 0) {
                externalClick(song.find('.checkbox'));
                songlist.splice(key, 1);
            }
        } catch (e) {
            alert(songTokens + ": " + e);
        }
    }
}

function addToPlaylist(callback) {
    // load "Add to playlist" dropdown menu
    var addPlaylist = jQuery('.actionButtons [multiactionname="Add to playlist"]');
    // sometimes clicking this with nothing checked will add 500 songs
    if (addPlaylist.length > 0 && jQuery('[itemtype="song"]').find('.checkbox').filter(':checked').length > 0) {
    
        //separate the two clicks, to prevent Firefox crashes
        setTimeout(function() {
            // click playlist entry
            var playlist = jQuery('#optionPanel').find('a[href^="#playlistManager/addTo"]:contains(' + playlistName + ')');
                if (playlist.length > 0) {
                    // Add to Playlist
                    externalClick(playlist);
                }
                else {
                    // Navigate New Playlist dialog
                    externalClick(addPlaylist);
                    jQuery('#newPlaylistName').val(playlistName);
                    externalClick(jQuery('#savePlaylistDialog'));
                }
            }, 250);
    }
}

//http://stackoverflow.com/questions/8493878/greasemonkey-error-when-attempting-click-event
function externalClick(button) {
    //song.find('.checkbox').click();
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent ('click', true, true);
    button[0].dispatchEvent (clickEvent);
}