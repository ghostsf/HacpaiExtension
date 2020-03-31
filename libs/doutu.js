$(function () {
  addDoutuBtn()
})

var doutuKeyword = ""
var doutuPage = 1

function addDoutuBtn() {

  let btn = $('<button class="green fn__right" id="doutuBtn">斗图</button>')
  $(btn).click(function () {
    showPop(true)
  })
  $(btn).appendTo($('.chats__input .fn__clear'))
  addDoutuView()
}

function addDoutuView() {
  let popBg = $('<div id="popBg" class="none"/>')
  $(popBg).appendTo($('body'))
  $(popBg).click(function () {
    showPop(false)
  })

  let popView = $('<div id="doutuView" class="doutuView default"></div>')
  let doutuInputView = $('<div id="doutuInputView"><input id="doutuInput"/><button id="searchBtn" class="green">搜索</button></div>')
  doutuInputView.appendTo(popView)
  $(popView).appendTo($('body'))

  let result = $('<div id="result"></div>')
  result.appendTo(popView)

  let pageView = $('<div id="pageDiv"></div>')
  let preBtn = $('<button id="preBtn" class="green">上一页</button>')
  let numSpan = $('<span id="num">1</span>')
  let nextBtn = $('<button id="nextBtn" class="green">下一页</button>')
  pageView.append(preBtn, numSpan, nextBtn)
  pageView.appendTo(popView)

  $('#searchBtn').click(function () {
    doutuKeyword = $('#doutuInput')[0].value
    doutuPage = 1
    search()
  })
  $('#preBtn').click(function () {
    doutuPage--
    if (doutuPage < 1) {
      doutuPage = 1
      alert("都第1页了还往前翻！！")
      return
    }
    search()
  })
  $('#nextBtn').click(function () {
    doutuPage++
    search()
  })

}

function showPop(type) {
  let animationClass = type
    ? "popShow"
    : "popHide";
  let animation = function () {
    $('#popBg').attr('class', 'popBg ' + animationClass);
    $('#doutuView').attr('class', 'doutuView ' + animationClass);
  }
  setTimeout(animation, 100);
}

function search() {
  if (doutuKeyword.length == 0) {
    alert("你不给关键词我怎么搜？？？")
    return
  }
  sedRequest()
  //sedRequestSougou()
  return
  //使用background请求，下面的没用了
  $.ajax({
    url: 'https://www.doutula.com/api/search?keyword=' + doutuKeyword + '&page=' + doutuPage,
    dataType: 'json',
    success: function (data) {
      $('#result').empty()
      if (data.status == 1) {
        if (data.data.list.length == 0) {
          let noImg = $("<div>找不到了啊</div>")
          noImg.appendTo($('#result'))
        } else {
          data.data.list.forEach((e) => {
            let imgString = '<div class="doutuItem"><img referrerpolicy="no-referrer" src=' + e.image_url + '  class="doutuImg" /></div>'
            let item = $(imgString)
            item.click(function () {
              addToArea("![" + doutuKeyword + "](" + e.image_url + ")")
              showPop(false)
            })
            item.appendTo($('#result'))
          })
        }
      } else {
        alert("我能怎么办，我也找不到啊！！")
      }
      $('#num')[0].innerHTML = doutuPage
    }
  })
}

function addToArea(content) {

  let area = $(".vditor-textarea")[0]

  //area.value = area.value + content

  area.innerHTML = area.innerHTML + '<span>' + content + '</span><span><br><span style="display:none"></span></span>'

}


function addToAreaV1(keyword, imgUrl) {
  console.log('addToAreaV1')
  console.log(keyword +"," +imgUrl)

  let area = $(".vditor-content .vditor-textarea")[0]
  //area.value = area.value + content
  //编辑模式
  let content = "![" + doutuKeyword + "](https://www.stackoverflow.wiki/getImage.do?src=" + imgUrl + ")"
  area.innerHTML = area.innerHTML + '<span>' + content + '</span><span><br><span style="display:none"></span></span>'

  //所见即所得模式
  let inputArea = $('.vditor-content .vditor-wysiwyg .vditor-reset')[0]
  let imgString = '<p><img src="https://www.stackoverflow.wiki/getImage.do?src=' + imgUrl + '" alt="' + keyword + '"></p>'
  let bqImg = $(imgString)

  console.log(bqImg)
  bqImg.appendTo(inputArea)
}



function sedRequest() {
  var chromeRuntime = chrome.runtime||chrome.extension;
  chromeRuntime.sendMessage(
    { contentScriptQuery: "getImg", doutuKeyword: doutuKeyword, doutuPage: doutuPage },
    data => {
      console.log(data);
      //data = JSON.parse(data)
      $('#result').empty()
      if (data.code == 0) {
        if (data.result.length == 0) {
          let noImg = $("<div>找不到了啊</div>")
          noImg.appendTo($('#result'))
        } else {
          data.result.forEach((e) => {

            let imgContent = '<img referrerpolicy="no-referrer"  class="doutuImg"  />'
            let img = $(imgContent)

            let imgString = '<div class="doutuItem"></div>'
            let item = $(imgString)

            let sizeString = '<div></div>'
            let size = $(sizeString)

            img[0].onload = function () {
              setSize(img, size)
            }
            img[0].src = e.image_url

            img.appendTo(item)
            size.appendTo(item)
            item.click(function () {

              addToAreaV1(doutuKeyword, e.image_url)


              //addToArea("![" + doutuKeyword + "](https://www.stackoverflow.wiki/getImage.do?src=" + e.image_url + ")")
              showPop(false)
            })
            item.appendTo($('#result'))
          })
        }
      } else {
        alert("我能怎么办，我也找不到啊！！")
      }
      $('#num')[0].innerHTML = doutuPage
    }
  )
}

function setSize(img, content) {

  content[0].innerHTML = img[0].naturalWidth + "x" + img[0].naturalHeight

}
