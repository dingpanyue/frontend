try {
  apiready = function(){
    var win_height = api.winHeight;
    var jq=jQuery.noConflict();
      var cache_arr = [];


      api.addEventListener({
          name:'resume'
      }, function(ret, err){
          api.sendEvent({
            name: 'reloadThisWin'
          });
          window.location.reload();
      });

      //取用户登录缓存
      api.getPrefs({
          key: 'user_login_status'
      }, function(ret, err){
          if( ret ){
            if(ret.value !== ''){

              var user_login_msg = JSON.parse(ret.value);

              //请求离线消息，并缓存，请求完毕后，将离线消息清空
              jq(function(){

                var settings = {
                  "async": true,
                  "crossDomain": true,
                  "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/offline-messages",
                  "method": "GET",
                  "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + user_login_msg.access_token,
                    "Cache-Control": "no-cache"
                  }
                }

                jq.ajax(settings).done(function (rep) {
                  if(rep.message === 'success'){
                    var data = rep.response;
                    if(data.length !== 0){
                      //缓存发送信息的人的头像/昵称/id/totat
                      (function(){
                        var list_Data = data[0];
                        if(list_Data.length !== 0){
                          var from_msg_arr_str = api.getPrefs({
                              sync: true,
                              key: 'from_msg'
                          });




                          if(from_msg_arr_str === ''){
                            var new_from_msg_arr = [];
                            for(var k = 0;k < list_Data.length;k++){
                              var __time = getyyyyMMdd();
                              var obj = new Object();
                              obj.imgUrl = list_Data[k].image;
                              obj.fromId = list_Data[k].id;
                              obj.fromName = list_Data[k].name;
                              obj.msg = '有新消息';
                              obj.time = __time;
                              obj.total = list_Data[k].total;
                              new_from_msg_arr.push(obj);
                              obj = null;
                            }
                            setLocalMsg('from_msg',new_from_msg_arr);
                            api.sendEvent({name: 'appMyNewsInformationBadge',extra: {key1: 'value1',}});

                          }else{
                            var from_msg_arr = JSON.parse(from_msg_arr_str);
                            var from_id_arr = [];

                            for(var i = 0;i < from_msg_arr.length;i++){
                              from_id_arr.push(from_msg_arr[i].fromId);
                            }
                            for(var k = 0;k < list_Data.length;k++){

                              //存在联系人列表缓存的情况则更新缓存
                              if(from_id_arr.indexOf(list_Data[k].id) !== -1){
                                var ___id = list_Data[k].id;
                                for(g = 0;g < from_msg_arr.length;g++){

                                  if( parseFloat(from_msg_arr[g].fromId) === parseFloat(___id) ){
                                    from_msg_arr[g].imgUrl = list_Data[k].image;
                                    from_msg_arr[g].total = parseFloat(from_msg_arr[g].total) + parseFloat(list_Data[k].total);
                                    setLocalMsg('from_msg',from_msg_arr);
                                  }
                                }


                              }else{

                                var __time = getyyyyMMdd();
                                var obj = new Object();
                                obj.imgUrl = list_Data[k].image;
                                obj.fromId = list_Data[k].id;
                                obj.fromName = list_Data[k].name;
                                obj.msg = '有新消息';
                                obj.time = __time;
                                obj.total = list_Data[k].total;
                                from_msg_arr.push(obj);
                                obj = null;

                              }

                            }
                            setLocalMsg('from_msg',from_msg_arr);
                            api.sendEvent({name: 'appMyNewsInformationBadge',extra: {key1: 'value1',}});
                          }
                        }
                      })();

                      //将收到的消息，缓存进历史记录缓存中
                      (function(){
                        var msg_list = data[1];

                        for(var i = 0; i < msg_list.length;i++){
                          var _id = msg_list[i].from_user_id;

                          //设置历史记录缓存
                          var chat_record_cache_str = api.getPrefs({
                              sync: true,
                              key: 'chat_record_' + _id
                          });
                          if(chat_record_cache_str === ''){
                            //为空创建一个新的聊天记录缓存
                            var __arr = [];
                            var obj = new Object();
                            obj.msg = msg_list[i].message;
                            obj.from_id = msg_list[i].from_user_id;
                            obj.to_user_id = msg_list[i].to_user_id;
                            obj.time = msg_list[i].updated_at;
                            obj.type = 'left';
                            __arr.push(obj);
                            setLocalMsg('chat_record_' + _id,__arr);

                          }else{
                            //已存在的缓存更新msg
                            var __msg_arr = JSON.parse(chat_record_cache_str);
                            var msg_obj = new Object();
                            msg_obj.msg = msg_list[i].message;
                            msg_obj.from_id = msg_list[i].from_user_id;
                            msg_obj.to_user_id = msg_list[i].to_user_id;
                            msg_obj.time = msg_list[i].updated_at;
                            msg_obj.type = 'left';
                            __msg_arr.push(msg_obj);
                            msg_obj = null;
                            setLocalMsg('chat_record_' + _id,__msg_arr);
                          }
                        }

                        //缓存完毕之后，将消息已读
                        var settings = {
                          "async": false,
                          "crossDomain": true,
                          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/offline-messages-dealt",
                          "method": "POST",
                          "headers": {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Authorization": "Bearer " + user_login_msg.access_token,
                            "Cache-Control": "no-cache"
                          }
                        }

                        jq.ajax(settings).done(function (response) {});
                      })();


                      //然后缓存未读消息和对应from用户的历史消息，如果有则更新，没有则创建
                    }else{
                      console.log('没有离线消息');
                    }
                  }
                });






              });

              //访问info接口，之后连接ws
              api.ajax({
                  url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/self/info',
                  method: 'get',
                  headers:{
                    "Authorization": "Bearer " + user_login_msg.access_token
                  }
              },function(ret, err){
                  if (ret) {
                      //先缓存用户是否认证的缓存字段
                      setLocalMsg('user_authentication_msg',{isAuth:true});
                      var data = ret.response;



                      var user_login_statuss = JSON.parse(api.getPrefs({
                          sync: true,
                          key: 'user_login_status'
                      }));
                      user_login_statuss.user_img_url = data.image;
                      user_login_statuss.user_nicheng = data.name;

                      setLocalMsg('user_login_status',user_login_statuss);



                      //之后连接ws
                      var ws = new WebSocket('ws://47.104.73.41:8282');


                      ws.onerror = function(err){console.log('ws连接错误');}
                      ws.onopen = function(){console.log('ws连接成功');}


                      var isBind = true;
                      ws.onmessage = function(req){

                        //绑定客户端id
                        if(isBind){
                          var clientID = req.data;
                          api.ajax({
                              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/bind/' + clientID,
                              method: 'get',
                              headers:{
                                "Authorization":"Bearer " + user_login_msg.access_token
                              }
                          },function(ret, err){
                              if (ret) {
                                  isBind = false;

                              } else {

                              }
                          });
                        }


                        //当绑定过后，data会变成对象，type为user的时候进行聊天内容的缓存
                        if(!isBind){
                          var msg_reg = new RegExp(/[7][f][a-zA-z0-9]{1,}/);
                          if(!msg_reg.test(req.data)){

                            var receive_msg = JSON.parse(req.data);

                            if(receive_msg.type === 'user'){
                              //先缓存给用户发送消息的from用户的数据，头像/昵称/ID
                              var isFrom_msg = api.getPrefs({
                                  sync: true,
                                  key: 'from_msg'
                              });
                              //如果为空，说明之前没有信息，创建这个缓存
                              if(isFrom_msg === ''){

                                //去请求from用户的信息    首次创建from用户的消息缓存
                                var from_id = receive_msg.from_user_id;
                                api.ajax({
                                    url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/'+from_id+'/info',
                                    method: 'get',
                                    headers:{
                                      "Content-Type": "application/x-www-form-urlencoded",
                                      "Authorization":"Bearer " + user_login_msg.access_token
                                    }
                                },function(ret, err){
                                    if (ret) {
                                        //得到from信息之后，得到：头像/昵称/id  进行创建缓存
                                        var arr = [];
                                        var obj = new Object();
                                        obj.imgUrl = ret.response.image;
                                        obj.fromId = ret.response.id;
                                        obj.fromName = ret.response.name;
                                        obj.msg = receive_msg.message;
                                        obj.time = receive_msg.time;
                                        obj.total = 1;
                                        arr.push(obj);
                                        console.log(JSON.stringify(arr));
                                        obj = null;
                                        //进行缓存
                                        setLocalMsg('from_msg',arr);
                                        //发送收到新消息的事件
                                        api.sendEvent({
                                            name: 'wsReceivedUserMsg',
                                            extra: {
                                                msg:receive_msg
                                            }
                                        });
                                        api.sendEvent({name: 'appMyNewsInformationBadge',extra: {key1: 'value1',}});
                                    } else {
                                        console.log( JSON.stringify( err ) );
                                    }
                                });

                              }else{
                                //如果不为空，说明这不是第一次接收到from用户的消息了，应该是取缓存，然后在原值上进行存储，数组的前面
                                //console.log('不是第一次收到from用户的消息');
                                //看缓存中存储的from用户的信息和本次收到的from是否一致，如果一致，则更新缓存信息
                                //如果一致，说明相同的用户又给当前用户发送了信息，应该去更新缓存中的信息
                                //如果不一致，则向数组前面插入一个新对象
                                //保存当前缓存中所有from用户的id
                                var from_id_arr = [];
                                for(var i = 0;i < JSON.parse(isFrom_msg).length;i++){
                                  if(parseFloat(JSON.parse(isFrom_msg)[i].fromId) === parseFloat(receive_msg.from_user_id)){
                                    var arr = JSON.parse(isFrom_msg);
                                    arr[i].msg = receive_msg.message;
                                    arr[i].time = receive_msg.time;
                                    arr[i].total = parseFloat(arr[i].total) + 1;
                                    setLocalMsg('from_msg',arr);
                                  }
                                  from_id_arr.push(parseFloat(JSON.parse(isFrom_msg)[i].fromId));
                                }

                                //如果收到的新消息本地没有缓存，则说明是新用户发来的消息，应该对缓存数组进行前入栈
                                if(from_id_arr.indexOf(parseFloat(receive_msg.from_user_id)) === -1){

                                  var from_id = receive_msg.from_user_id;
                                  api.ajax({
                                      url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/'+from_id+'/info',
                                      method: 'get',
                                      headers:{
                                        "Content-Type": "application/x-www-form-urlencoded",
                                        "Authorization":"Bearer " + user_login_msg.access_token
                                      }
                                  },function(ret, err){
                                      if (ret) {
                                          var arr = JSON.parse(isFrom_msg);
                                          //得到from信息之后，得到：头像/昵称/id  进行创建缓存
                                          var obj = new Object();
                                          obj.imgUrl = ret.response.image;
                                          obj.fromId = ret.response.id;
                                          obj.fromName = ret.response.name;
                                          obj.msg = receive_msg.message;
                                          obj.time = receive_msg.time;
                                          obj.total = 1;
                                          arr.unshift(obj);

                                          obj = null;
                                          //进行缓存
                                          setLocalMsg('from_msg',arr);
                                          //发送收到新消息的事件
                                          api.sendEvent({
                                              name: 'wsReceivedUserMsg',
                                              extra: {
                                                  msg:receive_msg
                                              }
                                          });
                                          api.sendEvent({name: 'appMyNewsInformationBadge',extra: {key1: 'value1',}});
                                      } else {
                                          console.log( JSON.stringify( err ) );
                                      }
                                  });
                                }

                              }

                              //根据from_id来进行缓存，有多少个frome_id就有多少个缓存
                              //此缓存为用户聊天记录缓存
                              //命名规则：chat_record + 对方用户id
                              var __msg = receive_msg.message;
                              var __from_id = receive_msg.from_user_id;
                              var __to_user_id = receive_msg.to_user_id;
                              var __time = receive_msg.time;


                              //设置历史记录缓存
                              var chat_record_cache = api.getPrefs({
                                  sync: true,
                                  key: 'chat_record_' + __from_id
                              });

                              if(chat_record_cache === ''){

                                var msg_obj = new Object();
                                msg_obj.msg = __msg;
                                msg_obj.from_id = __from_id;
                                msg_obj.to_user_id = __to_user_id;
                                msg_obj.time = __time;
                                msg_obj.type = 'left';
                                cache_arr.push(msg_obj);
                                msg_obj = null;
                                setLocalMsg('chat_record_' + __from_id,cache_arr);
                              }else{
                                var __msg_arr = JSON.parse(chat_record_cache);
                                var msg_obj = new Object();
                                msg_obj.msg = __msg;
                                msg_obj.from_id = __from_id;
                                msg_obj.to_user_id = __to_user_id;
                                msg_obj.time = __time;
                                msg_obj.type = 'left';
                                __msg_arr.push(msg_obj);
                                msg_obj = null;
                                setLocalMsg('chat_record_' + __from_id,__msg_arr);
                              }

                              //发送收到新消息的事件
                              api.sendEvent({
                                  name: 'wsReceivedUserMsg',
                                  extra: {
                                      msg:receive_msg
                                  }
                              });
                              api.sendEvent({name: 'appMyNewsInformationBadge',extra: {key1: 'value1',}});

                            }

                            if(receive_msg.type === 'system'){
                              //当受到系统消息的时候，将系统消息进行缓存

                              try {var system_msg_cache = JSON.parse(api.getPrefs({sync: true,key: 'system_msg'}));} catch (e) {};
                              if(system_msg_cache === undefined){
                                var system_msg_arr = [];
                                system_msg_arr.push(receive_msg.message);
                                setLocalMsg('system_msg',system_msg_arr);
                              }else{
                                system_msg_cache.push(receive_msg.message);
                                setLocalMsg('system_msg',system_msg_cache);
                              }



                              //发送服务器推送消息
                              api.sendEvent({
                                  name: 'wsReceivedServerMsg',
                                  extra: {
                                      msg:receive_msg
                                  }
                              });
                              //刷新系统消息列表页面
                              api.sendEvent({
                                  name: 'RefreshSystemMsgList',
                                  extra: {
                                      msg:'刷新系统消息列表页面'
                                  }
                              });


                              api.notification({
                                  notify: {
                                      title:'有新的通知',
                                      content:receive_msg.message
                                  }
                              }, function(ret, err) {
                                  var id = ret.id;
                              });



                            }

                          }
                        }

                      }

                  } else {
                      //console.log( JSON.stringify( err ) );
                      //访问info出错就说明Bearer不能用，不能用就是没有认证，没有认证就提示取个人中心认证
                      api.toast({
                          msg: '您的个人信息不完善，请去个人中心完善信息！(用户头像，实名认证等)',
                          duration: 10000,
                          location: 'top'
                      });

                      //同时缓存用户是否认证的缓存字段
                      setLocalMsg('user_authentication_msg',{
                        isAuth:false
                      });
                  }
              });





            }else{
              console.log('没有登录');
              return;
            }
          }else{
              console.log('取登录缓存出错');
          }
      });






      //优化点击事件
      api.parseTapmode();
      //设置状态栏
      api.setFullScreen({fullScreen: true});
      /*页面加载的时候打开一个frame组*/
      api.openFrameGroup ({
          name: 'appFrame',
          background: '#fff',
          scrollEnabled: false,
          rect: {
               x: 0,
               y: 0,
               w: 'auto',
               h: 'auto',
               marginBottom:55
          },
          preload:5,
          overScrollMode:'scrolls',
          index: 0,
          frames: [{
              name: 'homePage',
              url: './html/homePage.html',
              bgColor: '#fff'
          },{
              name: 'userNeighBorhood',
              url: './html/userNeighBorhood.html',
              bgColor: '#fff'
          },{
              name: 'userRelease',
              url: './html/userRelease.html',
              bgColor: '#fff'
          },{
              name: 'userOrder',
              url: './html/userOrder.html',
              bgColor: '#fff'
          },{
              name: 'userCore',
              url: './html/userCore.html',
              bgColor: '#fff'
          }]
      }, function(ret, err){
          if( ret ){
              //显示frame内部的变化，第几个是当前显示的
               //console.log( JSON.stringify( ret ) );
          }else{
              //打开frame组的时候出错
               //console.log( JSON.stringify( err ) );
          }
      });


      //始化程序入口底部的导航栏
      var NVTabBar = api.require('NVTabBar');
      NVTabBar.open({
          styles: {
              bg: '#f6f6f6',
              h: 55,
              dividingLine: {
                  width: 0.5,
                  color: '#c0c0c0'
              },
              badge: {
                  bgColor: '#ff0',
                  numColor: '#39f',
                  size: 10.0,
                  fontSize:10 //数字类型,设置徽章字体大小,默认10。注意:仅支持iOS。
              }
          },
          items: [
              {
                w: api.winWidth / 5.0,
                bg: {
                    marginB: 0,
                    image: 'rgba(0,0,0,0)'
                },
                iconRect: {
                    w: 24.0,
                    h: 24.0,
                },
                icon: {
                    normal: 'widget://image/tabBaricon/shouye.png',
                    highlight: 'widget://image/tabBaricon/shouyehover.png',
                    selected: 'widget://image/tabBaricon/shouyehover.png'
                },
                title: {
                    text: '首页',
                    size: 14.0,
                    normal: '#696969',
                    selected: '#39f',
                    marginB: 6.0
                }
              },
              {
                w: api.winWidth / 5.0,
                bg: {
                    marginB: 0,
                    image: 'rgba(0,0,0,0)'
                },
                iconRect: {
                    w: 24.0,
                    h: 24.0,
                },
                icon: {
                  normal: 'widget://image/tabBaricon/fujin.png',
                  highlight: 'widget://image/tabBaricon/fujinhover.png',
                  selected: 'widget://image/tabBaricon/fujinhover.png'
                },
                title: {
                    text: '全部',
                    size: 14.0,
                    normal: '#696969',
                    selected: '#39f',
                    marginB: 6.0
                }
              },
              {
                w: api.winWidth / 5.0,
                bg: {
                    marginB: 0,
                    image: 'rgba(0,0,0,0)'
                },
                iconRect: {
                    w: 24.0,
                    h: 24.0,
                },
                icon: {
                  normal: 'widget://image/tabBaricon/fabu.png',
                  highlight: 'widget://image/tabBaricon/fabuhover.png',
                  selected: 'widget://image/tabBaricon/fabuhover.png'
                },
                title: {
                    text: '发布',
                    size: 14.0,
                    normal: '#696969',
                    selected: '#39f',
                    marginB: 6.0
                }
              },
              {
                w: api.winWidth / 5.0,
                bg: {
                    marginB: 0,
                    image: 'rgba(0,0,0,0)'
                },
                iconRect: {
                    w: 24.0,
                    h: 24.0,
                },
                icon: {
                  normal: 'widget://image/tabBaricon/dingdan.png',
                  highlight: 'widget://image/tabBaricon/dingdanhover.png',
                  selected: 'widget://image/tabBaricon/dingdanhover.png'
                },
                title: {
                    text: '订单',
                    size: 14.0,
                    normal: '#696969',
                    selected: '#39f',
                    marginB: 6.0
                }
              },
              {
                w: api.winWidth / 5.0,
                bg: {
                    marginB: 0,
                    image: 'rgba(0,0,0,0)'
                },
                iconRect: {
                    w: 24.0,
                    h: 24.0,
                },
                icon: {
                  normal: 'widget://image/tabBaricon/wode.png',
                  highlight: 'widget://image/tabBaricon/wodehover.png',
                  selected: 'widget://image/tabBaricon/wodehover.png'
                },
                title: {
                    text: '我的',
                    size: 14.0,
                    normal: '#696969',
                    selected: '#39f',
                    marginB: 6.0
                }
              },
          ],
          selectedIndex: 0
      }, function(ret, err) {
          if (ret) {
              var index = ret.index;
              switch (index) {
                case 0:
                  api.setFrameGroupIndex({
                      name:'appFrame',
                      index:0
                  });
                  break;
                case 1:
                  api.getPrefs({
                      key: 'user_login_status'
                  }, function(ret, err){
                      if( ret ){
                          //判断取值是否为空，如果为空则未登录
                          if(ret.value === ''){
                            //用户未登录，直接去登录页面
                            api.openWin({
                                name: 'signin',
                                slidBackEnabled:false,
                                url: './html/signin.html'
                            });
                          }else{
                            api.setFrameGroupIndex({
                                name:'appFrame',
                                index:1
                            });
                          }
                      }else{
                           console.log( JSON.stringify( err ) );
                      }
                  });

                  break;
                case 2:
                  api.setFrameGroupIndex({
                      name:'appFrame',
                      reload:true,
                      index:2
                  });
                  break;
                case 3:
                  api.getPrefs({
                      key: 'user_login_status'
                  }, function(ret, err){
                      if( ret ){
                          //判断取值是否为空，如果为空则未登录
                          if(ret.value === ''){
                            //用户未登录，直接去登录页面
                            api.openWin({
                                name: 'signin',
                                slidBackEnabled:false,
                                url: 'widget://html/signin.html'
                            });
                          }else{
                            api.setFrameGroupIndex({
                                name:'appFrame',
                                index:3
                            });
                          }
                      }else{
                           console.log( JSON.stringify( err ) );
                      }
                  });
                  break;
                case 4:
                  api.getPrefs({
                      key: 'user_login_status'
                  }, function(ret, err){
                      if( ret ){
                          //判断取值是否为空，如果为空则未登录
                          if(ret.value === ''){
                            //用户未登录，直接去登录页面
                            api.openWin({
                                name: 'signin',
                                slidBackEnabled:false,
                                url: 'widget://html/signin.html'
                            });
                          }else{
                            api.setFrameGroupIndex({
                                name:'appFrame',
                                index:4
                            });
                          }
                      }else{
                           console.log( JSON.stringify( err ) );
                      }
                  });
                  break;
                default:
                  return;
              }
          }else{
            console.log(err);
          }
      });
      //监听homePage页面的分类点击事件，渲染委托列表
      api.addEventListener({
          name: 'select_class'
      }, function(ret, err){
          if( ret ){
            NVTabBar.setSelect({
                index: 1,
                selected: true
            });
          }else{
            console.log( JSON.stringify( err ) );
          }
      });

  };
} catch (e) {
  console.log(e);
}
