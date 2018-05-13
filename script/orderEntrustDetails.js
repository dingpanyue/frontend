apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  var pingpp = api.require('pingpp');

  //拿到页面传值
  var id = api.pageParam.id;
  var type = api.pageParam.type;
  /*获取我自己的id*/

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

      jq.ajax(settings).done(function (rep) {if(rep.message === 'success'){callback(rep.response);}});
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
            var operationData_user_img = '';
            var caozuo_user_name = '';
            if(operationData[op].user===null){
              caozuo_user_name = '用户';
            }else{
              caozuo_user_name = operationData[op].user.name;
            }
            if(operationData[op].user === null || operationData[op].user.image === null){operationData_user_img = '../image/icon/noimage.png';}else{
              operationData_user_img = 'http://47.104.73.41' + operationData[op].user.image
            }
            var operation_html = '<li class="operation_list_li">'+
              '<img class="list_user_img" src="'+operationData_user_img+'">'+
              '<span class="operation_list_li_span">'+
                caozuo_user_name+'<span class="list_user_operation">【'+operationData[op].operation+'】</span> 了订单'+
              '</span>'+
            '</li>';
            jq('.operation_list_ul').append(operation_html);
          }

          /*支付按钮*/
          if(data.status === '未支付'){
            jq('.payment_order_btn').css('display','block');
            jq('.cancel_pay_btn').css('display','block');
            jq('.payment_order_btn').attr('order_id',data.id);
            jq('.cancel_pay_btn').attr('order_id',data.id);
          }

          /*是否展示候选人列表*/
          if(data.status === '待选择服务方'){
            jq('.select_service').css('display','block');
            jq('.refund_btn').css('display','block');
            jq('.refund_btn').attr('order_id',data.id);

          }
          /*候选人列表设置*/
          var accepted_assignment = data.accepted_assignments;
          if(accepted_assignment.length === 0){
            jq('.select_service_ul').append('<div class="none_accepted_assignment">您发布的需求暂时没有服务方接受，请耐心等待！</div>');
          }else{
            for(var ac = 0;ac < accepted_assignment.length;ac++){
              var accepted_assignment_html = '<li class="select_service_li">'+
                '<img class="services_img" src="http://47.104.73.41'+accepted_assignment[ac].serve_user.image+'">'+
                '<div class="services_name">'+accepted_assignment[ac].serve_user.name+'</div>'+
                '<div accepted_assignment_id="'+accepted_assignment[ac].id+'" class="select_this_btn">选择他</div>'+
              '</li>';
              jq('.select_service_ul').append(accepted_assignment_html);
            }
          }

          /*确认完成和拒绝完成*/
          if(data.adapted_assignment !== null && data.adapted_assignment.status === '已解决'){
            jq('.confirmation_and_rejection').css('display','block');
            jq('.confirmation_btn').attr('confirmation_id',data.adapted_assignment.id);
            jq('.rejection_btn').attr('rejection_id',data.adapted_assignment.id);
          }

        }
      });
    })();

    //支付按钮点击
    jq('.payment_order_btn').on('click',function(){getAndeditUserPayViewData();openElasticLayer();});

    //取消支付
    jq('.cancel_pay_btn').on('click',function(){
      var order_id = jq('.cancel_pay_btn').attr('order_id');
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/cancel/" + order_id,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (res) {
        if(res.message === 'success'){
          toast.success({title:"已取消",duration:4000});
          setTimeout(function(){window.location.reload();},4000);
        }else{
          toast.success({title:"取消失败，请稍后再试！",duration:4000});
          setTimeout(function(){window.location.reload();},4000);
        }
      });
    });

    //选择服务方按钮
    jq('.select_service_ul').on('click',function(e){
      if(jq(e.target).attr('accepted_assignment_id') !== undefined){
        var accepted_assignment_id = jq(e.target).attr('accepted_assignment_id');
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/adapt/" + accepted_assignment_id,
          "method": "POST",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }

        jq.ajax(settings).done(function (res) {
          if(res.message === 'success'){
            toast.success({title:"已选择",duration:4000});
            setTimeout(function(){window.location.reload();},4000);
          }
        });
      }
    });

    //确认完成
    jq('.confirmation_btn').on('click',function(){
      var confirmation_id = jq('.confirmation_btn').attr('confirmation_id');
      api.openWin({
          name: 'evaluationService',
          slidBackEnabled:false,
          bounces:false,
          reload:true,
          url: '../html/evaluationService.html',
          pageParam: {
              confirmation_id: confirmation_id
          }
      });
    });

    //拒绝完成
    jq('.rejection_btn').on('click',function(){
      var rejection_id = jq('.rejection_btn').attr('rejection_id');
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/refuse-finish/" + rejection_id,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (res) {
        if(res.message === 'success'){
          toast.success({title:"拒绝完成",duration:4000});
          setTimeout(function(){window.location.reload();},4000);
        }
      });
    });

    /*退款*/
    jq('.refund_btn').on('click',function(){
      var refund_order_id = jq('.refund_btn').attr('order_id');
      console.log(refund_order_id);
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/refund/assignment/" + refund_order_id,
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (res) {
        if(res.message === 'success'){
          toast.success({title:"已申请退款",duration:4000});
          setTimeout(function(){window.location.reload();},4000);
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
    /*设置余额显示和需付款*/
    function getAndeditUserPayViewData(){
      //请求账户余额
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
          var data = rep.response;
          jq('.pay_iocn_balance_span').text('账户余额：' + data.balance);
        }
      });
    }
    /*返回按钮点击事件*/
    jq('#return_prev_page').on('click',function(){api.closeWin();});
    function closeElasticLayer(){jq('.select_pay_method_mask').css({'display':'none'});jq('.select_pay_method').css({'bottom':'-300px'});}
    function openElasticLayer(){jq('.select_pay_method_mask').css({'display':'block'});jq('.select_pay_method').css({'bottom':'10px'});}
    /*mask被点击*/
    jq('.select_pay_method_mask').on('click',function(){closeElasticLayer();});
    /*发布按钮被点击的时候设置需付款和账余额*/
    function getAndeditUserPayViewData(){

      //设置支付的展示金额
      jq('.order_money_view_right').text('￥' + jq('.xuqiu_money_span').text());
      //请求账户余额
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
          var data = rep.response;
          jq('.pay_iocn_balance_span').text('账户余额：' + data.balance);
        }
      });
    }
    /*立即支付按钮被点击*/
    jq('.confirm_pay_btn').on('click',function(){

      closeElasticLayer();

      var radio_list = document.getElementsByName('radio');
      for(var i = 0;i < radio_list.length;i++){
        if(radio_list[i].checked){appPay(radio_list[i].getAttribute('method'));}
      }
    });

    //支付函数
    function appPay(methods){
      if(methods === 'balance'){
        jq('.App_container').css('display','none');
        //弹出支付密码输入的弹层
        jq('.user_pay_pasw_mask').fadeIn();
        jq('.user_pay_pasw_input_div').fadeIn();
        //监听input输入事件
        jq('.user_pay_pasw_input').on('input',function(e){
          var __val = this.value;
          if( /[^\d]+/.test(jq(this).val() ) ){this.value = __val.replace(/[^\d]+/g,'');}
          if(__val.length === 6){
            var pay_parssword = __val;
            var pay_id = jq('.payment_order_btn').attr('order_id');
            var _url = 'http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type=assignment&method='+methods+'&pk=' + pay_id + '&code=' + pay_parssword;
            api.ajax({
                url: _url,
                method: 'get',
                headers:{
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Cache-Control": "no-cache",
                  "Authorization":"Bearer " + token
                }
            },function(ret, err){
                if (ret) {
                    if(ret.msgcode !== 100000){
                      //支付失败
                      api.toast({
                          msg: ret.message,
                          duration: 4000,
                          location: 'top'
                      });
                      jq('.user_pay_pasw_mask').fadeOut();
                      jq('.user_pay_pasw_input_div').fadeOut();
                      jq('.App_container').css('display','block');
                      jq('#user_pay_pasw_input').val('');

                    }else{
                      jq('.user_pay_pasw_mask').fadeOut();
                      jq('.user_pay_pasw_input_div').fadeOut();
                      toast.success({title:"支付成功",duration:4000});
                      setTimeout(function(){window.location.reload();},4000);
                    }


                } else {
                    console.log( JSON.stringify( err ) );
                }
            });
          }
        });
      }else if(methods === 'wx'){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type=assignment&method="+methods+"&pk=" + id,
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }

        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            arousePayApp(rep.response);
          }else{
            console.log('支付SDK获取错误');
          }
        });
      }else if(methods === 'alipay'){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type=assignment&method="+methods+"&pk=" + id,
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }

        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            arousePayApp(rep.response);
          }else{
            console.log('支付SDK获取错误');
          }
        });
      }

    }

    //根据返回的支付凭证唤起对应的支付应用
    function arousePayApp(chargeJSONString){
      var pingpp = api.require('pingpp');
      pingpp.setDebugMode({enabled:true});
      var params = {
        charge:chargeJSONString,
        scheme:'xxt'
      };
      pingpp.createPayment(params, function(ret, err) {
          if (ret.result == "success") {
              //调用支付后的处理函数
              PayAfter();

          }else if(ret.result === 'fail'){
            toast.fail({
              title:"支付失败",
              duration:3000
            });
          }else if(ret.result === 'cancel'){
            toast.fail({
              title:"您取消了支付",
              duration:3000
            });
          }else if(ret.result === 'invalid'){
            toast.fail({
              title:"客户端未安装",
              duration:3000
            });
          }
      });
    }

    //支付完成之后的处理函数
    function PayAfter(){
      api.openWin({
          name: 'payAccess',
          slidBackEnabled:false,
          url: '../html/payAccess.html'
      });

      //一秒后刷新页面
      setTimeout(function(){
        window.location.reload();
      },1000);
    }
    /*自定义事件*/
    api.addEventListener({
        name: 'refreshOrderEntrustDetail'
    }, function(ret, err){
        if( ret ){
             window.location.reload();
        }else{
             console.log( JSON.stringify( err ) );
        }
    });



  });
}
