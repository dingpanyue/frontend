apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  //全局用户登录信息缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  jq(function(){

    //资料设置页面上传头像后刷新页面自定义事件监听
    api.addEventListener({
        name: 'materialSettingsSendImg'
    }, function(ret, err){
        if( ret ){
             window.location.reload();
        }else{
             console.log( JSON.stringify( err ) );
        }
    });


    //设置页面基本显示信息
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/self/info",
      "method": "GET",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer " + token,
        "Cache-Control": "no-cache"
      }
    }

    jq.ajax(settings).done(function (res) {
      if(res.message === 'success'){
        var data = res.response;
        //设置用户头像
        var img_url = '';
        if(data.image === null || data.image === '' || data.image === undefined){img_url = '../image/icon/noimage.png'}else{
          img_url = 'http://47.104.73.41' + data.image;
        }
        jq('.user_info_panel_img img').attr('src',img_url);
        jq('.user_info_panel_img img').attr('info_id',data.id);

        //设置用户昵称
        jq('.user_info_panel_name').text(data.name);

        //设置用户手机号
        jq('.user_info_panel_number').text(data.mobile);

        //设置用户信用
        //★★★★★
        (function(){
          if(data.user_info === null){
            jq('.user_info_panel_credit_span').text('★');
          }else{
            var credit_num = parseInt(data.user_info.assign_points / 1000);
            var credit_str = '';
            for(var i = 0;i <= credit_num;i++){
              credit_str += '★';
            }
            jq('.user_info_panel_credit_span').text(credit_str);
          }
        })();

        //设置用户是否认证
        var user_status = '';
        if(data.user_info === null || data.user_info.status === null){
          user_status = 'unauthenticated';
        }else{
          user_status = 'authenticated';
        }
        if(user_status === 'authenticated'){jq('.user_info_panel_realName').text('已认证');}
        if(user_status === 'unauthenticated'){jq('.user_info_panel_realName').text('未认证');}


      }else{
        console.log('获取自身信息请求出错');
      }

    });

    //点击头像跳转个人信息页面
    jq('.user_info_panel_img').on('click',function(e){
      var _id = jq(e.target).attr('info_id');
      if(_id !== undefined){

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

    /*钱包跳转事件*/
    //isWhetherJump
    jq('.operation_btn_wallet').on('click',function(){
      api.openWin({
          name: 'myWellet',
          slidBackEnabled:false,
          bounces:false,
          reload:true,
          url: '../html/myWellet.html'
      });
    });

    /*聊天消息事件*/
    jq('.operation_btn_news').on({
      click:function(){
        api.openWin({
            name: 'chatRoom',
            slidBackEnabled:false,
            bounces:false,
            reload:true,
            url: '../html/chatRoom.html'
        });
      }
    });

    /*实名认证事件*/
    jq('.operation_btn_authentication').on('click',function(){
      api.openWin({
          name: 'authentication',
          slidBackEnabled:false,
          bounces:false,
          reload:true,
          url: '../html/authentication.html'
      });
    });

    /*个人展示事件*/
    jq('.operation_btn_infoView').on('click',function(){
      api.openWin({
          name: 'userInfoEdit',
          slidBackEnabled:false,
          bounces:false,
          reload:true,
          url: '../html/userInfoEdit.html'
      });
    });

    /*资料设置事件*/
    jq('.operation_btn_info').on('click',function(){
      api.openWin({
          name: 'materialSettings',
          slidBackEnabled:false,
          bounces:false,
          reload:true,
          url: '../html/materialSettings.html'
      });
    });

    /*关于事件*/
    jq('.operation_btn_about').on('click',function(){
      api.openWin({
          name: 'appAbout',
          slidBackEnabled:false,
          bounces:false,
          reload:true,
          url: '../html/appAbout.html'
      });
    });



  });

}
