apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  api.parseTapmode();
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};
  jq(function(){
    //请求数据
    (function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/recommend-users",
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (rep) {
        if(rep.message === 'success'){
          //设置列表
          var data = rep.response;
          for(var i = 0;i < data.length;i++){
            var li = jq('<li></li>');
            var _img = jq('<img info_id="'+data[i].id+'" src="http://47.104.73.41'+data[i].image+'">');
            var _p = jq('<p>'+data[i].name+'</p>');
            li.append(_img);
            li.append(_p);
            jq('.entrust_recommend_list').append(li);
          }

        }
      });
    })();

    //头像点击事件
    jq('.entrust_recommend_list').on('click',function(e){
      if(jq(e.target).attr('info_id') !== undefined){
        var _id = jq(e.target).attr('info_id');
        api.openWin({
            name: 'checkUserInfo',
            slidBackEnabled:false,
            reload:true,
            url: '../html/checkUserInfo.html',
            pageParam: {
                id:_id
            }
        });
      }
    });

    //顶部返回按钮
    jq('#close_page').on('click',function(){
      api.closeWin();
    });
  });
}
