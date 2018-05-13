apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};



  jq(function(){
    jq('.entrust_img_big_container').height(win_height);

    //具体的应用操作
    //首先就是渲染页面信息
    var from_msg = api.pageParam;

    var from_id = from_msg.user_id;
    var from_order_id = from_msg.oeder_id;
    var from_name = from_msg.user_name;
    var from_img = from_msg.user_img;
    console.log(from_order_id);

    //请求数据
    (function(){
      var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/"+from_order_id+"/detail",
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

            //图片是否未null，不为null则实例化这个轮播
            if(data.images === null){
              jq('#xuqiu_focus_wrapper').append('<div class="swiper-slide"><img src="../image/userImg/morenserver.png" /></div>');
            }else{

              //处理图片路径问题
              var img_str = data.images;
              var img_arr = img_str.split(',');

              for(var i = 0;i < img_arr.length;i++){
                img_arr[i] = img_arr[i].replace(/[\\\"\[\]]{1,}/g,'');

                var html_str = '<div class="swiper-slide">' +
                  '<img src="'+img_arr[i]+'" />' +
                '</div>';

                jq('#xuqiu_focus_wrapper').append(html_str);


              }


              instantiationServerFocus();
            }

            //设置需求标题
            jq('.xuqiu_title').text(data.title);

            //设置需求内容
            jq('.xuqiu_xiangqing').text(data.introduction);

            //设置需求类型
            jq('.xuqiu_type_span').text(data.tags.join(' '));

            //设置需求金额
            jq('.xuqiu_money_span').text(data.reward);

            //设置发布人头像 fabu_people_msg_img
            var userData = data.user;
            var user_img_url = userData.image;
            if(user_img_url === null){user_img_url = '../image/icon/noimage.png';}else{user_img_url = 'http://47.104.73.41' + userData.image}
            jq('.fabu_people_msg_img img').attr('src',user_img_url);
            jq('.fabu_people_msg_img img').attr('info_id',userData.id);

            //设置用户名
            jq('.user_name').text(userData.name);

            //设置发布日期
            jq('.user_release_time').text(data.created_at);

            //设置详细地址
            jq('.xiangxi_dizhi_span').text(data.detail_address);

            //设置过期时间
            jq('.guoqi_time_span').text(data.deadline);

            //设置信誉度
            var credit_num = parseInt(userData.user_info.assign_points / 1000);
            var credit_str = '';
            for(var i = 0;i <= credit_num;i++){
              credit_str += '★';
            }
            jq('.user_reputation').text(credit_str);

            //设置订单状态
            jq('.user_order_state').text(data.status);


            //转换经纬度
            //设置用户发布的城市
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
                //设置用户发布的城市
                jq('.user_city').text(obj[data.city_id])

              }else{
                console.log('获取市出错');
              }
            });

          }else{console.log('请求委托详情失败');}
      });

    })();

    //接受委托
    (function(){
      jq('.caozuo_btn_accept').on('click',function(){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/accept/" + from_order_id,
          "method": "POST",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }

        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            toast.success({title:"接受成功,您可以去订单中查看！",duration:4000});
          }else{
            toast.fail({title:rep.message,duration:4000});
          }
        });
      });
    })();

    //聊天按钮
    (function(){
      jq('.caozuo_btn_chat').on('click',function(){
        var this_id = JSON.parse(api.getPrefs({
            sync: true,
            key: 'user_login_status'
        })).user_id;

        if(parseFloat(from_id) === parseFloat(this_id)){
          toast.fail({
              title:'不能和自己聊天',
              duration:4000
          });
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

    //查看用户展示页
    jq('.fabu_people_msg_img').on('click',function(e){
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




    //是否实例化轮播
    function instantiationServerFocus(){
      var server_focus = new Swiper ('#xuqiu_focus', {
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
    //返回上一页
    jq('.page_header_return').on('click',function(){api.closeWin();});
  });
}
