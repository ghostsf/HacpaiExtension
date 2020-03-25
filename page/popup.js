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
            chrome.tabs.create({url: "https://hacpai.com/notifications/commented"});
            storage.set( {"unreadCount" : 0} );
        });
        $('#unread').show();
    }else{
        $('#unread').hide();
    }
});

