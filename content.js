// 双击回到顶部
chrome.storage.sync.get(function(response) {
    if (response.dblclickToTop){
        $("body").dblclick(function () {
            window.getSelection().removeAllRanges();
            $("html, body").animate({scrollTop: 0}, 300);
        });
    }
});