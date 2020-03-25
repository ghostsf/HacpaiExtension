const storage = chrome.storage.sync;

storage.get(function (response) {
    if( response.autoMission == new Date().getUTCDate() ){
        $('#checkInText').text(response.autoMissionSuccess);
        $('#checkInShow').show();
    }else{
        $('#checkInShow').hide();
    }
    if(Number(response.unreadCount)&&response.unreadCount > 0){
        $('#unreadCount').text(response.unreadCount);
        $('#unreadClick').click(function(){
            chrome.browserAction.setBadgeText({
                text: ''
            });
            storage.set( {"unreadCount" : 0} );
            chrome.tabs.create({url: "https://hacpai.com/notifications/commented"});
        });
        $('#unread').show();
    }else{
        $('#unread').hide();
    }
});

