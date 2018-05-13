apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};
  try {var user_login_status = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'}));} catch (e) {console.log(JSON.stringify(e));};
  var info_id = api.pageParam.id;

  jq(function(){
    //必须有要查看用户信息的id，一切信息都根据这个id来的，所有跳转到这个页面必须要传递id
    /*请求数据*/
    (function(){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/"+info_id+"/user-center",
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }

        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){

            var data = rep.response;

            /*设置用户头像*/
            if(data.image !== null){
              jq('.user_info_image').css({"background-image": "url('http://47.104.73.41"+data.image+"')"});
              jq('#chat_btn').attr('user_img',data.image);
            }else{
              jq('.user_info_image').css({"background-image": "url('../image/icon/noimage.png')"});
            }





            /*设置用户名称*/
            jq('.user_info_name').text(data.name);
            jq('#chat_btn').attr('user_name',data.name);
            jq('#chat_btn').attr('user_id',info_id);
            /*设置用户手机号*/
            jq('.user_info_phone').text(data.mobile);

            /*设置用户描述*/
            if(data.user_center === null || data.user_center.description === null || data.user_center.description === '' || data.user_center.description === undefined){
              jq('.user_info_body_describe').text('此用户太懒了，什么都没写....');
            }else{
              jq('.user_info_body_describe').text(data.user_center.description);
            }

            /*设置积分和是否认证*/
            if(data.user_info === null){
              jq('#user_service_fen').text('服务积分：无数据' );
              jq('#user_entrust_fen').text('委托积分：无数据');
              jq('#user_isAuthentication').text('无数据');
            }else{
              var service_fen = parseFloat(data.user_info.serve_points);
              var entrust_fen = parseFloat(data.user_info.assign_points);
              var is_renzheng = data.user_info.status;

              if(service_fen === 0){jq('#user_service_fen').text('服务积分：' +(service_fen));}else{jq('#user_service_fen').text('服务积分：' +(service_fen / 100));}
              if(entrust_fen === 0){jq('#user_entrust_fen').text('委托积分：' +(entrust_fen));}else{jq('#user_entrust_fen').text('委托积分：' +(entrust_fen / 100));}

              if(is_renzheng === 'unauthenticated'){
                jq('#user_isAuthentication').text('未认证');
                jq('#user_isAuthentication').removeClass('aui-label-success');
                jq('#user_isAuthentication').addClass('aui-label-danger');
              }else{
                jq('#user_isAuthentication').text('已认证');
              }
            }


            /*设置我擅长的领域*/
            if(data.userTalents === undefined || data.userTalents === null || data.userTalents === ''){
              jq('.user_talents_container').html('<div style="color:#c0c0c0;font-size:14px;">还未设置擅长领域</div>');
            }else{
              var data_arr = data.userTalents;
              for(var i = 0; i < data_arr.length;i++){
                var div = jq('<div class="user_talents_biaotian aui-label aui-label-info aui-label-outlined">'+data_arr[i]+'</div>');
                jq('.user_talents_container').append(div);
              }
            }


            /*设置展示图片，轮播那种*/
            if(data.user_center === null || data.user_center === undefined){
              jq('.user_exhibition_img_list').html('<div style="text-indent:1em;color:#c0c0c0;font-size:14px;">没有展示任何照片/图片</div>');
            }else{
              if(data.user_center.images === null){
                jq('.user_exhibition_img_list').html('<div style="text-indent:1em;color:#c0c0c0;font-size:14px;">没有展示任何照片/图片</div>');
              }else{
                var img_list_str = data.user_center.images;
                var img_list = img_list_str.replace(/[\\\"\[\]]{1,}/g,'');
                if(img_list.indexOf(',') === -1){
                  var _img = jq('<img src="'+img_list+'"/>');
                  jq('.user_exhibition_img_list').append(_img);
                }else{
                  var img_list_arr = img_list.split(',');
                  for(var i = 0; i < img_list_arr.length;i++){
                    var _img = jq('<img src="'+img_list_arr[i]+'" />');
                    jq('.user_exhibition_img_list').append(_img);
                  }
                }
              }
            }

          }
        });
    })();

    //沟通按钮点击事件
    (function(){
      jq('#chat_btn').on('click',function(){
        console.log(jq().attr('user_img'));
        var from_id = jq(this).attr('user_id');
        var from_img = jq(this).attr('user_img');
        var from_name = jq(this).attr('user_name');
        console.log(user_login_status.user_id);
        if(parseFloat(user_login_status.user_id) === parseFloat(from_id)){
          toast.fail({
              title:"不能与自己聊天",
              duration:4000
          });
        }else{
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
        }

      });
    })();

    //查看评价按钮
    (function(){
      jq('.check_comment_btn').on('click',function(){
        api.openWin({
            reload:true,
            slidBackEnabled:false,
            softInputMode:'auto',
            name: 'userEvaluateView',
            url: '../html/userEvaluateView.html',
            pageParam: {chak_id:info_id}
        });
      });
    })();

    //返回上一页
    jq('#page_header_return').on('click',function(){api.closeWin();});
  });
}
