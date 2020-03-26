const storage = chrome.storage.sync;
const hacpaiHost = 'https://hacpai.com';
const config = {
    checkCookiesTimeout: 1,
    checkMsgTimeout: 3,
    autoMissionTimeout: 30
};

function browser_notifications_create(id, options) {
    chrome.notifications.clear(id);  
    chrome.notifications.create(id, options);
}

// 定时任务
chrome.alarms.create("checkCookies", {periodInMinutes: config.checkCookiesTimeout});
chrome.alarms.create("checkMsg", {periodInMinutes: config.checkMsgTimeout});
chrome.alarms.create("autoMission", {periodInMinutes: config.autoMissionTimeout});

chrome.alarms.onAlarm.addListener(function( a ){
    switch (a.name){
    case "checkCookies":
        checkCookies();
        break;
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

function iconSet(isLoginOld,isLoginNew){
    if(!isLoginOld&&isLoginNew){
        chrome.browserAction.setIcon({path: "icon/icon.png"});
        browser_notifications_create(
            "loginSuccess" ,
            {
                type    : "basic",
                iconUrl : "icon/icon.png",
                title   : "HacpaiExtension 提醒您",
                message : '🎉登录成功！',
            }
        );
    }
    if(isLoginOld&&!isLoginNew){
        chrome.browserAction.setIcon({path: "icon/icon_nologin.png"});
    }
}

// 检测cookies
function checkCookies(){
    chrome.cookies.get({
        url : hacpaiHost,
        name : 'symphony'
    }, function(cookies) {
        if (cookies && cookies.value) {
            storage.get('isLogin',(result)=>{iconSet(result.isLogin,true)});
            storage.set( {"isLogin" : true} );
        }else{
            storage.get('isLogin',(result)=>{iconSet(result.isLogin,false)});
            storage.set( {"isLogin" : false} );
        }
    });
}

// 自动签到
function autoMission(){
    storage.get(function (response) {
        if(response.autoMission == new Date().getUTCDate()){
            return;
        }
        if(response.isLogin){
            $.ajax({
                url: hacpaiHost + "/activity/daily-checkin",
                success: function(data){
                    var html = $.trim(data);
                    var signUrl = $(html).find('.btn.green').attr('href');
                    console.debug('signUrl:'+signUrl)
                    var nowTime  =  new  Date();
                    $.ajax({
                        url: signUrl,
                        success: function(data){
                            var html = $.trim(data);
                            var codeArr  =  $($(html).find('div.vditor-reset')).children('code');
                            console.debug(codeArr);
                            var code = $(codeArr[0]).text();
                            if(codeArr.length > 2){
                                var extraCode = $(codeArr[1]).text();
                            }  
                            var msg = "🎉签到成功！\n获得积分："+code+"\n签到时间："+nowTime.toLocaleTimeString();
                            if(extraCode){
                                msg = "🎉签到成功！\n获得积分："+code+"+"+extraCode+"\n签到时间："+nowTime.toLocaleTimeString();
                            }
                            storage.set( {"autoMission" : new Date().getUTCDate()} );                  
                            browser_notifications_create(
                                "autoMission" ,
                                {
                                    type    : "basic",
                                    iconUrl : "icon/icon.png",
                                    title   : "HacpaiExtension 提醒您",
                                    message : msg,
                                }
                            );
                            var msgShow = "获得积分："+code+"，签到时间："+nowTime.toLocaleTimeString();
                            if(extraCode){
                                msgShow = "获得积分："+code+"，额外获得积分："+extraCode+"，签到时间："+nowTime.toLocaleTimeString();
                            }     
                            storage.set( {"autoMissionSuccess" : msgShow} );
                        },
                        error: function(err){
                            console.error(nowTime.toLocaleTimeString()  +  " 签到请求失败\n"  +  err);
                        }
                    });
                },
                error: function(err){
                    console.error("请求失败！"+err);
                }
            });
        }
    });

}


//清除通知图标，打开通知地址
function clean_msg(){
    chrome.browserAction.setBadgeText({
        text: ''
    });
    chrome.tabs.create({url: hacpaiHost + "/notifications"});
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
    storage.get(function (response) {
        if(response.isLogin){
            $.ajax({
                url: hacpaiHost + "/api/v2/notifications/unread/count",
                success: function(res){
                    if(res.sc == 0) {
                        var count = res.data.unreadNotificationCnt;
                        if(count > 0 && response.unreadCount!=count) {
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
                        storage.set( {"unreadCount" : count} );
                    }else{
                        console.error("请求失败！ " + res.msg);
                    }   
                },
                error: function(err){
                    console.error("请求失败！"+err);
                }
            });
        }
    });
}
