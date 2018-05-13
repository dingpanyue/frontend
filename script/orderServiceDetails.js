apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  var pingpp = api.require('pingpp');

  //拿到页面传值
  var id = api.pageParam.id;
  var type = api.pageParam.type;

  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  jq(function(){
    jq('.select_pay_method_mask').height(win_height);
    jq('.user_pay_pasw_mask').height(win_height);
    var agree_buy_service_data = {};
    var user_buy_service_complete_data = {};
    var confirm_buy_service_complete_data = {};
    /*请求数据设置公共部分*/
    (function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/accepted_services/"+id+"/detail",
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
          agree_buy_service_data = rep.response;
          user_buy_service_complete_data = rep.response;
          confirm_buy_service_complete_data = rep.response;

          //设置需付款金额
          jq('.order_money_view_right').text('￥' + data.reward);
          //渲染轮播
          if(data.service.images === null){
            jq('#server_focus_wrapper').append('<div class="swiper-slide"><img src="../image/userImg/morenserver.png" /></div>');
          }else{

            //处理图片路径问题
            var img_str = data.service.images;
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

          //设置标题
          jq('.service_title').text('服务名称：' + data.service.title);
          //设置头像
          if(data.serve_user.image !== null){
            jq('.service_img').attr('src','http://47.104.73.41'+data.serve_user.image+'');
            jq('.service_img').attr('info_id',data.serve_user.id);
          }
          //设置名字
          jq('.service_name').text(data.serve_user.name);
          //设置过期时间
          jq('.service_expired').text('过期时间：' + data.service.expired_at);

          //设置服务具体说明
          jq('.service_content').text(data.service.introduction);


          //设置操作记录
          var list = data.operations;
          if(list.length === 0){
            jq('#order_operations_ul').text('操作记录暂无');
          }else{
            var div = jq('<div></div>');

            for(var i = 0;i < list.length;i++){

              if(list[i].user === null){
                var html_str = '<li> 用户名为空&nbsp;&nbsp;<span style="color:#39f;">'+list[i].operation+'</span>&nbsp;&nbsp;了服务，在'+list[i].created_at+'</li>';
              }else{
                var html_str = '<li> '+list[i].user.name+'&nbsp;&nbsp;<span style="color:#39f;">'+list[i].operation+'</span>&nbsp;&nbsp;了服务，在'+list[i].created_at+'</li>';
              }
              div.append(html_str);
            }
            jq('#order_operations_ul').html(div);
          }

          /*我售出的服务*/
          if(type === 'sold_services'){
            /*判断哪些展示，那些不展示*/
            var state = data.status;
            if(state === '申请中'){
              jq('.agree_buy_service').css('display','block');
              jq('.agree_buy_service').attr('agree_buy_service_id',data.id);
              jq('.refuse_buy_service').css('display','block');
              jq('.refuse_buy_service').attr('refuse_buy_service_id',data.id);
            }

            if(state === '服务中'){
              jq('.user_buy_service_complete').css('display','block');
              jq('.user_buy_service_complete').attr('user_buy_service_complete_id',data.id);
            }






          }

          /*我购买的服务*/
          if(type === 'buy_services'){
            var states = data.status;
            if(states === '申请中'){
              jq('.refuse_service_apply').css('display','block');
              jq('.refuse_service_apply').attr('refuse_service_apply_id',data.id);
            }


            if(states === '待支付'){
              jq('.i_buy_service_no_pay').css('display','block');
              jq('.i_buy_service_no_pay').attr('i_buy_service_no_pay_id',data.id);
            }

            if(states === '等待确认完成'){
              jq('.confirm_buy_service_complete').css('display','block');
              jq('.confirm_buy_service_complete').attr('confirm_buy_service_complete_id',data.id);

              jq('.refuse_service_complete').css('display','block');
              jq('.refuse_service_complete').attr('refuse_service_complete_id',data.id);
            }




          }



        }
      });
    })();


    //同意购买服务点击事件
    (function(){
      jq('.agree_buy_service').on('click',function(){
        var agree_buy_service_id = jq(this).attr('agree_buy_service_id');
        if(agree_buy_service_id !== undefined){

          var settings = {
              "async": true,
              "crossDomain": true,
              "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/accept/" + agree_buy_service_id,
              "method": "POST",
              "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + token,
                "Cache-Control": "no-cache"
              },
              "data": {
                "title": agree_buy_service_data.service.title,
                "classification": agree_buy_service_data.service.classification,
                "introduction": agree_buy_service_data.service.introduction,
                "province_id": agree_buy_service_data.service.province_id,
                "city_id": agree_buy_service_data.service.city_id,
                "area_id": agree_buy_service_data.service.area_id,
                "lng": agree_buy_service_data.service.lng,
                "lat": agree_buy_service_data.service.lat,
                "detail_address": agree_buy_service_data.service.detail_address,
                "reward": agree_buy_service_data.reward,
                "expired_at": agree_buy_service_data.service.expired_at,
                "deadline": agree_buy_service_data.deadline,
                "comment": agree_buy_service_data.service.comment
              }
            }

          jq.ajax(settings).done(function (rep) {
              if(rep.message === 'success'){
                toast.success({
                    title:"已同意，等待对方支付",
                    duration:2000
                });
                setTimeout(function(){
                  window.location.reload();
                },2000);
              }else{
                toast.fail({
                    title:rep.message,
                    duration:2000
                });
              }
          });






        }
      });
    })();

    //拒绝购买服务
    (function(){
      jq('.refuse_buy_service').on('click',function(){
        var _id = jq(this).attr('refuse_buy_service_id');
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/refuse/" + _id,
          "method": "POST",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token
          }
        }

        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            toast.success({
                title:"您已拒绝",
                duration:2000
            });
            setTimeout(function(){
              window.location.reload();
            },2000);
          }
        });
      });
    })();


    //提交主动购买的服务的完成申请
    (function(){
      jq('.user_buy_service_complete').on('click',function(){
        var user_buy_service_complete_id = jq(this).attr('user_buy_service_complete_id');
        if(user_buy_service_complete_id !== undefined){
          //发起请求
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/deal/" + user_buy_service_complete_id,
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              toast.success({
                  title:"已申请，等待对方同意",
                  duration:2000
              });
              setTimeout(function(){
                window.location.reload();
              },2000);
            }else{
              toast.fail({
                  title:rep.message,
                  duration:2000
              });
            }
          });
        }
      });
    })();

    //取消购买申请
    (function(){
      jq('.refuse_service_apply').on('click',function(){
        var refuse_service_apply_id = jq(this).attr('refuse_service_apply_id');
        if(refuse_service_apply_id !== undefined){
          //发起请求
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/cancel-accepted/" + refuse_service_apply_id,
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              toast.success({
                  title:"已取消!",
                  duration:2000
              });
              setTimeout(function(){
                window.location.reload();
              },1800);
            }else{
              toast.fail({
                  title:rep.message,
                  duration:2000
              });
            }
          });
        }
      });
    })();

    //购买的服务立即支付
    (function(){
      getAndeditUserPayViewData();
      var order_id = '';
      var pay_type = '';
      jq('.i_buy_service_no_pay').on('click',function(){
        var i_buy_service_no_pay_id = jq(this).attr('i_buy_service_no_pay_id');
        order_id = i_buy_service_no_pay_id;
        pay_type = 'service';
        openElasticLayer();
      });


      /*mask被点击*/
      getClassDom('select_pay_method_mask').addEventListener('click',function(){
        closeElasticLayer();
      },true);

      /*立即支付按钮被点击*/
      jq('.confirm_pay_btn').on('click',function(){
        closeElasticLayer();
        api.showProgress({
          title: '正在与M78星云通信',
          text: '先喝杯茶...',
          modal: false
        });

        //先拿到选择的支付方式的参数,然后调用支付函数
        var radio_list = document.getElementsByName('radio');
        for(var i = 0;i < radio_list.length;i++){
          if(radio_list[i].checked){
            releaseDemand(radio_list[i].getAttribute('method'));
          }
        }
      });

      //立即支付的主函数
      function releaseDemand(user_select_method){

        if(user_select_method === 'alipay'){
          api.hideProgress();
          alipayPay(pay_type,user_select_method,order_id);
        }else if(user_select_method === 'wx'){
          api.toast({
              msg: '暂不支持微信',
              duration: 5000,
              location: 'top'
          });
          api.hideProgress();
        }else{
          api.hideProgress();
          passwordCode(pay_type,user_select_method,order_id);
        }

      }

      /*关闭支付弹层*/
      function closeElasticLayer(){
        getClassDom('select_pay_method_mask').style.display = 'none';
        getClassDom('select_pay_method').style.bottom = '-300px';
      }

      /*打开支付弹层*/
      function openElasticLayer(){
        getClassDom('select_pay_method_mask').style.display = 'block';
        getClassDom('select_pay_method').style.bottom = '0px';
      }

      /*监听密码输入*/
      function passwordCode(pay_type,method,order_id){
        //打开密码输入弹层
        jq('.user_pay_pasw_mask').fadeIn();
        jq('.user_pay_pasw_input_div').fadeIn();
        //监听input输入事件
        jq('.user_pay_pasw_input').on('input',function(e){
          var __val = this.value;
          if( /[^\d]+/.test(jq(this).val() ) ){this.value = __val.replace(/[^\d]+/g,'');}
          if(__val.length === 6){
            jq('.user_pay_pasw_mask').fadeOut();
            jq('.user_pay_pasw_input_div').fadeOut();
            balancePay(pay_type,method,order_id,__val);
          }
        });
      }

      /*余额支付函数*/
      function balancePay(pay_type,method,order_id,pas_code){

        //余额支付
        if(method === 'balance'){
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type="+pay_type+"&method="+method+"&pk=" + order_id + '&code=' + pas_code,
            "method": "GET",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              api.hideProgress();
              toast.success({
                  title:"支付成功",
                  duration:2000
              });
              setTimeout(function(){
                window.location.reload();
              },1800);
            }else{
              api.hideProgress();
              toast.fail({
                  title:rep.message,
                  duration:3000
              });
            }
          });
        }

      }

      //支付宝支付
      function alipayPay(pay_type,method,order_id){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type="+pay_type+"&method="+method+"&pk=" + order_id,
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }

        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            api.hideProgress();
            arousePayApp(rep.response);
            //支付成功之后刷新
          }else{
            toast.fail({
                title:rep.message,
                duration:3000
            });
          }
        });
      }

      //根据返回的支付凭证唤起对应的支付应用
      function arousePayApp(chargeJSONString){
        var params = {
          charge:chargeJSONString,
          scheme:'xxt'
        }
        pingpp.createPayment(params, function(ret, err) {
            console.log('唤起应用支付');
            console.log(JSON.stringify(ret));
            if (ret.result == "success") {
                //调用支付后的的处理
                console.log('支付宝支付成功');
                if(pay_type === 'service'){serversNoPayPage();}
                if(pay_type === 'assignment'){entrustNoPayPage();}
            }else if(ret.result === 'cancel'){
              toast.fail({
                  title:'您取消了支付',
                  duration:3000
              });
            }
        });
      }


    })();

    //确认购买的服务完成
    (function(){
      jq('.confirm_buy_service_complete').on('click',function(){
        var confirm_buy_service_complete_id = jq(this).attr('confirm_buy_service_complete_id');
        if(confirm_buy_service_complete_id !== undefined){
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/finish/" + confirm_buy_service_complete_id,
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              toast.success({
                  title:"服务结束!",
                  duration:2000
              });
              setTimeout(function(){
                window.location.reload();
              },2000);
            }else{
              toast.fail({
                  title:rep.message,
                  duration:2000
              });
            }
          });
        }
      });
    })();

    //拒绝购买的服务完成
    (function(){
      jq('.refuse_service_complete').on('click',function(){
        var refuse_service_complete_id = jq(this).attr('refuse_service_complete_id');
        if(refuse_service_complete_id !== undefined){
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/finish/" + refuse_service_complete_id,
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              toast.success({
                  title:"您已拒绝!",
                  duration:2000
              });
              setTimeout(function(){
                window.location.reload();
              },1800);
            }else{
              toast.fail({
                  title:rep.message,
                  duration:2000
              });
            }
          });
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

    //点击头像去个人信息页面
    jq('.service_img').on('click',function(){
      if(jq(this).attr('info_id') !== undefined){
        var _id = jq(this).attr('info_id');
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

    /*返回按钮点击事件*/
    jq('#return_prev_page').on('click',function(){api.closeWin();});

  });
}
