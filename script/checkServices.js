apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  jq(function(){
    jq('.select_pay_method_mask').height(win_height);
    jq('.user_pay_pasw_mask').height(win_height);
    //具体的应用操作
    //首先就是渲染页面信息
    var from_msg = api.pageParam;
    var from_id = from_msg.user_id;
    var from_order_id = from_msg.oeder_id;
    var from_name = from_msg.user_name;
    var from_img = from_msg.user_img;
    // /*渲染页面*/
    (function(){
      //先请求具体的数据
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/"+from_order_id+"/detail",
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token
        }
      }
      //渲染页面
      jq.ajax(settings).done(function (rep) {
        if(rep.message === 'success'){

          var data = rep.response;
          //图片是否未null，不为null则实例化这个轮播
          if(data.images === null){
            jq('#server_focus_wrapper').append('<div class="swiper-slide"><img src="../image/userImg/morenserver.png" /></div>');
          }else{

            //处理图片路径问题
            var img_str = data.images;
            var img_arr = img_str.split(',');

            for(var i = 0;i < img_arr.length;i++){
              img_arr[i] = img_arr[i].replace(/[\\\"\[\]]{1,}/g,'');

              var html_str = '<div class="swiper-slide">' +
                '<img src="'+img_arr[i]+'" />' +
              '</div>';

              jq('#server_focus_wrapper').append(html_str);


            }


            instantiationServerFocus();
          }

          //转换经纬度
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/regions/"+data.province_id+"/cities",
            "method": "GET",
            "headers": {
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (reps) {
            if(reps.message === 'success'){
              var obj = reps.response;
              jq('#server_user_address').text(obj[data.city_id]);
            }else{
              console.log('获取市出错');
            }
          });

          //开始填充数据
          jq('#server_user_img').attr('src','http://47.104.73.41' + data.user.image);
          jq('#server_user_img').attr('info_id',from_id);

          jq('#server_user_name').text(data.user.name);

          jq('#server_user_time').text((data.created_at).slice(0,10));

          jq('#server_user_content').text(data.introduction);






        }else{
          console.log('请求委托详情失败');
        }
      });

    })();

    //是否实例化轮播
    function instantiationServerFocus(){
      var server_focus = new Swiper ('#server_focus', {
        autoplay:true,
        loop: true,
        autoHeight:true,
        effect:'flip',
        height:230,
        speed:300,
        pagination: {
          el: '.swiper-pagination',
        },
        autoplay: {
          delay:5000
        }
      });
    }

    //点击头像去info页面
    jq('#server_user_img').on('click',function(e){
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


    //聊天按钮
    (function(){
      jq('.services_chat_btn').on('click',function(){
        var this_id = JSON.parse(api.getPrefs({
            sync: true,
            key: 'user_login_status'
        })).user_id;

        if(parseFloat(from_id) === parseFloat(this_id)){
          toast.fail({title:'不能和自己聊天',duration:4000});
        }else{
          api.openWin({
              name: 'chatRoomUser',
              slidBackEnabled:false,
              url: '../html/chatRoomUser.html',
              pageParam: {
                  from_id: from_id,
                  from_name:from_name,
                  from_img:from_img
              }
          });

        }


      });
    })();
    //返回上一页
    jq('.page_header_return').on('click',function(){api.closeWin();})
  });
}
