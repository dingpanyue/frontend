apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  var pingpp = api.require('pingpp');

  //拿到页面传值
  var id = api.pageParam.id;
  var adapted_assignment_id = api.pageParam.adapted_assignment_id;
  var type = api.pageParam.type;
  var __status = api.pageParam.status;
  /*获取我自己的id*/


  console.log(id);
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  //渲染页面
  jq(function(){
    jq('.select_pay_method_mask').height(win_height);
    jq('.user_pay_pasw_mask').height(win_height);
    function getMyId(callback){
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

      jq.ajax(settings).done(function (rep) {
        if(rep.message === 'success'){
          callback(rep.response);
        }

      });
    }
    //请求数据,设置公共部分
    (function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/"+id+"/detail",
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

              var html_str = '<div class="swiper-slide">'+'<img src="'+img_arr[i]+'" />' +'</div>';

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


          //设置操作记录
          var operationData = data.operations;
          for(var op = 0;op < operationData.length;op++){
            var operationData_user_img = operationData[op].user.image;
            if(operationData_user_img === null){operationData_user_img = '../image/icon/noimage.png';}
            var operation_html = '<li class="operation_list_li">'+
              '<img class="list_user_img" src="http://47.104.73.41'+operationData_user_img+'">'+
              '<span class="operation_list_li_span">'+
                operationData[op].user.name+'<span class="list_user_operation">【'+operationData[op].operation+'】</span> 了订单'+
              '</span>'+
            '</li>';
            jq('.operation_list_ul').append(operation_html);
          }

        }
      });
    })();

    /*是否展示取消申请的按钮*/
    if(__status === '待采纳'){jq('.cancel_apply').css('display','block');}

    /*是否展示提交完成的按钮*/
    if(__status === '已采纳'){jq('.submit_complete').css('display','block');}

    //取消申请的委托
    jq('.cancel_apply').on('click',function(){

      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/cancel-accepted/" + adapted_assignment_id,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }
      console.log(adapted_assignment_id);

      jq.ajax(settings).done(function (res) {
        if(res.message === 'success'){
          toast.success({title:"已取消",duration:4000});
          setTimeout(function(){
            api.sendEvent({name: 'run_i_accept_task',extra: {key1: 'value1', }});
            api.closeWin();
          },4000);

        }
      });
    });

    //提交完成申请的委托
    jq('.submit_complete').on('click',function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/deal/" + adapted_assignment_id,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }
      jq.ajax(settings).done(function (res) {
        if(res.message === 'success'){
          toast.success({title:"已提交完成",duration:4000});
          setTimeout(function(){
            api.sendEvent({name: 'run_i_accept_task',extra: {key1: 'value1', }});
            api.closeWin();
          },4000);
        }else{
          toast.fail({title:res.message,duration:4000});
        }
      });
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
    /*返回按钮点击事件*/
    jq('#return_prev_page').on('click',function(){api.closeWin();});

  });
}
