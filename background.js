const storage = chrome.storage.sync;
const hacpaiHost = 'https://hacpai.com';

function browser_notifications_create(id, options) {
    chrome.notifications.clear(id);  
    chrome.notifications.create(id, options);
}

// 定时任务
chrome.alarms.create("checkMsg", {periodInMinutes: 3});
chrome.alarms.create("autoMission", {periodInMinutes: 30});

chrome.alarms.onAlarm.addListener(function( a ){
    switch (a.name){
    case "checkMsg":
        checkMsg();
        break;
    case "autoMission":
        autoMission();
        break;
    }
});

// 通知设置
chrome.notifications.onClicked.addListener(function(notificationId){
    switch (notificationId){
        case "newMsg":
            clean_msg();
            break;
        case "autoMission":
            chrome.tabs.create({url: hacpaiHost + "/activity/checkin"});
            break;
    }
    chrome.notifications.clear(notificationId);
});

// 自动签到
function autoMission(){
    console.log("autoMission")
    storage.get(async function (response) {
        if( response.autoMission == new Date().getUTCDate() ){
            console.log('今天已经成功领取积分奖励了');
            return;
        }

        chrome.cookies.get({
            url : hacpaiHost,
            name : 'symphony'
        }, function(cookies) {
            if (cookies && cookies.value) {
                $.ajax({
                    url: hacpaiHost + "/activity/daily-checkin",
                    success: function(data){
                        var html = $.trim(data);
                        var signUrl = $(html).find('.btn.green').attr('href');
                        console.log('signUrl:'+signUrl)
                        var nowTime  =  new  Date();
                        $.ajax({
                            url: signUrl,
                            success: function(data){
                                var html = $.trim(data);
                                var code  =  $(html).find('.vditor-reset code:first').text();
                                storage.set( {"autoMission" : new Date().getUTCDate()} );
                                var msg = "签到成功！\n获得积分："+code+" \n签到时间："+nowTime.toLocaleTimeString();                          
                                browser_notifications_create(
                                    "autoMission" ,
                                    {
                                        type    : "basic",
                                        iconUrl : "icon/icon.png",
                                        title   : "HacpaiExtension 提醒您",
                                        message : msg,
                                    }
                                );
                                var msgShow = "获得积分："+code+" <br> 签到时间："+nowTime.toLocaleTimeString();     
                                storage.set( {"autoMissionSuccess" : msgShow} );
                            },
                            error: function(err){
                                console.log(nowTime.toLocaleTimeString()  +  " 签到请求失败\n"  +  err);
                            }
                        });
                    },
                    error: function(){
                        console.log("请求失败！");
                    }
                });
            }else{
                console.log('未登录')
            }
        });
    });

}


//清除通知图标，打开通知地址
function clean_msg(){
    chrome.browserAction.setBadgeText({
        text: ''
    });
    chrome.tabs.create({url: hacpaiHost + "/notifications/commented"});
    storage.set( {"unreadCount" : 0} );
}

chrome.browserAction.setBadgeBackgroundColor({
    color: '#FF2800',
});

chrome.browserAction.setBadgeTextColor &&
    chrome.browserAction.setBadgeTextColor({
        color: '#fff',
    });

// 消息通知
function checkMsg(){
    console.log("checkMsg")
    chrome.cookies.get({
        url : hacpaiHost,
        name : 'symphony'
    }, function(cookies) {
        if (cookies && cookies.value) {
            chrome.browserAction.setIcon({path: "icon/icon.png"});
            $.ajax({
                url: hacpaiHost + "/api/v2/notifications/unread/count",
                success: function(res){
                    if(res.sc == 0) {
                        var count = 0;
                        for(key in res.data) {
                            count += res.data[key];
                        }
                        storage.set( {"unreadCount" : count} );
                        if(count > 0) {
                            chrome.browserAction.setBadgeText({
                                text: count + ''
                            });
                            browser_notifications_create(
                                "newMsg" ,
                                {
                                    type       : "basic",
                                    iconUrl    : "icon/icon.png",
                                    title      : "HacpaiExtension 提醒您",
                                    message    : "您有"+count+"条未读新消息，点击查看。"
                                });
                        }
                    }else{
                        console.log("请求失败！ " + res.msg);
                    }   
                },
                error: function(){
                    console.log("请求失败！");
                }
            });
        }else{
            chrome.browserAction.setIcon({path: "icon/icon_nologin.png"});
            console.log('未登录')
        }
    });
}
