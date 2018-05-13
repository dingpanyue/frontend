apiready = function(){

  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  api.addEventListener({
      name: 'reloadThisWin'
  }, function(ret, err){
      api.closeWin();
  });

  //监听通讯页面的返回发送的刷新本页面的事件

  api.addEventListener({
      name: 'runList'
  }, function(ret, err){
      if( ret ){
          window.location.reload();
      }else{
          console.log( JSON.stringify( err ) );
      }
  });



  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  jq(function(){


    //渲染聊天列表函数
    function renderChatList(){

      //取缓存from_msg

      api.getPrefs({
          key: 'from_msg'
      }, function(ret, err){
          if( ret ){
            if(ret.value === ''){
              var htmlStr = '<div class="no_chat_content">没有聊天信息哦</div>';
              getIdDom('app-contacts-ul').innerHTML = htmlStr;
            }else{
              var from_msg = JSON.parse(ret.value);
              //拼接html字符串

              var div = jq('<div></div>');

              for(var i = 0;i < from_msg.length;i++){
                var _total_str = '';

                if(parseFloat(from_msg[i].total) === 0){
                  _total_str = '<div id="new_news'+from_msg[i].fromId+'" style="display:none;"></div>';
                }else{
                  _total_str = '<div id="new_news'+from_msg[i].fromId+'" class="new_news_style">'+from_msg[i].total+'</div>';
                }
                var htmlStr = '<li class="aui-list-item aui-list-item-middle app-chatRoom-list-li">'+
                    '<div class="aui-media-list-item-inner">'+
                        '<div class="aui-list-item-media" style="width: 3rem;">'+
                            '<img src="http://47.104.73.41'+from_msg[i].imgUrl+'" class="aui-img-round aui-list-img-sm">'+
                        '</div>'+
                        '<div class="aui-list-item-inner aui-list-item-arrow">'+
                            '<div class="aui-list-item-text">'+
                                '<div class="aui-list-item-title aui-font-size-14">'+from_msg[i].fromName+'</div>'+
                                '<div class="aui-list-item-right">'+from_msg[i].time+'</div>'+
                            '</div>'+
                            '<div class="aui-list-item-text" id="app-contacts-news">'+
                                '<div style="color:#c0c0c0;" class="aui-list-item-title aui-font-size-12">'+from_msg[i].msg+'</div>'+
                                '<div class="aui-list-item-right">'+_total_str+'</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                    '<div id="'+from_msg[i].fromId+'" class="list-item-mask" imgUrl="'+from_msg[i].imgUrl+'" fromName="'+from_msg[i].fromName+'"></div>'+
                '</li>';

                div.prepend(htmlStr);
              }
              jq('#app-contacts-ul').html(div);

            }
          }else{
               console.log('取缓存出错');
          }
      });
    }

    //默认先执行一遍渲染函数，之后再次执行就是ws收到消息会执行
    renderChatList();



    api.addEventListener({name:'wsReceivedUserMsg'},function(ret, err){renderChatList();});



    /*聊天信息列表点击事件*/
    (function(){

      getIdDom('app-contacts-ul').addEventListener('click',function(e){

        /*当ul被点击的时候应该去获取当前li下的用户名*/
        var from_id = e.target.id;
        var from_img = e.target.getAttribute('imgUrl');
        var from_name = e.target.getAttribute('fromName');


        var __from_msg_str = api.getPrefs({
            sync: true,
            key: 'from_msg'
        });
        var __from_msg = JSON.parse(__from_msg_str);
        for(var i = 0;i < __from_msg.length;i++){
          if(parseFloat(__from_msg[i].fromId) === parseFloat(from_id)){
            __from_msg[i].total = 0;
            setLocalMsg('from_msg',__from_msg);
            renderChatList();
          }
        }
        api.openWin({
            reload:true,
            slidBackEnabled:false,
            softInputMode:'auto',
            name: 'chatRoomUser',
            url: '../html/chatRoomUser.html',
            pageParam: {
                from_id:from_id,
                from_img:from_img,
                from_name:from_name
            }
        });




      },true);


    }());


    /*点击去系统消息界面*/
    jq('.system_msg_container').on('click',function(){
      api.openWin({
          reload:true,
          slidBackEnabled:false,
          softInputMode:'auto',
          name: 'system_msg_list',
          url: '../html/system_msg_list.html'
      });
    });





    function getUserMsg(number,id,callback){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/"+id+"/messages?page=1&per_page=" + number,
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (rep) {
        if(rep.message === 'success'){
          callback(rep.response.data);
        }
      });
    }







    jq('.app-goIndex').on('click',function(){api.closeWin();});
  });
}
