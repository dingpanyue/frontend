apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  var UIMediaScanner = api.require('UIMediaScanner');
  //优化点击事件
  api.parseTapmode();

  getClassDom('user_pay_pasw_mask').style.height = api.winHeight + 'px';

  //取token
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  //取位置
  try {var location_inf = JSON.parse(api.getPrefs({sync: true,key: 'location_inf'}));} catch (e) {console.log(JSON.stringify(e));};

  //委托订单的提交数据依据的临时本地变量，用来判断是否再次重新提交数据
  var isSendData = true;//为true可以提交数据,false时，不提交数据
  var oderId = '';//订单ID  再次调起支付时需要使用




  /*选择支付方式的弹层*/
  getClassDom('select_pay_method_mask').style.height = api.winHeight + 'px';

  /*功能*/
  jq(function(){
    /*初始化页面，清空表单数据*/
    getClassDom('app-demand-title-ipt').value = '';
    getClassDom('app-demand-textarea').value = '';
    getClassDom('app-demand-money-ipt').value = '';
    //发布类型的选择事件
    (function(){

      var tab = new auiTab({
          element:document.getElementById("app_tab"),
          index:1,
          repeatClick:false
      },function(ret){
          var index = ret.index;
          function closeSelectType(str){
            getClassDom('app-title').innerText = '发布' + str;
          }
          if(index === 1){
            closeSelectType('需求');
            jq('.app-demand-money').css('display','block');
          }
          if(index === 2){
            closeSelectType('服务');
            jq('.app-demand-money').css('display','none');
          }
      });
    })();


    /*选择图片*/
    (function(){
      jq('.app-select-img').on('click',function(){
        var _list = jq('#app-demand-img img');
        if(_list.length >= 5){
          toast.fail({title:"最多选择五张",duration:1800});
        }else{
          UIMediaScanner.open({
              type: 'picture',
              column: 4,
              classify: true,
              max: 5,
              sort: {key: 'time',order: 'desc'},
              texts: {stateText: '已选择0项',cancelText: '取消',finishText: '完成'},
              styles: {
                  bg: '#fff',
                  mark: {
                      icon: '',
                      position: 'bottom_left',
                      size: 32
                  },
                  nav: {
                      bg: '#eee',
                      stateColor: '#000',
                      stateSize: 18,
                      cancelBg: 'rgba(0,0,0,0)',
                      cancelColor: '#000',
                      cancelSize: 18,
                      finishBg: 'rgba(0,0,0,0)',
                      finishColor: '#000',
                      finishSize: 18
                  }
              },
              scrollToBottom:{intervalTime: 3,anim: true},
              exchange: true,
              rotation: false
          }, function( ret ){
              if( ret ){
                  if(ret.eventType === 'cancel'){toast.fail({title:"取消了选择",duration:1800});}
                  if(ret.eventType === 'albumError'){toast.fail({title:"访问相册失败",duration:1800});}
                  if(ret.eventType === 'confirm'){
                    if(ret.list.length === 0){
                      toast.fail({title:"未选择",duration:1800});
                    }else{
                      var img_arr = ret.list;
                      var img = document.createElement('img');
                      for(var i = 0;i < img_arr.length;i++){
                        console.log(img_arr[i].path);
                        var _img = jq('<img class="public_send_img demand_imgs'+i+'" src="'+img_arr[i].path+'"/>');
                        jq('#app-demand-img').append(_img);
                      }
                    }
                  }
              }
          });
        }
      });

      //点击删除图片
      jq('#app-demand-img').on('click',function(e){
        if(e.target.getAttribute('class') === null || e.target.getAttribute('class') === '' || e.target.getAttribute('class') === undefined){
          return;
        }else{
          this.removeChild(e.target);
        }
      });
    })();

    /*输入的金额的正则匹配*/
    (function(){
      var app_demand_money_ipt = getClassDom('app-demand-money-ipt');
      app_demand_money_ipt.addEventListener('input',function(){
          app_demand_money_ipt.value = app_demand_money_ipt.value.replace(/[^0-9\.]{1,}/,'');
      },true);
    })();

    //初始化委托类目列表 和 选择列表
    (function(){
      //取缓存
      api.getPrefs({
          key: 'app_serve_category'
      }, function(ret, err){
          if( ret ){
              if(ret.value !== ''){
                var data_arr = JSON.parse(ret.value);
                //拼接字符串渲染DOM
                for(var i = 0;i < data_arr.length;i++){
                  var li = jq('<li id="'+data_arr[i].id+'">'+data_arr[i].name+'</li>');
                  jq('#app-demand-type-modal-list').append(li);
                }

                /*选择需求类型点击事件*/
                var app_demand_type_modal = getClassDom('app-demand-type-modal');
                var app_select_demand_type_title = getClassDom('app-select-demand-type-title');
                app_select_demand_type_title.addEventListener('click',function(){
                  app_demand_type_modal.style.display = 'block';
                },true);

                /*需求类型列表的模态层*/
                app_demand_type_modal.style.height = api.winHeight + 'px';

                /*每个li的委托事件*/
                var selected_num_arr = [];
                var selected_str_arr = [];
                getIdDom('app-demand-type-modal-list').addEventListener('click',function(e){
                  if(e.target.innerText !== ''){
                    var _num = e.target.id;
                    var _str = jq(e.target).text();
                    if(jq('.app-select-demand-type-title').attr('categoryId') === '-1'){
                        //push到数组中
                        selected_num_arr.push(_num);
                        selected_str_arr.push(_str);

                        jq('.app-select-demand-type-title').attr('categoryId',selected_num_arr.join(','));
                        jq('.app-select-demand-type-title').text(selected_str_arr.join(','));
                        jq('.app-demand-type-modal').css('display','none');
                        jq(e.target).css('color','#39f');
                    }else{
                      //push到数组中
                      var parameter_num = selected_str_arr.indexOf(_str);
                      if(parameter_num === -1){
                        selected_num_arr.push(_num);
                        selected_str_arr.push(_str);
                        jq('.app-select-demand-type-title').attr('categoryId',selected_num_arr.join(','));
                        jq('.app-select-demand-type-title').text(selected_str_arr.join(','));
                        jq('.app-demand-type-modal').css('display','none');
                        jq(e.target).css('color','#39f');
                      }else if(selected_num_arr.length === 1){
                        selected_num_arr = [];
                        selected_str_arr = [];
                        jq('.app-select-demand-type-title').attr('categoryId','-1');
                        jq('.app-select-demand-type-title').text('点击选择类型...');
                        jq(e.target).css('color','#333');
                        jq('.app-demand-type-modal').css('display','none');
                      }else if(parameter_num === 0){
                        selected_num_arr.shift();
                        selected_str_arr.shift();
                        jq('.app-select-demand-type-title').attr('categoryId',selected_num_arr.join(','));
                        jq('.app-select-demand-type-title').text(selected_str_arr.join(','));
                        jq(e.target).css('color','#333');
                        jq('.app-demand-type-modal').css('display','none');
                      }else{
                        selected_num_arr.splice(parameter_num,parameter_num);
                        selected_str_arr.splice(parameter_num,parameter_num);
                        jq('.app-select-demand-type-title').attr('categoryId',selected_num_arr.join(','));
                        jq('.app-select-demand-type-title').text(selected_str_arr.join(','));
                        jq(e.target).css('color','#333');
                        jq('.app-demand-type-modal').css('display','none');
                      }
                    }
                  }
                },true);

                //关闭模态
                getClassDom('app-demand-type-modal-header-icon').addEventListener('click',function(){app_demand_type_modal.style.display = 'none';},true);
              }
          }else{
              console.log('取缓存出错');
          }
      });
    })();

    /*提交表单，发布需求的，包括了支付*/
    (function(){
      //委托发布取数据函数
      function getDemandData(){
        //标题
        var demand_title = getIdDom('app-demand-title-ipt').value;

        //分类
        var demand_classification = getClassDom('app-select-demand-type-title').getAttribute('categoryId');

        //详细文字描述
        var demand_introduction = getIdDom('app-demand-textarea').value;

        //省份ID
        var demand_province_id = location_inf.demand_province_id;

        //城市ID
        var demand_city_id = location_inf.demand_city_id;


        //地区ID
        var demand_area_id = location_inf.demand_area_id;

        //经度
        var demand_lng = location_inf.demand_lng;

        //纬度
        var demand_lat = location_inf.demand_lat;

        //具体的街道地址
        var demand_detail_address = getIdDom('app_demand_address_ipt').value;

        //委托报酬
        var demand_reward = parseFloat(getIdDom('app-demand-money-ipt').value);

        //截至日期
        var demand_expired_at = getClassDom('app_demand_expired_at_ipt').value;//demand_deadline


        var demand_deadline = demand_expired_at;

        var data = {
          demand_title:demand_title,
          demand_classification:demand_classification,
          demand_introduction:demand_introduction,
          demand_province_id:demand_province_id,
          demand_city_id:demand_city_id,
          demand_area_id:demand_area_id,
          demand_lng:demand_lng,
          demand_lat:demand_lat,
          demand_detail_address:demand_detail_address,
          demand_reward:demand_reward,
          demand_expired_at:demand_expired_at,
          demand_deadline:demand_expired_at
        }
        return data;
      }

      //服务的上传图片的函数
      function sendImg(id,callback){
        //先判断有没有图片，有的话就上传，没有，就什么也不做
        if(getIdDom('app-demand-img').childNodes.length !== 0){
          //取出图片路径
          api.showProgress({
              title: '正在奋力上传图片中...',
              text: '先喝杯茶...',
              modal: false
          });
          var img_list = document.getElementsByClassName('public_send_img');
          var img_url = [];
          var data = {};
          var str = '';
          for (var i = 0; i < img_list.length; i++) {
            // img_url.push(img_list[i].getAttribute('src'));
            data[i+1] = img_list[i].getAttribute('src');
          }



          api.getPrefs({
              key: 'user_login_status'
          }, function(ret, err){
              if( ret ){
                  var user_token = JSON.parse(ret.value).access_token;
                  api.ajax({
                      url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/services/upload/' + id,
                      method: 'post',
                      headers:{
                        "Authorization":"Bearer " + user_token
                      },
                      data: {
                          files:data
                      }
                  },function(ret, err){
                      if (ret) {
                          console.log( JSON.stringify( ret ) );
                          callback();
                      } else {
                          console.log( JSON.stringify( err ) );
                      }
                  });



              }else{
                   console.log( JSON.stringify( err ) );
              }
          });
        }else{
          callback();
        }

      }

      //委托的上传图片
      function entrustSendImg(id,callback){
        //先判断有没有图片，有的话就上传，没有，就什么也不做
        if(getIdDom('app-demand-img').childNodes.length !== 0){
          //取出图片路径
          console.log('jhgv :504');
          api.showProgress({
              title: '正在奋力上传图片中...',
              text: '先喝杯茶...',
              modal: false
          });
          var img_list = document.getElementsByClassName('public_send_img');
          var img_url = [];
          var data = {};
          var str = '';
          for (var i = 0; i < img_list.length; i++) {
            // img_url.push(img_list[i].getAttribute('src'));
            data[i+1] = img_list[i].getAttribute('src');
          }

          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/upload/' + id,
              method: 'post',
              headers:{
                "Authorization":"Bearer " + token
              },
              data: {
                  files:data
              }
          },function(ret, err){
              if (ret) {
                  console.log( JSON.stringify( ret ) );
                  callback();
              } else {
                  console.log( JSON.stringify( err ) );
              }
          });




        }else{
          callback();
        }
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

      //发送支付请求获取SDK的函数
      function sendPayData(methodTyle,id,code){
        var _url = 'http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type=assignment&method='+methodTyle+'&pk=' + id + '&code=' + code;

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
                  api.hideProgress();
                  api.toast({
                      msg: ret.message,
                      duration: 5000,
                      location: 'top'
                  });
                  jq('.user_pay_pasw_mask').fadeOut();
                  jq('.user_pay_pasw_input_div').fadeOut();
                  jq('.App_container').css('display','block');
                  jq('.user_pay_pasw_input').val('');
                }else{
                  PayAfter();
                }


            } else {
                console.log( JSON.stringify( err ) );
            }
        });
      }

      //支付函数
      function appPay(user_select_method,primary_key){
        //如果method值为余额支付的话，需要先输入支付密码   暂时本地验证，取密码缓存
        //如果是使用余额支付的话，必须要输入支付密码之后才能进行获取支付sdk的操作
        if(user_select_method === 'balance'){
          api.hideProgress();
          jq('.App_container').css('display','none');
          //弹出支付密码输入的弹层
          jq('.user_pay_pasw_mask').fadeIn();
          jq('.user_pay_pasw_input_div').fadeIn();

          //监听input输入事件
          jq('.user_pay_pasw_input').on('input',function(e){
            var __val = this.value;
            if( /[^\d]+/.test(jq(this).val() ) ){this.value = __val.replace(/[^\d]+/g,'');}
            if(__val.length === 6){
              console.log('可支付');
              sendPayData(user_select_method,primary_key,__val);
            }
          });


        }else if(user_select_method === 'alipay'){
          api.hideProgress();
          //走的是第三方支付
          //两个参数，一个是支付的方式，另一个是委托ID
          //获取支付凭据
          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type=assignment&method='+user_select_method+'&pk=' + primary_key,
              method: 'get',
              headers:{
                "Cache-Control": "no-cache",
                "Postman-Token": "5fc69b9c-33b1-4284-3c17-a32bccfbd259",
                "Authorization":"Bearer " + token
              }
          },function(ret, err){
              if (ret) {
                  if(ret.message === 'success'){

                    arousePayApp(ret.response);

                  }else{
                    console.log('支付SDK获取错误');
                  }

              } else {
                  console.log( JSON.stringify( err ) );
              }
          });

        }else if(user_select_method === 'wx'){
          api.hideProgress();
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/pay?type=assignment&method="+user_select_method+"&pk=" + primary_key,
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

      //立即支付的主函数
      //发起发布请求的函数，其中会调用取表单数据函数和支付函数
      function releaseDemand(user_select_method){
        //先把数据提交上去，生成一个未支付订单，之后返回的订单id是获取支付参数需要使用
        //如果页面未刷新的情况下，取消了支付，应该将返回的订单ID保存在本地变量里，还有是不是第一次支付，根据这些变量来判断是否重新生成订单
        var data = getDemandData();

        if(user_select_method === 'alipay'){

          //先提交数据
          var send_data = "title="+data.demand_title+"&classification="+data.demand_classification+"&introduction=" +
          data.demand_introduction + "&province_id=" + data.demand_province_id + "&city_id=" + data.demand_city_id +
          "&area_id=" + data.demand_area_id + "&lng=" + data.demand_lng + "&lat=" + data.demand_lat + "&detail_address=" +
          data.demand_detail_address + "&reward=" + data.demand_reward + "&expired_at=" + data.demand_expired_at + "&deadline=" +
          data.demand_deadline;

          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/publish',
              headers:{
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":"Bearer " + token,
                "Cache-Control": "no-cache"
              },
              method: 'post',
              data: {
                  body:send_data
              }
          },function(ret, err){
              if (ret) {
                  if(ret.message === 'success'){
                    api.hideProgress();
                    //数据已经提交上去了，应该修改本地变量的值了
                    var isSendData = false;//为true可以提交数据,false时，不提交数据
                    oderId = ret.response.id;//订单ID  再次调起支付时需要使用
                    //上传图片的函数
                    entrustSendImg(ret.response.id,function(){
                      api.hideProgress();
                    });
                    appPay(user_select_method,ret.response.id);
                  }else{
                    api.toast({
                        msg: ret.message,
                        duration: 2000,
                        location: 'top'
                    });
                    jq('.user_pay_pasw_mask').fadeOut();
                    jq('.user_pay_pasw_input_div').fadeOut();

                  }
              } else {
                  console.log( JSON.stringify( err ) );
              }
          });

        }else if(user_select_method === 'wx'){

          //先提交数据
          var send_data = "title="+data.demand_title+"&classification="+data.demand_classification+"&introduction=" +
          data.demand_introduction + "&province_id=" + data.demand_province_id + "&city_id=" + data.demand_city_id +
          "&area_id=" + data.demand_area_id + "&lng=" + data.demand_lng + "&lat=" + data.demand_lat + "&detail_address=" +
          data.demand_detail_address + "&reward=" + data.demand_reward + "&expired_at=" + data.demand_expired_at + "&deadline=" +
          data.demand_deadline;

          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/publish',
              headers:{
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":"Bearer " + token,
                "Cache-Control": "no-cache"
              },
              method: 'post',
              data: {
                  body:send_data
              }
          },function(ret, err){
              if (ret) {
                  if(ret.message === 'success'){
                    api.hideProgress();
                    //数据已经提交上去了，应该修改本地变量的值了
                    var isSendData = false;//为true可以提交数据,false时，不提交数据
                    oderId = ret.response.id;//订单ID  再次调起支付时需要使用
                    //上传图片的函数
                    entrustSendImg(ret.response.id,function(){
                      api.hideProgress();
                    });
                    //调用支付函数
                    appPay(user_select_method,ret.response.id);
                  }else{
                    api.toast({
                        msg: ret.message,
                        duration: 2000,
                        location: 'top'
                    });
                    jq('.user_pay_pasw_mask').fadeOut();
                    jq('.user_pay_pasw_input_div').fadeOut();

                  }
              } else {
                  console.log( JSON.stringify( err ) );
              }
          });

        }else if(user_select_method === 'balance'){

          //先提交数据
          var send_data = "title="+data.demand_title+"&classification="+data.demand_classification+"&introduction=" +
          data.demand_introduction + "&province_id=" + data.demand_province_id + "&city_id=" + data.demand_city_id +
          "&area_id=" + data.demand_area_id + "&lng=" + data.demand_lng + "&lat=" + data.demand_lat + "&detail_address=" +
          data.demand_detail_address + "&reward=" + data.demand_reward + "&expired_at=" + data.demand_expired_at + "&deadline=" +
          data.demand_deadline;

          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/publish',
              headers:{
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":"Bearer " + token,
                "Cache-Control": "no-cache"
              },
              method: 'post',
              data: {
                  body:send_data
              }
          },function(ret, err){
              if (ret) {
                  if(ret.message === 'success'){
                    api.hideProgress();
                    console.log(JSON.stringify(ret.message) + 'at 801');
                    isSendData = false;//为true可以提交数据,false时，不提交数据
                    oderId = ret.response.id;//订单ID  再次调起支付时需要使用
                    //上传图片的函数
                    entrustSendImg(ret.response.id,function(){api.hideProgress();});
                    //调用支付函数
                    appPay(user_select_method,ret.response.id);
                  }else{
                    api.toast({msg: ret.message,duration: 2000,location: 'top'});
                    jq('.user_pay_pasw_mask').fadeOut();
                    jq('.user_pay_pasw_input_div').fadeOut();

                  }
              } else {
                  console.log( JSON.stringify( err ) );
              }
          });

        }
      }

      //发布类型为服务的函数，主要验证数据是否完整以及提交数据
      function serviceType(){
        var data = getDemandData();
        if(jq('#app-demand-title-ipt').val() === ''){
          toast.fail({title:"标题未填写",duration:1800});
        }else if(jq('#app-demand-textarea').val() === ''){
          toast.fail({title:"请填写内容介绍",duration:1800});
        }else if(jq('.app-select-demand-type-title').attr('categoryId') === '-1'){
          toast.fail({title:"请选择分类",duration:1800});
        }else if(jq('#app_demand_address_ipt').val() === ''){
          toast.fail({title:"请输入详细地址",duration:1800});
        }else if(jq('.app_demand_expired_at_ipt').val() === '选择截止日期'){
          toast.fail({title:"日期未选择",duration:1800});
        }else{
          var send_data = "title="+data.demand_title+"&classification="+data.demand_classification+"&introduction=" +
          data.demand_introduction + "&province_id=" + data.demand_province_id + "&city_id=" + data.demand_city_id +
          "&area_id=" + data.demand_area_id + "&lng=" + data.demand_lng + "&lat=" + data.demand_lat + "&detail_address=" +
          data.demand_detail_address + "&expired_at=" + data.demand_expired_at;

          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/services/publish',
              headers:{
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":"Bearer " + token,
                "Cache-Control": "no-cache"
              },
              method: 'post',
              data: {
                  body:send_data
              }
          },function(ret, err){
              if (ret) {
                  if(ret.message === 'success'){

                    //上传图片的函数
                    sendImg(ret.response.id,function(){
                      api.hideProgress();
                      api.openWin({
                          name: 'ReleaseSuccess',
                          slidBackEnabled:false,
                          url: '../html/ReleaseSuccess.html'
                      });
                    });
                  }else{
                    api.toast({
                        msg: ret.message,
                        duration: 4000,
                        location: 'top'
                    });

                  }
              } else {
                  console.log( JSON.stringify( err ) );
              }
          });
        }

      }

      //发布类型为委托的函数,主要验证数据是否完整以及提交数据
      function entrustType(){
        var data = getDemandData();
        if(jq('#app-demand-title-ipt').val() === ''){
          toast.fail({title:"标题未填写",duration:1800});
        }else if(jq('#app-demand-textarea').val() === ''){
          toast.fail({title:"内容未填写",duration:1800});
        }else if(jq('.app-select-demand-type-title').attr('categoryId') === '-1'){
          toast.fail({title:"未选择分类",duration:1800});
        }else if(jq('#app-demand-money-ipt').val() === ''){
          toast.fail({title:"未输入金额",duration:1800});
        }else if(jq('#app_demand_address_ipt').val() === ''){
          toast.fail({title:"请输入详细地址",duration:1800});
        }else if(jq('.app_demand_expired_at_ipt').val() === '选择截止日期'){
          toast.fail({title:"日期未选择",duration:1800});
        }else{
          //设置支付视图的账户余额和需付款
          getAndeditUserPayViewData();
          openElasticLayer();
        }
      }

      function closeElasticLayer(){getClassDom('select_pay_method_mask').style.display = 'none';getClassDom('select_pay_method').style.bottom = '-300px';}
      function openElasticLayer(){getClassDom('select_pay_method_mask').style.display = 'block';getClassDom('select_pay_method').style.bottom = '13px';}

      /*发布按钮被点击的时候设置需付款和账余额*/
      function getAndeditUserPayViewData(){

        //设置支付的展示金额
        jq('.order_money_view_right').text('￥' + parseFloat(getIdDom('app-demand-money-ipt').value));
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

      /*发布按钮被点击*/
      getClassDom('app-demand-ordinary-btn').addEventListener('click',function(){
        var _list = jq('#app-demand-img img');
        if(_list.length >= 6){
          toast.fail({title:"最多选择五张",duration:1800});
        }else{
          var txt = getClassDom('app-title').innerText;
          if(txt === '发布服务'){serviceType();}
          if(txt === '发布需求'){entrustType();}
        }
      },true);

      /*mask被点击*/
      jq('.select_pay_method_mask').on('click',function(){closeElasticLayer()});

      //立即支付按钮点击事件
      getClassDom('confirm_pay_btn').addEventListener('click',function(){
        closeElasticLayer();
        var radio_list = document.getElementsByName('radio');
        for(var i = 0;i < radio_list.length;i++){
          if(radio_list[i].checked){releaseDemand(radio_list[i].getAttribute('method'));}
        }
      },true);

    })();

  });
}
