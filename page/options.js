function saveChoice(e) {
    let name = e.target.id;
    let checked = e.target.checked;
    let value;
    value = checked ? 1 : 0;
    setItemByKey(name, value);
}

function setItem(obj) {
    chrome.storage.sync.set(obj);
    chrome.storage.local.set(obj);
}

function setItemByKey(key, value) {
    let obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj);
    chrome.storage.local.set(obj);
}

function getItem(obj, callback) {
    chrome.storage.sync.get(obj, callback);
}

/*
    * 所有设置
    * 消息提醒 默认开启
    * 自动签到 默认开启
    * 双击返回顶部 默认关闭
*/
const defaultSettings = {
    "newMsg": 1,
    "dblclickToTop": 0,
    "autoMissionSet": 1,
};

window.onload = function () {
    const settingButtons = {
        newMsg: document.getElementById("newMsg"),
        autoMissionSet: document.getElementById("autoMissionSet"),
        dblclickToTop: document.getElementById("dblclickToTop")
    };

    function resetAll() {
        setItem(defaultSettings);
        location.reload();
    }

    // Show saved settings
    function restoreSetting() {
        getItem(defaultSettings, (settings) => {
            for (let name in settings) {
                let value = settings[name];
                let button = settingButtons[name];
                let checked = true;
                checked = !!parseInt(value);
                setItemByKey(name, parseInt(value));
                button.checked = checked;
                button.onchange = saveChoice;
                button.disabled = false;
            }
        });
    }

    document.getElementById("shortcuts").onclick = function(){
        chrome.tabs.create({url: "chrome://extensions/shortcuts"});
    };

    restoreSetting();
};
